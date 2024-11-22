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

export async function enableExtension() {
  await browser.url(getExtensionPageURL('onboarding'));

  await getExtensionElement('button:enable').click();
  await expect(getExtensionElement('view:success')).toBeDisplayed();
  await waitForIdleBackgroundTasks();
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
  await browser.url(getExtensionPageURL('settings'));
  await setToggle(name, value);
}

export async function switchToPanel(fn) {
  const context = await browser.getTitle();
  const url = getExtensionPageURL('panel');

  try {
    // When the panel is not opened yet, the switchWindow will throw
    // so then (for the first time) we need to open the panel in a new window
    try {
      await browser.switchWindow(url);
      await browser.url(url); // Refresh the page to ensure the panel is in a clean state
    } catch {
      await browser.newWindow(url);
    }

    await browser.waitUntil(
      async () => (await browser.getTitle()) === 'Ghostery panel',
    );

    const result = await fn();

    await browser.closeWindow();
    await browser.switchWindow(context);

    return result;
  } catch (e) {
    await browser.switchWindow(context);
    throw e;
  }
}
