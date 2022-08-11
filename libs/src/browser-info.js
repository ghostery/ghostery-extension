import parser from 'ua-parser-js';

/**
 * Check for information about this browser (FF only)
 * @private
 * @return {Promise}
 */
function _checkBrowserInfo() {
  if (typeof chrome.runtime.getBrowserInfo === 'function') {
    return chrome.runtime.getBrowserInfo();
  }
  return Promise.resolve(false);
}

function _checkPlatformInfo() {
  if (typeof chrome.runtime.getPlatformInfo === 'function') {
    return new Promise((resolve) => {
      chrome.runtime.getPlatformInfo((info) => {
        resolve(info);
      });
    });
  }
  return Promise.resolve(false);
}

const getBrowserInfo = async () => {
  const ua = parser(navigator.userAgent);
  const browser = ua.browser.name.toLowerCase();
  const version = parseInt(ua.browser.version.toString(), 10); // convert to string for Chrome
  const platform = ua.os?.name?.toLowerCase() || ''; // Make sure that undefined operating systems don't mess with stuff like .includes()

  const BROWSER_INFO = {};

  // Set name and token properties. CMP uses `name` value.  Metrics uses `token`
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
  if (platform.includes('mac')) {
    BROWSER_INFO.os = 'mac';
  } else if (platform.includes('win')) {
    BROWSER_INFO.os = 'win';
  } else if (platform.includes('linux')) {
    BROWSER_INFO.os = 'linux';
  } else if (platform.includes('android')) {
    BROWSER_INFO.os = 'android';
  } else if (platform.includes('iOS')) {
    BROWSER_INFO.os = 'ios';
  }

  // Set version property
  BROWSER_INFO.version = version;

  // Check for Ghostery browsers
  const browserInfo = await _checkBrowserInfo();
  if (browserInfo && browserInfo.name === 'Ghostery') {
    if (platform.includes('android')) {
      BROWSER_INFO.displayName = 'Ghostery Android Browser';
      BROWSER_INFO.name = 'ghostery_android';
      BROWSER_INFO.token = 'ga';
      BROWSER_INFO.os = 'android';
      BROWSER_INFO.version = browserInfo.version;
    } else {
      BROWSER_INFO.displayName = 'Ghostery Desktop Browser';
      BROWSER_INFO.name = 'ghostery_desktop';
      BROWSER_INFO.token = 'gd';
      BROWSER_INFO.version = browserInfo.version.split('.').join('');
    }
  }

  const platformInfo = await _checkPlatformInfo();
  if (platformInfo && platformInfo.os === 'ios' && BROWSER_INFO.os === 'mac') {
    BROWSER_INFO.os = 'ipados';
  }

  return BROWSER_INFO;
};

export default getBrowserInfo;
