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
import { isEdge, isMobile, isOpera, isSafari } from '/utils/browser-info.js';
import { BECOME_A_CONTRIBUTOR_PAGE_URL, REVIEW_PAGE_URL } from '/utils/urls';

import callForReviewImage from '../assets/call-for-review.svg';
import edgeMobileQrCodeImage from '../assets/edge-mobile-qr-code.svg';

export const images = [callForReviewImage, edgeMobileQrCodeImage];

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
  edgeMobile: {
    img: edgeMobileQrCodeImage,
    type: 'image',
    text: msg`Android and iPhone just got a new Edge. Ghostery included.`,
    url: 'https://edgemobileapp.microsoft.com/desktop/index.html?adjustId=1rdtsg4d_1rzcoul8',
    action: msg`Scan and take Ghostery from desktop to mobile`,
  },
  review: {
    img: callForReviewImage,
    type: 'review',
    text: msg`We're so glad Ghostery has your heart! Help others find us too - it only takes a moment.`,
    url: REVIEW_PAGE_URL,
    action: msg`Leave a review today`,
  },
  contribution: {
    icon: 'heart',
    type: '',
    text: msg`Hey, do you enjoy Ghostery and want to support our work?`,
    url: `${BECOME_A_CONTRIBUTOR_PAGE_URL}?utm_source=gbe&utm_campaign=panel-becomeacontributor`,
    action: msg`Become a Contributor`,
  },
};

const randomize = Math.random();

const Notification = {
  icon: '',
  img: '',
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

    // Edge mobile notification for Edge desktop users
    if (isEdge() && !isMobile()) {
      return NOTIFICATIONS.edgeMobile;
    }

    // Randomly show review notification (50% chance)
    if (randomize < 0.5) {
      return NOTIFICATIONS.review;
    }

    return NOTIFICATIONS.contribution;
  },
};

export default Notification;
