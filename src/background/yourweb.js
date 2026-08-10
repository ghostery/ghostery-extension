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

import Options from '/store/options.js';
import { PERIOD_IN_MS, SESSION_KEY } from '/utils/yourweb.js';

const chromeAction = chrome.action || chrome.browserAction;

chrome.runtime.onStartup.addListener(async () => {
  const options = await store.resolve(Options);

  if (!options.terms) return;

  // Fresh installations start the period now, so the panel does not pop up right away
  if (options.yourwebDisplayedAt === 0) {
    await store.set(options, { yourwebDisplayedAt: Date.now() });
    return;
  }

  if (Date.now() - options.yourwebDisplayedAt < PERIOD_IN_MS) return;

  try {
    await chrome.storage.session.set({ [SESSION_KEY]: true });
    await store.set(options, { yourwebDisplayedAt: Date.now() });

    await chromeAction.openPopup();
    console.log('[yourweb] Opening the panel with the recap view...');
  } catch (e) {
    console.error('[yourweb] Failed to open the panel:', e);
    await chrome.storage.session.remove(SESSION_KEY);
  }
});
