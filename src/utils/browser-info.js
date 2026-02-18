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
  if (__FIREFOX__) {
    return { name: 'firefox', token: 'ff' };
  }

  if (__CHROMIUM__) {
    // Brave's user agent detects as `Chrome`,
    // so we need to check for Brave specifically
    if (navigator.brave?.isBrave) {
      return { name: 'brave', token: 'br' };
    }

    // INFO: bowser detects Oculus as `Chrome`,
    // so we need to check for OculusBrowser specifically before Chrome
    if (navigator.userAgent.includes('OculusBrowser')) {
      return { name: 'oculus', token: 'oc' };
    }

    const browser = getUA().browser.name;

    if (browser.includes('Safari')) {
      return { name: 'safari', token: 'sf' };
    }

    if (browser.includes('Chrome')) {
      return { name: 'chrome', token: 'ch' };
    }

    if (browser.includes('Edge')) {
      return { name: 'edge', token: 'ed' };
    }

    if (browser.includes('Opera')) {
      return { name: 'opera', token: 'op' };
    }

    if (browser.includes('Yandex')) {
      return { name: 'yandex', token: 'yx' };
    }

    return {
      name: browser.toLowerCase().replace(/\s+/g, '_'),
      token: '',
    };
  }
}

export function isBrave() {
  return getBrowser().name === 'brave';
}

export function isFirefox() {
  return getBrowser().name === 'firefox';
}

export function isEdge() {
  return getBrowser().name === 'edge';
}

export function isOpera() {
  return getBrowser().name === 'opera';
}

export function isSafari() {
  return getBrowser().name === 'safari';
}

export function isOculus() {
  return getBrowser().name === 'oculus';
}

export function isWebkit() {
  if (__FIREFOX__) return false;

  // Edge on iPadOS has OS detected as `ios`
  if (isSafari() || getOS() === 'ios') return true;

  return false;
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

export function isMobile() {
  const os = getOS();
  return os === 'android' || os === 'ios';
}

let browserInfo = null;
export default async function getBrowserInfo() {
  if (browserInfo) return browserInfo;

  const ua = getUA();
  const { name, token } = getBrowser();

  browserInfo = {
    name,
    token,
    version: parseInt(ua.browser.version, 10),
    os: getOS(),
    osVersion: ua.os.version || '',
  };

  if (
    __CHROMIUM__ &&
    browserInfo.os === 'mac' &&
    chrome.runtime.getPlatformInfo &&
    (await chrome.runtime.getPlatformInfo()).os === 'ios'
  ) {
    browserInfo.os = 'ipados';
  }

  return browserInfo;
}
