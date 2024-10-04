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

import { browser, $ } from '@wdio/globals';

let extensionId = '';
export async function getExtensionId() {
  if (!extensionId) {
    switch (browser.capabilities.browserName) {
      case 'chrome': {
        await browser.url('chrome://extensions');

        const extension = await $('extensions-item:first-child');
        extensionId = await extension.getAttribute('id');
        break;
      }
      case 'firefox': {
        await browser.url('about:debugging#/runtime/this-firefox');
        const extesionManifestAnchor = await $('a[href*="manifest.json"]');

        const manifestUrl = await extesionManifestAnchor.getAttribute('href');
        extensionId = manifestUrl.match(/([^/]+)\/manifest.json/)[1];
      }
    }
  }

  return extensionId;
}

const SCHEME =
  browser.capabilities.browserName === 'chrome'
    ? 'chrome-extension'
    : 'moz-extension';

export async function getExtensionPageURL(page, file = 'index.html') {
  return `${SCHEME}://${await getExtensionId()}/pages/${page}/${file}`;
}

export function getExtensionElement(id) {
  return $(`[data-qa="${id}"]`);
}

export async function enableExtension() {
  await browser.url(await getExtensionPageURL('onboarding'));

  const el = getExtensionElement('button:enable');

  if (await el.isDisplayed()) {
    await el.click();
    await getExtensionElement('view:success');
  }
}
