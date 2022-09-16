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
import { store } from 'hybrids';

import Options from '/store/options.js';

async function initialize(msg, tabId, frameId) {
  const { dnrRules, autoconsent } = await store.resolve(Options);
  const url = new URL(msg.url);

  if (dnrRules.annoyances && !autoconsent.disallowed.includes(url.hostname)) {
    const optOut =
      autoconsent.all ||
      autoconsent.allowed.some((h) => url.hostname.includes(h));

    chrome.tabs.sendMessage(
      tabId,
      {
        action: 'autoconsent',
        type: 'initResp',
        rules,
        config: {
          enabled: true,
          autoAction: optOut ? 'optOut' : '',
          disabledCmps: [],
          enablePrehide: optOut,
          detectRetries: 20,
        },
      },
      {
        frameId,
      },
    );
  }
}

async function evalCode(code, id, tabId, frameId) {
  const result = await chrome.scripting.executeScript({
    target: {
      tabId,
      frameIds: [frameId],
    },
    world: 'MAIN',
    args: [code],
    func: (code) => {
      try {
        return window.eval(code);
      } catch (e) {
        // ignore CSP errors
        return;
      }
    },
  });

  chrome.tabs.sendMessage(
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

async function openIframe(msg, tabId) {
  const url = new URL(msg.url);
  const { autoconsent } = await store.resolve(Options);

  if (
    !autoconsent.all &&
    autoconsent.allowed.every((h) => !url.hostname.includes(h))
  ) {
    chrome.tabs.sendMessage(
      tabId,
      { action: 'autoconsent', type: 'openIframe' },
      { frameId: 0 },
    );
  }
}

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.action !== 'autoconsent') return;
  if (!sender.tab) return;

  const tabId = sender.tab.id;
  const frameId = sender.frameId;

  switch (msg.type) {
    case 'init':
      return initialize(msg, tabId, frameId);
    case 'eval':
      return evalCode(msg.code, msg.id, tabId, frameId);
    case 'cmpDetected':
      openIframe(msg, tabId);
      return false;
    default:
      break;
  }
});
