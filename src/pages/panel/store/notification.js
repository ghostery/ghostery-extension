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

import { store, msg } from 'hybrids';

import Options from '/store/options.js';
import Session from '/store/session.js';

import { isSerpSupported } from '/utils/opera.js';
import { isOpera, isEdge } from '/utils/browser-info.js';

const NOTIFICATIONS = {
  terms: {
    icon: 'triangle',
    type: 'warning',
    text: msg`Due to browser restrictions and additional permissions missing, Ghostery is not able to protect you.`,
    url:
      __PLATFORM__ === 'safari'
        ? 'https://www.ghostery.com/blog/how-to-install-extensions-in-safari?utm_source=gbe'
        : 'https://www.ghostery.com/support?utm_source=gbe',
    action: msg`Get help`,
  },
  opera: {
    icon: 'logo-opera',
    type: 'warning',
    text: msg`Expand Ghostery ad blocking to search engines in a few easy steps.`,
    url: 'https://www.ghostery.com/blog/block-search-engine-ads-on-opera-guide?utm_source=gbe&utm_campaign=opera_serp',
    action: msg`Enable Ad Blocking Now`,
  },
  review: {
    icon: 'call-for-review',
    type: 'review',
    text: msg`We're so glad Ghostery has your heart! Help others find us too - it only takes a moment.`,
    url: (() => {
      if (__PLATFORM__ === 'safari') {
        return 'https://mygho.st/ReviewSafariPanel';
      }

      if (__PLATFORM__ === 'firefox') {
        return 'https://mygho.st/ReviewFirefoxPanel';
      }

      // Chromium-based browsers

      if (isOpera()) {
        return 'https://mygho.st/ReviewOperaPanel';
      }

      if (isEdge()) {
        return 'https://mygho.st/ReviewEdgePanel';
      }

      // Chrome
      return 'https://mygho.st/ReviewChromePanel';
    })(),
    action: msg`Leave a review today`,
  },
};

const CONTRIBUTOR_NOTIFICATION = {
  icon: 'heart',
  type: '',
  text: msg`Hey, do you enjoy Ghostery and want to support our work?`,
  url: 'https://www.ghostery.com/become-a-contributor?utm_source=gbe',
  action: msg`Become a Contributor`,
};

export default {
  icon: '',
  type: '',
  text: '',
  url: '',
  action: '',
  [store.connect]: async () => {
    // Enable extension
    if (!(await store.resolve(Options)).terms) return NOTIFICATIONS.terms;

    // Opera SERP support
    if (
      __PLATFORM__ === 'chromium' &&
      isOpera() &&
      !(await isSerpSupported())
    ) {
      return NOTIFICATIONS.opera;
    }

    // Randomly show review notification (50% chance)
    if (Math.random() < 0.5) {
      return NOTIFICATIONS.review;
    }

    // Show contributor notification if user is not a contributor
    if (
      __PLATFORM__ !== 'safari' &&
      !(await store.resolve(Session)).contributor
    ) {
      return CONTRIBUTOR_NOTIFICATION;
    }

    // By default, show review notification
    return NOTIFICATIONS.review;
  },
};
