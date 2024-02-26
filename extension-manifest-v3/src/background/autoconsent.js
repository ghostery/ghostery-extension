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

import Options from '/store/options.js';
import { sendShowIframeMessage } from '/utils/iframe.js';

async function getTabDomain(tabId) {
  return parse((await chrome.tabs.get(tabId)).url).domain;
}

async function initialize(msg, tabId, frameId) {
  const { terms, blockAnnoyances, autoconsent, paused } = await store.resolve(
    Options,
  );
  const domain = await getTabDomain(tabId);

  if (
    terms &&
    blockAnnoyances &&
    !autoconsent.disallowed.includes(domain) &&
    (!paused || !paused.some(({ id }) => id === domain))
  ) {
    const optOut = autoconsent.all || autoconsent.allowed.includes(domain);

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
    world: __PLATFORM__ === 'firefox' ? undefined : 'MAIN',
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

async function openIframe(msg, tabId) {
  const { autoconsent } = await store.resolve(Options);
  if (autoconsent.all) return;

  const domain = await getTabDomain(tabId);
  if (domain) {
    if (autoconsent.allowed.includes(domain)) {
      return;
    }

    sendShowIframeMessage(
      tabId,
      `pages/autoconsent/index.html?host=${encodeURIComponent(domain)}`,
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
