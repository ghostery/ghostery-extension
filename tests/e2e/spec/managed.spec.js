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
  switchToPanel,
  getExtensionElement,
  getExtensionPageURL,
  reloadExtension,
} from '../utils.js';

async function setManagedOptions(options) {
  await browser.url(getExtensionPageURL('panel'));

  await browser.execute((managedOptions) => {
    if (managedOptions) {
      chrome.storage.local.set({ debugManagedConfig: managedOptions });
    } else {
      chrome.storage.local.remove('debugManagedConfig');
    }
  }, options);

  // Reload extension to pick up managed config changes
  await reloadExtension();
}

async function cleanManagedOptions() {
  await setManagedOptions();
}

describe('Managed Configuration', function () {
  before(enableExtension);
  afterEach(cleanManagedOptions);

  it('pauses domain when added to `trustedDomains`', async function () {
    const TRACKER_IDS = ['facebook_connect', 'pinterest_conversion_tracker'];

    await setManagedOptions({ trustedDomains: [PAGE_DOMAIN] });

    // Navigate to settings page to let managed config take effect
    await browser.url(getExtensionPageURL('settings'));

    // Navigate to websites link by clicking on it
    const websitesLink = await $('a[href*="websites"]');
    await websitesLink.click();

    // Check if PAGE_URL appears in the websites table
    // Look for text content containing PAGE_URL
    const pageText = await $('body').getText();
    await expect(pageText.includes(PAGE_DOMAIN)).toBe(true);

    await browser.url(PAGE_URL);

    await switchToPanel(async function () {
      await getExtensionElement('button:detailed-view').click();

      for (const trackerId of TRACKER_IDS) {
        await expect(
          getExtensionElement(`icon:tracker:${trackerId}:blocked`),
        ).not.toBeDisplayed();
        await expect(
          getExtensionElement(`icon:tracker:${trackerId}:modified`),
        ).not.toBeDisplayed();
      }
    });
  });

  it('hides menu in panel when `disableUserControl` is enabled', async function () {
    await switchToPanel(async () => {
      const menuButton = await getExtensionElement('button:menu');
      await expect(menuButton).toBeDisplayed();
    });

    await setManagedOptions({ disableUserControl: true });

    await switchToPanel(async () => {
      const menuButton = await getExtensionElement('button:menu');
      await expect(menuButton).not.toBeDisplayed();
    });
  });
});
