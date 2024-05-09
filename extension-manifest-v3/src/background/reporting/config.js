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

function platformSpecificSettings() {
  if (
    /iPad|iPhone|iPod/.test(navigator.platform) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  ) {
    // Ghostery extension for Safari on iOS and other Apple mobile devices
    return {
      ALLOWED_COUNTRY_CODES: ['us', 'de', 'fr'],
      PATTERNS_URL: 'https://cdn2.ghostery.com/wtm-safari-ios/patterns.json',
      CHANNEL: 'safari-ios',
    };
  }

  if (
    /Safari/i.test(navigator.userAgent) &&
    /Apple Computer/.test(navigator.vendor) &&
    !/Mobi|Android/i.test(navigator.userAgent)
  ) {
    // Ghostery extension for Safari on MacOS (Desktop)
    return {
      ALLOWED_COUNTRY_CODES: ['us', 'de', 'fr'],
      PATTERNS_URL:
        'https://cdn2.ghostery.com/wtm-safari-desktop/patterns.json',
      CHANNEL: 'safari-desktop',
    };
  }

  if (navigator.userAgent.includes('Android')) {
    return {
      ALLOWED_COUNTRY_CODES: ['us', 'de', 'fr'],
      PATTERNS_URL:
        'https://cdn2.ghostery.com/wtm-ghostery-android/patterns.json',
      CHANNEL: 'android',
    };
  }

  if (
    navigator.userAgent.includes('Opera') ||
    navigator.userAgent.includes('OPR') ||
    navigator.userAgent.includes('YaBrowser') // same release channel as Opera
  ) {
    return {
      ALLOWED_COUNTRY_CODES: [
        'us',
        'de',
        'ru',
        'fr',
        'pl',
        'gb',
        'br',
        'ca',
        'ua',
        'nl',
        'es',
      ],
      PATTERNS_URL: 'https://cdn2.ghostery.com/wtm-opera-desktop/patterns.json',
      CHANNEL: 'opera',
    };
  }

  console.warn(
    'No matching config found. Falling back to patterns from Chrome Desktop.',
  );
  return {
    ALLOWED_COUNTRY_CODES: ['us', 'de', 'fr'],
    PATTERNS_URL: 'https://cdn2.ghostery.com/wtm-chrome-desktop/patterns.json',
    CHANNEL: 'ghostery',
  };
}

const COLLECTOR_DIRECT_URL = 'https://anonymous-communication.ghostery.net';
const COLLECTOR_PROXY_URL = COLLECTOR_DIRECT_URL; // current we have no proxy configured

export default {
  url: {
    COLLECTOR_DIRECT_URL,
    COLLECTOR_PROXY_URL,
    CONFIG_URL: 'https://api.ghostery.net/api/v1/config',
    SAFE_QUORUM_CONFIG_ENDPOINT:
      'https://safe-browsing-quorum.privacy.ghostery.net/config',
    ...platformSpecificSettings(),
  },
  request: {
    configUrl: 'https://cdn.ghostery.com/antitracking/config.json',
    remoteWhitelistUrl: 'https://cdn.ghostery.com/antitracking/whitelist/2',
    localWhitelistUrl: '/rule_resources/whotracksme',
  },
};