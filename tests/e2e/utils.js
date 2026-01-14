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

import { browser, expect, $ } from '@wdio/globals';
import { FLAG_MODES } from '@ghostery/config';

import { argv } from './wdio.conf.js';

export const ADBLOCKING_GLOBAL_SELECTOR = 'ad-slot';
export const ADBLOCKING_URL_SELECTOR = '[data-ad-name]';

export const TRACKER_IDS = ['facebook_connect', 'pinterest_conversion_tracker'];

let BASE_URL = '';
export function setExtensionBaseUrl(url) {
  BASE_URL = url;
}

export function getExtensionPageURL(page, file = 'index.html') {
  if (!BASE_URL) {
    throw new Error('Base URL is not set');
  }

  return `${BASE_URL}/${page}/${file}`;
}

export function getExtensionElement(id, query) {
  return $(`>>>[data-qa="${id}"]` + (query ? ` ${query}` : ''));
}

async function sendMessage(msg) {
  if ((await browser.getUrl()).startsWith('http')) {
    throw new Error('Message can only be sent from the extension context');
  }

  const result = await browser.execute(
    browser.isChromium
      ? (msg) => chrome.runtime.sendMessage(JSON.parse(msg))
      : (msg) => browser.runtime.sendMessage(JSON.parse(msg)),
    JSON.stringify(msg),
  );

  if (result !== 'done') {
    throw new Error(`Background tasks did not respond with "done": ${result}`);
  }
}

export async function setAttributionCookie(source, campaign) {
  await sendMessage({
    action: 'e2e:telemetry:setCookie',
    url: 'https://www.ghostery.com/',
    name: 'attribution',
    value: `s=${encodeURIComponent(source)}&c=${encodeURIComponent(campaign)}`,
  });
}

export async function removeAttributionCookie() {
  await sendMessage({
    action: 'e2e:telemetry:removeCookie',
    url: 'https://www.ghostery.com/',
    name: 'attribution',
  });
}

export async function openDevtools() {
  await browser.url(getExtensionPageURL('settings'));

  const version = await getExtensionElement('component:devtools', 'ui-text');
  for (let i = 0; i < 6; i++) {
    await version.click();
  }

  await expect(getExtensionElement('text:utm-source')).toBeDisplayed();
}

export async function clearStorageAndReload() {
  await browser.url(getExtensionPageURL('settings'));

  const version = await getExtensionElement('component:devtools', 'ui-text');
  for (let i = 0; i < 6; i++) {
    await version.click();
  }

  await getExtensionElement('button:clear-storage', 'button').click();

  await browser.pause(3000);

  await browser.waitUntil(
    async () => {
      const title = await browser.getTitle();
      if (title !== 'Ghostery panel') {
        await browser.url(getExtensionPageURL('panel'));
        return false;
      }
      return true;
    },
    { timeout: 10000, timeoutMsg: 'Panel did not load after reload' },
  );
}

export async function waitForIdleBackgroundTasks() {
  await sendMessage({ action: 'e2e:idleOptionsObservers' });
}

export async function reloadExtension() {
  await browser.url('about:blank');

  await browser[browser.isFirefox ? 'newWindow' : 'url'](
    getExtensionPageURL('panel'),
  );

  await sendMessage({ action: 'e2e:reloadExtension' });

  if (browser.isFirefox) {
    await browser.switchWindow('about:blank');
  }

  await browser.pause(3000);

  await browser.waitUntil(
    async () => {
      const title = await browser.getTitle();
      if (title !== 'Ghostery panel') {
        await browser.url(getExtensionPageURL('panel'));
        return false;
      }

      return true;
    },
    { timeout: 10000, timeoutMsg: 'Panel did not load' },
  );

  await waitForIdleBackgroundTasks();

  await browser.url('about:blank');
}

export async function enableExtension() {
  await browser.url(getExtensionPageURL('onboarding'));

  if (!(await getExtensionElement('view:success').isDisplayed())) {
    await getExtensionElement('button:enable').click();

    if (argv.flags.includes(FLAG_MODES)) {
      await expect(getExtensionElement('view:filtering-mode')).toBeDisplayed();
      await getExtensionElement('button:filtering-mode:ghostery').click();
    }

    await expect(getExtensionElement('view:success')).toBeDisplayed();

    await waitForIdleBackgroundTasks();
  }
}

export async function setToggle(name, value) {
  const toggle = await getExtensionElement(`toggle:${name}`);

  if ((await toggle.getProperty('value')) !== value) {
    await toggle.click();

    // Allow background process to update the settings
    await waitForIdleBackgroundTasks();
  }

  await expect(toggle).toHaveElementProperty('value', value);
}

export async function setPrivacyToggle(name, value) {
  await browser.url('about:blank');
  await browser.url(getExtensionPageURL('settings'));

  await setToggle(name, value);
}

export async function setWhoTracksMeToggle(name, value) {
  await browser.url(getExtensionPageURL('settings'));
  await getExtensionElement('button:whotracksme').click();

  await setToggle(name, value);
}

export async function openPanel() {
  await browser.url(getExtensionPageURL('panel'));

  // The panel has a bugfix for closing the panel when links are clicked.
  // Source: /pages/panel/index.js - L52
  // In test environment it must be disabled to allow the test to switch back to the panel
  await browser.execute(() => {
    Object.defineProperty(window, 'close', { value: function () {} });
  });
}

export async function setConfigFlags(flags) {
  try {
    console.log('Setting config flags:', flags);

    await browser.url(getExtensionPageURL('panel'));
    await sendMessage({ action: 'e2e:setConfigFlags', flags });

    // Reload the extension to apply the new config flags
    await reloadExtension();
  } catch {
    console.warn(
      'Current extension version does not support setting config flags',
    );
  }
}

export async function expectAdsBlocked() {
  const adSlot = await $(ADBLOCKING_GLOBAL_SELECTOR);
  const dataAd = await $(ADBLOCKING_URL_SELECTOR);

  await expect(adSlot).toExist();
  await expect(dataAd).toExist();

  await expect(adSlot).not.toBeDisplayed();
  await expect(dataAd).not.toBeDisplayed();
}

export async function setCustomFilters(filters, callback) {
  await setPrivacyToggle('custom-filters', true);
  await getExtensionElement('button:custom-filters').click();

  const checkbox = await getExtensionElement(
    'checkbox:custom-filters:trusted-scriptlets',
  );

  if (!(await checkbox.getProperty('checked'))) {
    await checkbox.click();
    await expect(checkbox).toHaveElementProperty('checked', true);
  }

  const input = await getExtensionElement('input:custom-filters');
  await input.setValue(filters.join('\n'));

  await getExtensionElement('button:custom-filters:save').click();

  await expect(
    getExtensionElement('component:custom-filters:result'),
  ).toBeDisplayed();

  if (callback) {
    await callback();
  }

  await getExtensionElement('button:back').click();
}

export async function switchFrame(frameElement) {
  await browser.switchFrame(null);
  await frameElement.waitForExist({ timeout: 5000 });

  await browser.switchFrame(frameElement);
}
