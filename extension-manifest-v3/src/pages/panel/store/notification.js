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

import { shouldShowOperaSerpAlert } from '/notifications/opera-serp.js';

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
  contributor:
    __PLATFORM__ !== 'safari'
      ? {
          icon: 'heart',
          type: '',
          text: msg`Hey, do you enjoy Ghostery and want to support our work?`,
          url: 'https://www.ghostery.com/become-a-contributor?utm_source=gbe',
          action: msg`Become a Contributor`,
        }
      : null,
  opera: {
    icon: 'logo-opera',
    type: 'warning',
    text: msg`Expand Ghostery ad blocking to search engines in a few easy steps.`,
    url: 'https://www.ghostery.com/blog/block-search-engine-ads-on-opera-guide?utm_source=gbe&utm_campaign=opera_serp',
    action: msg`Enable Ad Blocking Now`,
  },
  globalPause: {
    icon: 'pause',
    type: '',
    text: msg`Missing the global pause feature? It is in the privacy settings now.`,
    url: chrome.runtime.getURL(
      '/pages/settings/index.html#@gh-settings-privacy',
    ),
    action: msg`Open settings`,
  },
};

export default {
  icon: '',
  type: '',
  text: '',
  url: '',
  action: '',
  [store.connect]: async () => {
    if (__PLATFORM__ === 'opera' && (await shouldShowOperaSerpAlert())) {
      return NOTIFICATIONS.opera;
    }

    if ((await store.resolve(Session)).contributor) {
      return NOTIFICATIONS.globalPause;
    }

    return !(await store.resolve(Options)).terms
      ? NOTIFICATIONS.terms
      : NOTIFICATIONS.globalPause;
  },
};
