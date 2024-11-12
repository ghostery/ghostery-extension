/**
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2017-present Ghostery GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import Bowser from 'bowser';

// we cache the UA as it used by many modules that need it on file load
let ua;
function getUA() {
  if (ua) {
    return ua;
  }
  ua = Bowser.parse(navigator.userAgent);
  return ua;
}

async function getExtendedBrowserInfo() {
  try {
    return chrome.runtime.getBrowserInfo();
  } catch {
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

function getOS() {
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
}

function isAndroid() {
  return getOS() === 'android';
}

function getBrowser() {
  const ua = getUA();
  return ua.browser.name.toLowerCase();
}

function isFirefox() {
  const browser = getBrowser();
  return browser.includes('firefox');
}

export function isEdge() {
  const browser = getBrowser();
  return browser.includes('edge');
}

export function isOpera() {
  const browser = getBrowser();
  return browser.includes('opera');
}

function isSafari() {
  const browser = getBrowser();
  return browser.includes('safari');
}

export function getBrowserId() {
  if (isFirefox()) return 'firefox';
  if (isEdge()) return 'edge';
  if (isOpera()) return 'opera';
  if (isSafari()) return 'safari';

  return 'chrome';
}

async function getBrowserInfo() {
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
  BROWSER_INFO.version = parseInt(getUA().browser.version.toString(), 10); // convert to string for Chrome

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
}

let browserInfo;
async function cachedGetBrowserInfo() {
  if (browserInfo) {
    return browserInfo;
  }
  browserInfo = await getBrowserInfo();
  return browserInfo;
}

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

// Provides direct access to the results of the parsing library.
// The results are not sanitized; thus, more care should be taken
// before sharing this information.
//
// Note:
// * the primary use case is for alive-signals (and they
//   will check with the quorum service first before sharing)
cachedGetBrowserInfo.getRawBrowserInfo = async () => {
  const ua = getUA();
  const browserInfo = await getExtendedBrowserInfo();

  const info = {};
  if (browserInfo?.name === 'Ghostery') {
    info.browser = browserInfo?.displayName || 'Ghostery';
    info.version = browserInfo?.version ?? null;
  } else {
    info.browser = ua.browser?.name || null;
    info.version = ua.browser?.version || null;
  }
  info.os = ua.os?.name || null;
  info.platform = ua.platform?.type || null;
  return info;
};

export default cachedGetBrowserInfo;
