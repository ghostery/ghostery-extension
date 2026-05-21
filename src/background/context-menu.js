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

import Options, { MODE_ZAP } from '/store/options.js';
import * as OptionsObserver from '/utils/options-observer.js';
import { tabStats } from './stats.js';
import { openElementPicker } from './element-picker.js';

const SETTINGS_URL = chrome.runtime.getURL('/pages/settings/index.html');

const ID_PARENT = 'ghostery';
const ID_PAUSE = 'ghostery:pause';
const ID_RESUME = 'ghostery:resume';
const ID_ZAP_ENABLE = 'ghostery:zap-enable';
const ID_ZAP_DISABLE = 'ghostery:zap-disable';
const ID_PAUSE_HOUR = 'ghostery:pause-hour';
const ID_PAUSE_DAY = 'ghostery:pause-day';
const ID_PAUSE_ALWAYS = 'ghostery:pause-always';
const ID_ELEMENT_PICKER = 'ghostery:element-picker';
const ID_SEPARATOR = 'ghostery:separator';
const ID_SETTINGS = 'ghostery:settings';
const ID_WEBSITE_SETTINGS = 'ghostery:website-settings';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: ID_PARENT,
      title: 'Ghostery',
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
      id: ID_RESUME,
      parentId: ID_PARENT,
      title: msg`Resume`,
      contexts: ['all'],
      documentUrlPatterns: ['http://*/*', 'https://*/*'],
      visible: false,
    });

    chrome.contextMenus.create({
      id: ID_ZAP_ENABLE,
      parentId: ID_PARENT,
      title: msg`Block ads`,
      contexts: ['all'],
      documentUrlPatterns: ['http://*/*', 'https://*/*'],
      visible: false,
    });

    chrome.contextMenus.create({
      id: ID_ZAP_DISABLE,
      parentId: ID_PARENT,
      title: msg`Show ads`,
      contexts: ['all'],
      documentUrlPatterns: ['http://*/*', 'https://*/*'],
      visible: false,
    });

    chrome.contextMenus.create({
      id: `${ID_SEPARATOR}-1`,
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
      id: ID_WEBSITE_SETTINGS,
      parentId: ID_PARENT,
      title: `${msg`Open website settings`}...`,
      contexts: ['all'],
      documentUrlPatterns: ['http://*/*', 'https://*/*'],
    });

    chrome.contextMenus.create({
      id: `${ID_SEPARATOR}-2`,
      parentId: ID_PARENT,
      type: 'separator',
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

async function resumeSite(tab) {
  const hostname = tabStats.get(tab.id)?.hostname;
  if (!hostname) return;

  const options = await store.resolve(Options);
  await store.set(options, { paused: { [hostname]: null } });
  await chrome.tabs.reload(tab.id);

  console.debug(`[context-menu] Resumed ${hostname}`);
}

async function zapSite(tab) {
  const hostname = tabStats.get(tab.id)?.hostname;
  if (!hostname) return;

  const options = await store.resolve(Options);
  await store.set(options, { zapped: { [hostname]: true } });
  await chrome.tabs.reload(tab.id);

  console.debug(`[context-menu] Zapped ${hostname}`);
}

async function unzapSite(tab) {
  const hostname = tabStats.get(tab.id)?.hostname;
  if (!hostname) return;

  const options = await store.resolve(Options);
  await store.set(options, { zapped: { [hostname]: null } });
  await chrome.tabs.reload(tab.id);

  console.debug(`[context-menu] Unzapped ${hostname}`);
}

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

  console.debug(
    `[context-menu] Paused ${hostname} until ${revokeAt ? new Date(revokeAt).toLocaleString() : 'always'}`,
  );
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

async function openWebsiteSettings(tab) {
  const hostname = tabStats.get(tab.id)?.hostname;
  const url = SETTINGS_URL + '#@settings-website-details?domain=' + (hostname || '');

  await chrome.tabs.create({ url });

  console.debug(`[context-menu] Opened website settings for ${hostname}...`);
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case ID_RESUME:
      resumeSite(tab).catch(console.error);
      break;
    case ID_ZAP_ENABLE:
      zapSite(tab).catch(console.error);
      break;
    case ID_ZAP_DISABLE:
      unzapSite(tab).catch(console.error);
      break;
    case ID_PAUSE_HOUR:
    case ID_PAUSE_DAY:
    case ID_PAUSE_ALWAYS:
      pauseSite(tab, info.menuItemId).catch(console.error);
      break;
    case ID_ELEMENT_PICKER:
      openElementPicker(tab.id).catch(console.error);
      break;
    case ID_SETTINGS:
      openSettings().catch(console.error);
      break;
    case ID_WEBSITE_SETTINGS:
      openWebsiteSettings(tab).catch(console.error);
      break;
  }
});

async function updateVisibility(tabId) {
  if (tabId === undefined) return;

  const hostname = tabStats.get(tabId)?.hostname;
  const options = await store.resolve(Options);
  const isZapMode = options.mode === MODE_ZAP;

  let isPaused = false;
  let isZapped = false;

  if (hostname) {
    if (isZapMode) {
      isZapped = !!options.zapped?.[hostname];
    } else {
      const entry = options.paused?.[hostname];
      isPaused = !!entry && (entry.revokeAt === 0 || entry.revokeAt > Date.now());
    }
  }

  chrome.contextMenus.update(ID_PAUSE, { visible: !isZapMode && !isPaused }).catch(console.error);
  chrome.contextMenus.update(ID_RESUME, { visible: !isZapMode && isPaused }).catch(console.error);
  chrome.contextMenus
    .update(ID_ZAP_ENABLE, { visible: isZapMode && !isZapped })
    .catch(console.error);
  chrome.contextMenus
    .update(ID_ZAP_DISABLE, { visible: isZapMode && isZapped })
    .catch(console.error);
  chrome.contextMenus
    .update(ID_ELEMENT_PICKER, { enabled: !isPaused && !isZapped })
    .catch(console.error);
}

chrome.tabs.onActivated.addListener(({ tabId }) => {
  updateVisibility(tabId).catch(console.error);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete') {
    updateVisibility(tabId).catch(console.error);
  }
});

OptionsObserver.addListener('terms', (terms) => {
  chrome.contextMenus.update(ID_PARENT, { enabled: terms }).catch(console.error);
});

OptionsObserver.addListener('contextMenu', (contextMenu) => {
  chrome.contextMenus.update(ID_PARENT, { visible: contextMenu }).catch(console.error);
});
