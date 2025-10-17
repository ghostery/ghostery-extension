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

export async function waitForIdleBackgroundTasks() {
  if ((await browser.getUrl()).startsWith('http')) {
    throw new Error(
      'Background idle state must be checked from the extension context',
    );
  }

  // Wait for the 'idleOptionsObservers' response
  const result = await browser.execute(
    browser.isChromium
      ? () => chrome.runtime.sendMessage({ action: 'idleOptionsObservers' })
      : () => browser.runtime.sendMessage({ action: 'idleOptionsObservers' }),
  );

  if (result !== 'done') {
    throw new Error(`Background tasks did not respond with "done": ${result}`);
  }
}

export async function reloadExtension() {
  await browser.url('about:blank');

  await browser[browser.isFirefox ? 'newWindow' : 'url'](
    getExtensionPageURL('panel'),
  );

  const result = await browser.execute(
    browser.isChromium
      ? () => chrome.runtime.sendMessage({ action: 'reloadExtension' })
      : () => browser.runtime.sendMessage({ action: 'reloadExtension' }),
  );

  if (result !== 'done') {
    throw new Error(`Background tasks did not respond with "done": ${result}`);
  }

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

export async function switchToPanel(fn) {
  const currentUrl = await browser.getUrl();
  const panelUrl = getExtensionPageURL('panel');

  await browser.url(panelUrl);

  // The panel has a bugfix for closing the panel when links are clicked.
  // Source: /pages/panel/index.js - L52
  // In test environment it must be disabled to allow the test to switch back to the panel
  await browser.execute(() => {
    Object.defineProperty(window, 'close', { value: function () {} });
  });

  let error = null;
  let result = null;
  try {
    result = await fn();
  } catch (e) {
    error = e;
  }

  await browser.url(currentUrl);

  if (error) throw error;
  return result;
}
