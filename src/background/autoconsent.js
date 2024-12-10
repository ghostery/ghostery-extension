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

import rules from '@duckduckgo/autoconsent/rules/rules.json';

import { parse } from 'tldts-experimental';
import { store } from 'hybrids';

import Options, { isPaused } from '/store/options.js';

async function initialize(msg, tab, frameId) {
  const options = await store.resolve(Options);

  if (
    options.terms &&
    options.blockAnnoyances &&
    !isPaused(options, tab.url ? parse(tab.url).hostname : '')
  ) {
    try {
      chrome.tabs.sendMessage(
        tab.id,
        {
          action: 'autoconsent',
          type: 'initResp',
          rules,
          config: {
            enableCosmeticRules: false,
          },
        },
        { frameId },
      );
    } catch {
      // The error is thrown when the tab is not ready to receive messages,
      // like it is closed before the message is sent
    }
  }
}

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.action !== 'autoconsent' || !sender.tab) return;

  if (msg.type === 'init') {
    initialize(msg, sender.tab, sender.frameId);
  }
});
