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
import { snippets } from '@duckduckgo/autoconsent/lib/eval-snippets';
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
        {
          frameId,
        },
      );
    } catch (e) {
      // The error is thrown when the tab is not ready to receive messages,
      // like it is closed before the message is sent
    }
  }
}

async function evalCode(snippetId, id, tabId, frameId) {
  const [result] = await chrome.scripting.executeScript({
    target: {
      tabId,
      frameIds: [frameId],
    },
    world: chrome.scripting.ExecutionWorld.MAIN,
    func: snippets[snippetId],
  });

  await chrome.tabs.sendMessage(
    tabId,
    {
      action: 'autoconsent',
      id,
      type: 'evalResp',
      result: result.result,
    },
    {
      frameId,
    },
  );
}

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.action !== 'autoconsent') return;
  if (!sender.tab) return;

  const frameId = sender.frameId;

  switch (msg.type) {
    case 'init':
      return initialize(msg, sender.tab, frameId);
    case 'eval':
      return evalCode(msg.snippetId, msg.id, sender.tab.id, frameId);
    default:
      break;
  }
});
