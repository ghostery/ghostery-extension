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

export async function disableCache() {
  if (browser.isChromium) {
    await browser.sendCommand('Network.setCacheDisabled', {
      cacheDisabled: true,
    });
  }
}

let extensionId = '';
async function getExtensionId() {
  if (!extensionId) {
    switch (browser.capabilities.browserName) {
      case 'chrome': {
        const url = 'chrome://extensions';
        await browser.url(url);

        extensionId = await $('extensions-item:first-child').getAttribute('id');

        break;
      }
      case 'firefox': {
        await browser.url('about:debugging#/runtime/this-firefox');
        const manifestUrl = await $('a[href*="manifest.json"]').getAttribute(
          'href',
        );
        extensionId = manifestUrl.match(/([^/]+)\/manifest.json/)[1];
        break;
      }
    }
  }

  return extensionId;
}

export async function getExtensionPageURL(page, file = 'index.html') {
  return `${browser.isChromium ? 'chrome-extension' : 'moz-extension'}://${await getExtensionId()}/pages/${page}/${file}`;
}

export function getExtensionElement(id) {
  return $(`>>>[data-qa="${id}"]`);
}

export async function enableExtension() {
  const isDisabled = await switchToPanel(async function () {
    return await getExtensionElement('button:enable').isDisplayed();
  });

  if (isDisabled) {
    await browser.url(await getExtensionPageURL('onboarding'));

    await getExtensionElement('button:enable').click();
    await expect(getExtensionElement('view:success')).toBeDisplayed();

    // Give the extension some time to initialize (updating the engines in the background)
    await browser.pause(2000);
  }
}

export async function switchToPanel(fn) {
  const context = await browser.getTitle();
  const url = await getExtensionPageURL('panel');

  try {
    // When the panel is not opened yet, the switchWindow will throw
    // so then (for the first time) we need to open the panel in a new window
    try {
      await browser.switchWindow(url);
      await browser.url(url); // Refresh the page to ensure the panel is in a clean state
    } catch {
      await browser.newWindow(url);
    }

    await browser.pause(1000);

    const result = await fn();

    await browser.closeWindow();
    await browser.switchWindow(context);

    return result;
  } catch (e) {
    await browser.switchWindow(context);
    throw e;
  }
}
