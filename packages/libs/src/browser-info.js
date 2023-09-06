import parser from 'ua-parser-js';

// we cache the UA as it used by many modules that need it on file load
let ua;
const getUA = () => {
  if (ua) {
    return ua;
  }
  ua = parser(navigator.userAgent);
  return ua;
};

async function getExtendedBrowserInfo() {
  try {
    return chrome.runtime.getBrowserInfo();
  } catch (e) {
    return null;
  }
}

function getPlatformInfo() {
  if (typeof chrome.runtime.getPlatformInfo === 'function') {
    return new Promise((resolve) => {
      chrome.runtime.getPlatformInfo((info) => {
        if (chrome.runtime.lastError) {
          resolve(null);
          return;
        }
        resolve(info);
      });
    });
  }
  return Promise.resolve(null);
}

const getOS = () => {
  const ua = getUA();
  const platform = ua.os?.name?.toLowerCase() || ''; // Make sure that undefined operating systems don't mess with stuff like .includes()
  if (platform.includes('mac')) {
    return 'mac';
  } else if (platform.includes('win')) {
    return 'win';
  } else if (platform.includes('android')) {
    return 'android';
  } else if (platform.includes('ios')) {
    return 'ios';
  } else if (platform.includes('chromium os')) {
    return 'cros';
  } else if (platform.includes('bsd')) {
    return 'openbsd';
  } else if (platform.includes('linux')) {
    return 'linux';
  }
  return 'other';
};

const getBrowser = () => {
  const ua = getUA();
  return ua.browser.name.toLowerCase();
};

const isAndroid = () => {
  return getOS() === 'android';
};

const isFirefox = () => {
  const browser = getBrowser();
  return browser.includes('firefox');
};

const isEdge = () => {
  const browser = getBrowser();
  return browser.includes('edge');
};

const getVersion = () => {
  const ua = getUA();
  return parseInt(ua.browser.version.toString(), 10); // convert to string for Chrome
};

const getBrowserInfo = async () => {
  const BROWSER_INFO = {
    displayName: '',
    name: '',
    token: '',
    os: '',
    version: '',
  };

  // Set name and token properties. CMP uses `name` value.  Metrics uses `token`
  const browser = getBrowser();
  if (browser.includes('edge')) {
    BROWSER_INFO.displayName = 'Edge';
    BROWSER_INFO.name = 'edge';
    BROWSER_INFO.token = 'ed';
  } else if (browser.includes('opera')) {
    BROWSER_INFO.displayName = 'Opera';
    BROWSER_INFO.name = 'opera';
    BROWSER_INFO.token = 'op';
  } else if (browser.includes('chrome')) {
    BROWSER_INFO.displayName = 'Chrome';
    BROWSER_INFO.name = 'chrome';
    BROWSER_INFO.token = 'ch';
  } else if (browser.includes('firefox')) {
    BROWSER_INFO.displayName = 'Firefox';
    BROWSER_INFO.name = 'firefox';
    BROWSER_INFO.token = 'ff';
  } else if (browser.includes('yandex')) {
    BROWSER_INFO.displayName = 'Yandex';
    BROWSER_INFO.name = 'yandex';
    BROWSER_INFO.token = 'yx';
  } else if (browser.includes('safari')) {
    BROWSER_INFO.displayName = 'Safari';
    BROWSER_INFO.name = 'safari';
    BROWSER_INFO.token = 'sf';
  }

  // Set OS property
  BROWSER_INFO.os = getOS();

  // Set version property
  BROWSER_INFO.version = getVersion();

  // Check for Ghostery browsers
  const browserInfo = await getExtendedBrowserInfo();
  if (browserInfo && browserInfo.name === 'Ghostery') {
    if (BROWSER_INFO.os === 'android') {
      BROWSER_INFO.displayName = 'Ghostery Android Browser';
      BROWSER_INFO.name = 'ghostery_android';
      BROWSER_INFO.token = 'ga';
      BROWSER_INFO.version = browserInfo.version;
    } else {
      BROWSER_INFO.displayName = 'Ghostery Desktop Browser';
      BROWSER_INFO.name = 'ghostery_desktop';
      BROWSER_INFO.token = 'gd';
      BROWSER_INFO.version = browserInfo.version.split('.').join('');
    }
  }

  const platformInfo = await getPlatformInfo();
  if (platformInfo && platformInfo.os === 'ios' && BROWSER_INFO.os === 'mac') {
    BROWSER_INFO.os = 'ipados';
  }

  return BROWSER_INFO;
};

let browserInfo;
const cachedGetBrowserInfo = async () => {
  if (browserInfo) {
    return browserInfo;
  }
  browserInfo = await getBrowserInfo();
  return browserInfo;
};

cachedGetBrowserInfo.isAndroid = isAndroid;
cachedGetBrowserInfo.isFirefox = isFirefox;
cachedGetBrowserInfo.isEdge = isEdge;
cachedGetBrowserInfo.isGhosteryBrowser = async () => {
  const browserInfo = await cachedGetBrowserInfo();
  if (!browserInfo.name) {
    return false;
  }
  return browserInfo.name.includes('ghostery');
};

export default cachedGetBrowserInfo;
