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
import * as OptionsObserver from '/utils/options-observer.js';
import { tabStats } from './stats.js';
import { openElementPicker } from './element-picker.js';

const SETTINGS_URL = chrome.runtime.getURL('/pages/settings/index.html');

const ID_PARENT = 'ghostery';
const ID_PAUSE = 'ghostery:pause';
const ID_PAUSE_HOUR = 'ghostery:pause-hour';
const ID_PAUSE_DAY = 'ghostery:pause-day';
const ID_PAUSE_ALWAYS = 'ghostery:pause-always';
const ID_ELEMENT_PICKER = 'ghostery:element-picker';
const ID_SEPARATOR = 'ghostery:separator';
const ID_SETTINGS = 'ghostery:settings';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: ID_PARENT,
      title: msg`Ghostery`,
      contexts: ['all'],
      documentUrlPatterns: ['http://*/*', 'https://*/*'],
    });

    chrome.contextMenus.create({
      id: ID_PAUSE,
      parentId: ID_PARENT,
      title: msg`Pause on this site`,
      contexts: ['all'],
      documentUrlPatterns: ['http://*/*', 'https://*/*'],
    });

    chrome.contextMenus.create({
      id: ID_PAUSE_HOUR,
      parentId: ID_PAUSE,
      title: msg`1 hour`,
      contexts: ['all'],
      documentUrlPatterns: ['http://*/*', 'https://*/*'],
    });

    chrome.contextMenus.create({
      id: ID_PAUSE_DAY,
      parentId: ID_PAUSE,
      title: msg`1 day`,
      contexts: ['all'],
      documentUrlPatterns: ['http://*/*', 'https://*/*'],
    });

    chrome.contextMenus.create({
      id: ID_PAUSE_ALWAYS,
      parentId: ID_PAUSE,
      title: msg`Always`,
      contexts: ['all'],
      documentUrlPatterns: ['http://*/*', 'https://*/*'],
    });

    chrome.contextMenus.create({
      id: ID_SEPARATOR,
      parentId: ID_PARENT,
      type: 'separator',
      contexts: ['all'],
      documentUrlPatterns: ['http://*/*', 'https://*/*'],
    });

    chrome.contextMenus.create({
      id: ID_ELEMENT_PICKER,
      parentId: ID_PARENT,
      title: `${msg`Hide content block`}...`,
      contexts: ['all'],
      documentUrlPatterns: ['http://*/*', 'https://*/*'],
    });

    chrome.contextMenus.create({
      id: ID_SETTINGS,
      parentId: ID_PARENT,
      title: `${msg`Open settings`}...`,
      contexts: ['all'],
      documentUrlPatterns: ['http://*/*', 'https://*/*'],
    });

    console.debug('[context-menu] Context menu created...');
  });
});

async function pauseSite(tab, id) {
  const hostname = tabStats.get(tab.id)?.hostname;
  if (!hostname) return;

  const options = await store.resolve(Options);

  let revokeAt;
  if (id === ID_PAUSE_HOUR) {
    revokeAt = Date.now() + 60 * 60 * 1000;
  } else if (id === ID_PAUSE_DAY) {
    revokeAt = Date.now() + 24 * 60 * 60 * 1000;
  } else if (id === ID_PAUSE_ALWAYS) {
    revokeAt = 0;
  } else {
    throw new Error('[context-menu] Unknown pause duration');
  }

  await store.set(options, { paused: { [hostname]: { revokeAt } } });
  await chrome.tabs.reload(tab.id);

  console.debug(`[context-menu] Paused ${hostname} until ${new Date(revokeAt).toLocaleString()}`);
}

async function openSettings() {
  const tabs = await chrome.tabs.query({
    url: SETTINGS_URL,
    currentWindow: true,
  });

  if (tabs.length) {
    await chrome.tabs.update(tabs[0].id, { active: true });
  } else {
    await chrome.tabs.create({ url: SETTINGS_URL });
  }

  console.debug('[context-menu] Opened settings page...');
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case ID_PAUSE_HOUR:
    case ID_PAUSE_DAY:
    case ID_PAUSE_ALWAYS:
      return pauseSite(tab, info.menuItemId);
    case ID_ELEMENT_PICKER:
      return openElementPicker(tab.id);
    case ID_SETTINGS:
      return openSettings();
  }
});

OptionsObserver.addListener('terms', (terms) => {
  chrome.contextMenus.update(ID_PARENT, { enabled: terms });
});
