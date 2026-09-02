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

  // Safari on all platforms is WebKit
  if (isSafari()) return true;

  // All browsers on iOS/iPadOS are WebKit, so we can use the OS to identify them
  const os = getOS();
  return os === 'ios' || os === 'ipados';
}

export function isMobile() {
  const os = getOS();
  return os === 'android' || os === 'ios' || os === 'ipados';
}

export function getOS() {
  // Make sure that undefined operating systems don't mess with stuff like .includes()
  const os = getUA().os?.name?.toLowerCase() || '';

  if (os.includes('mac')) {
    // All iOS/iPadOS browsers use WebKit and can spoof a Mac desktop user-agent on iPadOS.
    if (navigator.maxTouchPoints > 1) return 'ipados';
    return 'mac';
  } else if (os.includes('win')) {
    return 'win';
  } else if (os.includes('android')) {
    return 'android';
  } else if (os.includes('ios')) {
    if (navigator.platform?.toLocaleLowerCase() === 'ipad') return 'ipados';
    return 'ios';
  } else if (os.includes('chromium os')) {
    return 'cros';
  } else if (os.includes('bsd')) {
    return 'openbsd';
  } else if (os.includes('linux')) {
    return 'linux';
  }

  return 'other';
}

let browserInfo = null;
export default function getBrowserInfo() {
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

  return browserInfo;
}
