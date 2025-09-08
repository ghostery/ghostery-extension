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

import { isSerpSupported } from '/utils/opera.js';
import { isOpera, isSafari } from '/utils/browser-info.js';
import { BECOME_A_CONTRIBUTOR_PAGE_URL, REVIEW_PAGE_URL } from '/utils/urls';

const NOTIFICATIONS = {
  terms: {
    icon: 'triangle',
    type: 'danger',
    text: msg`Due to browser restrictions and additional permissions missing, Ghostery is not able to protect you.`,
    url: isSafari()
      ? 'https://www.ghostery.com/blog/how-to-install-extensions-in-safari?utm_source=gbe&utm_campaign=safaripermissions'
      : 'https://www.ghostery.com/support?utm_source=gbe&utm_campaign=permissions',
    action: msg`Get help`,
  },
  opera: {
    icon: 'logo-opera',
    type: 'danger',
    text: msg`Expand Ghostery ad blocking to search engines in a few easy steps.`,
    url: 'https://www.ghostery.com/blog/block-search-engine-ads-on-opera-guide?utm_source=gbe&utm_campaign=opera_serp',
    action: msg`Enable Ad Blocking Now`,
  },
  review: {
    icon: 'call-for-review',
    type: 'review',
    text: msg`We're so glad Ghostery has your heart! Help others find us too - it only takes a moment.`,
    url: REVIEW_PAGE_URL,
    action: msg`Leave a review today`,
  },
};

const CONTRIBUTOR_NOTIFICATION = {
  icon: 'heart',
  type: '',
  text: msg`Hey, do you enjoy Ghostery and want to support our work?`,
  url: `${BECOME_A_CONTRIBUTOR_PAGE_URL}?utm_source=gbe&utm_campaign=panel-becomeacontributor`,
  action: msg`Become a Contributor`,
};

const Notification = {
  icon: '',
  type: '',
  text: '',
  url: '',
  action: '',
  [store.connect]: async () => {
    const { terms, panel } = await store.resolve(Options);

    // Enable extension notification
    if (!terms) return NOTIFICATIONS.terms;

    // Opera SERP support notification
    if (__PLATFORM__ !== 'firefox' && isOpera() && !(await isSerpSupported())) {
      return NOTIFICATIONS.opera;
    }

    // Disabled in-panel notifications
    if (!panel.notifications) return null;

    // Randomly show review notification (50% chance)
    if (Math.random() < 0.5) {
      return NOTIFICATIONS.review;
    }

    return CONTRIBUTOR_NOTIFICATION;
  },
};

export default Notification;
