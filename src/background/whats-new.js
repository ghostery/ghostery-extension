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

import ManagedConfig from '/store/managed-config.js';
import Options from '/store/options.js';

import { SESSION_KEY } from '/utils/whats-new.js';

const chromeAction = chrome.action || chrome.browserAction;

function getMinorVersion() {
  return parseFloat(chrome.runtime.getManifest().version); // e.g. 10.5.55 -> 10.5
}

async function openPanel() {
  const managedConfig = await store.resolve(ManagedConfig);
  if (managedConfig.disableUserControl) return;

  const options = await store.resolve(Options);
  const version = getMinorVersion();

  if (!options.terms || options.whatsNew.version === version) return;

  try {
    await chrome.storage.session.set({ [SESSION_KEY]: true });
    await store.set(options, { whatsNew: { version, shown: false } });

    await chromeAction.openPopup();
    console.log('[whats-new] Opening the panel with the recap view...');
  } catch (e) {
    await chrome.storage.session.remove(SESSION_KEY);
    console.error('[whats-new] Failed to open the panel:', e);
  }
}

chrome.runtime.onStartup.addListener(async () => {
  const options = await store.resolve(Options);
  const version = getMinorVersion();

  // After installing the extension the version is 0, so we only catch up with it
  if (options.whatsNew.version === 0) {
    await store.set(options, { whatsNew: { version } });
    return;
  }

  await openPanel();
});

// The version does not change between reloads of the unpacked extension,
// so development builds show the recap on every reload instead
if (__DEBUG__) {
  chrome.runtime.onInstalled.addListener(async () => {
    await store.set(Options, { whatsNew: { version: 0 } });
    await openPanel();
  });
}
