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
import { FLAG_WHATS_NEW } from '@ghostery/config';

import Config from '/store/config.js';
import ManagedConfig from '/store/managed-config.js';
import Options from '/store/options.js';

const chromeAction = chrome.action || chrome.browserAction;
const PANEL_URL = chrome.runtime.getURL('/pages/panel/index.html');

function getMinorVersion() {
  return chrome.runtime.getManifest().version.split('.', 2).join('.'); // e.g. 10.5.55 -> '10.5'
}

async function openPanel() {
  // Without the flag the version is left untouched, so the release is announced
  // as soon as the flag is rolled out to the user
  const config = await store.resolve(Config);
  if (!config.hasFlag(FLAG_WHATS_NEW)) return;

  const options = await store.resolve(Options);
  const version = getMinorVersion();

  if (!options.terms || options.whatsNew.version === version) return;

  const { notifications } = options.panel;
  await store.set(options, { whatsNew: { version, shown: !notifications } });

  const managedConfig = await store.resolve(ManagedConfig);
  if (managedConfig.disableUserControl || !notifications) return;

  if (!chromeAction.openPopup) {
    console.warn('[whats-new] The panel cannot be opened automatically in this browser');
    return;
  }

  try {
    // Point the popup at the recap view for this single open, then restore the default
    await chromeAction.setPopup({ popup: `${PANEL_URL}?whatsNew` });
    await chromeAction.openPopup();

    console.log('[whats-new] Opening the panel with the recap view...');
  } catch (e) {
    console.error('[whats-new] Failed to open the panel:', e);
  } finally {
    await chromeAction.setPopup({ popup: PANEL_URL });
  }
}

chrome.runtime.onStartup.addListener(async () => {
  const options = await store.resolve(Options);
  const version = getMinorVersion();

  // After installing the extension the version is empty, so we only catch up with it
  if (!options.whatsNew.version) {
    await store.set(options, { whatsNew: { version } });
    return;
  }

  await openPanel();
});

// The version does not change between reloads of the unpacked extension,
// so development builds show the recap on every reload instead
if (__DEBUG__) {
  chrome.runtime.onInstalled.addListener(async () => {
    await store.set(Options, { whatsNew: { version: '' } });
    await openPanel();
  });
}
