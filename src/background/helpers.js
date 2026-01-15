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

import { store } from 'hybrids';

import Config from '/store/config.js';

import * as OptionsObserver from '/utils/options-observer.js';
import { hasWTMStats } from '/utils/wtm-stats';
import { updateEngines } from './adblocker.js';

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.action) {
    case 'hasWTMStats':
      sendResponse(hasWTMStats(msg.domain));
      break;

    case 'openTabWithUrl':
      chrome.tabs.create({ url: msg.url });
      break;

    case 'openPrivateWindowWithUrl':
      chrome.windows.getAll().then((windows) => {
        const inIncognito = windows.find((w) => w.incognito);

        if (inIncognito) {
          chrome.tabs.create({
            url: msg.url,
            windowId: inIncognito.id,
            active: true,
          });
        } else {
          chrome.windows.create({ url: msg.url, incognito: true });
        }
      });
      break;

    case 'openElementPicker':
      chrome.scripting.executeScript(
        {
          injectImmediately: true,
          world: chrome.scripting.ExecutionWorld?.ISOLATED ?? 'ISOLATED',
          target: {
            tabId: msg.tabId,
          },
          files: ['/content_scripts/element-picker.js'],
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
          }
        },
      );
      break;
    case 'updateEngines':
      updateEngines({ cache: false }).then(() => {
        sendResponse();
        console.info('[helpers] "updateEngines" response...');
      });
      return true;
    case 'idle':
      OptionsObserver.waitForIdle().then(() => {
        sendResponse('done');
        console.info('[helpers] "idleOptionsObservers" response...');
      });
      return true;

    // Messages for e2e tests

    case 'e2e:idleOptionsObservers':
      OptionsObserver.waitForIdle().then(() => {
        sendResponse('done');
        console.info('[helpers] "idleOptionsObservers" response...');
      });
      return true;

    case 'e2e:setConfigFlags':
      store.resolve(Config).then(async (config) => {
        const flags = {};

        for (const name of Object.keys(config.flags)) {
          flags[name] = null;
        }

        for (const name of msg.flags) {
          flags[name] = { enabled: true };
        }

        await store.set(Config, { flags });
        sendResponse('done');
      });
      return true;

    case 'e2e:reloadExtension':
      setTimeout(() => chrome.runtime.reload(), 2000);
      sendResponse('done');
      break;
  }

  return false;
});
