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

import { PAGE_DOMAIN, PAGE_URL } from '../wdio.conf.js';
import {
  enableExtension,
  openPanel,
  getExtensionElement,
  getExtensionPageURL,
  reloadExtension,
} from '../utils.js';

async function setManagedConfig(config) {
  await browser.url(getExtensionPageURL('panel'));

  await browser.execute(
    (managedConfigStr) => {
      const managedConfig = managedConfigStr ? JSON.parse(managedConfigStr) : null;
      if (managedConfig) {
        chrome.storage.local.set({ managedConfig });
      } else {
        chrome.storage.local.remove('managedConfig');
      }
    },
    config ? JSON.stringify(config) : null,
  );

  // Reload extension to pick up managed config changes
  await reloadExtension();
}

async function cleanManagedConfig() {
  await setManagedConfig();
}

describe('Managed Configuration', function () {
  before(enableExtension);
  after(cleanManagedConfig);

  it('pauses domains added to `trustedDomains`', async function () {
    const TRACKER_IDS = ['facebook_connect', 'pinterest_conversion_tracker'];

    await setManagedConfig({ trustedDomains: [PAGE_DOMAIN] });

    await browser.url(PAGE_URL);

    await openPanel();

    const pauseButton = await getExtensionElement('button:pause');
    await expect(pauseButton).toBeDisplayed();

    await expect(getExtensionElement('button:resume')).not.toBeDisplayed();

    await getExtensionElement('button:detailed-view').click();

    for (const trackerId of TRACKER_IDS) {
      await expect(getExtensionElement(`icon:tracker:${trackerId}:blocked`)).not.toBeDisplayed();
      await expect(getExtensionElement(`icon:tracker:${trackerId}:modified`)).not.toBeDisplayed();
    }

    await setManagedConfig({ trustedDomains: [] });

    await browser.url(PAGE_URL);

    await openPanel();

    await expect(getExtensionElement('button:pause-type')).toBeDisplayed();
  });

  it('hides menu in panel when `disableUserControl` is enabled', async function () {
    await openPanel();
    await expect(getExtensionElement('button:menu')).toBeDisplayed();

    await setManagedConfig({ disableUserControl: true });

    await openPanel();
    await expect(getExtensionElement('button:menu')).not.toBeDisplayed();
  });

  it('applies custom filters added to `customFilters`', async function () {
    await browser.url(PAGE_URL);
    await expect($('#custom-filter')).toBeDisplayed();

    await setManagedConfig({
      customFilters: [`${PAGE_DOMAIN}###custom-filter`],
    });

    await browser.url(PAGE_URL);

    // Reload the page to ensure filters are applied
    // Possible fix for some CI runs failing
    await browser.url(PAGE_URL);

    await expect($('#custom-filter')).not.toBeDisplayed();

    await setManagedConfig({
      customFilters: [],
    });

    await browser.url(PAGE_URL);
    await expect($('#custom-filter')).toBeDisplayed();
  });
});
