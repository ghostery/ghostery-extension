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
  if (ua) return ua;

  ua = Bowser.parse(navigator.userAgent);
  return ua;
}

export function getBrowser() {
  if (__PLATFORM__ === 'safari') {
    return { browser: 'Safari', name: 'safari', token: 'sf' };
  }

  if (__PLATFORM__ === 'firefox') {
    return { browser: 'Firefox', name: 'firefox', token: 'ff' };
  }

  if (__PLATFORM__ === 'chromium') {
    // Brave's user agent detects as `Chrome`,
    // so we need to check for Brave specifically
    if (navigator.brave?.isBrave) {
      return { browser: 'Brave', name: 'brave', token: 'br' };
    }

    // INFO: bowser detects Oculus as `Chrome`,
    // so we need to check for OculusBrowser specifically before Chrome
    if (navigator.userAgent.includes('OculusBrowser')) {
      return { browser: 'Oculus', name: 'oculus', token: 'oc' };
    }

    const browser = getUA().browser.name;

    if (browser.includes('Chrome')) {
      return { browser: 'Chrome', name: 'chrome', token: 'ch' };
    }

    if (browser.includes('Edge')) {
      return { browser: 'Edge', name: 'edge', token: 'ed' };
    }

    if (browser.includes('Opera')) {
      return { browser: 'Opera', name: 'opera', token: 'op' };
    }

    if (browser.includes('Yandex')) {
      return { browser: 'Yandex', name: 'yandex', token: 'yx' };
    }

    return {
      browser,
      name: browser.toLowerCase().replace(/\s+/g, '_'),
      token: '',
    };
  }
}

export function isFirefox() {
  return getBrowser().browser === 'Firefox';
}

export function isEdge() {
  return getBrowser().browser === 'Edge';
}

export function isOpera() {
  return getBrowser().browser === 'Opera';
}

export function getOS() {
  // Make sure that undefined operating systems don't mess with stuff like .includes()
  const platform = getUA().os?.name?.toLowerCase() || '';

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

let browserInfo = null;
export default async function getBrowserInfo() {
  if (browserInfo) return browserInfo;

  const ua = getUA();
  const { browser, name, token } = getBrowser();

  browserInfo = {
    browser,
    name,
    token,
    version: parseInt(ua.browser.version, 10),
    os: getOS(),
    osVersion: ua.os.version || '',
  };

  if (
    __PLATFORM__ === 'safari' &&
    browserInfo.os === 'mac' &&
    (await chrome.runtime.getPlatformInfo()).os === 'ios'
  ) {
    browserInfo.os = 'ipados';
  }

  // Check for Ghostery browsers
  if (__PLATFORM__ === 'firefox') {
    const extendedBrowserInfo = await chrome.runtime.getBrowserInfo();

    if (extendedBrowserInfo.name === 'Ghostery') {
      if (browserInfo.os === 'android') {
        Object.assign(browserInfo, {
          browser: 'Ghostery Android Browser',
          name: 'ghostery_android',
          token: 'ga',
          version: extendedBrowserInfo.version,
        });
      } else {
        Object.assign(browserInfo, {
          browser: 'Ghostery Desktop Browser',
          name: 'ghostery_desktop',
          token: 'gd',
          version: browserInfo.version.split('.').join(''),
        });
      }
    }
  }

  return browserInfo;
}
