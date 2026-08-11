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

// Fresh installations start the period now, so the panel does not pop up right away.
// shownAt matches notifiedAt, as there is no recap waiting to be seen yet.
async function startPeriod() {
  const options = await store.resolve(Options);

  if (options.yourweb.notifiedAt === 0) {
    const now = Date.now();
    await store.set(options, { yourweb: { notifiedAt: now, shownAt: now } });
  }

  return options;
}

chrome.runtime.onInstalled.addListener(startPeriod);

chrome.runtime.onStartup.addListener(async () => {
  const options = await startPeriod();
  if (!options.terms) return;

  if (Date.now() - options.yourweb.notifiedAt < PERIOD_IN_MS) return;

  try {
    await chrome.storage.session.set({ [SESSION_KEY]: true });
    await store.set(options, { yourweb: { notifiedAt: Date.now() } });

    await chromeAction.openPopup();
    console.log('[yourweb] Opening the panel with the recap view...');
  } catch (e) {
    console.error('[yourweb] Failed to open the panel:', e);
    await chrome.storage.session.remove(SESSION_KEY);
  }
});
