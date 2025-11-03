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

import { browser, expect } from '@wdio/globals';

import { PAGE_DOMAIN, PAGE_URL } from '../wdio.conf.js';
import {
  enableExtension,
  openPanel,
  getExtensionElement,
  getExtensionPageURL,
  reloadExtension,
  waitForIdleBackgroundTasks,
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

  await waitForIdleBackgroundTasks();

  // Reload extension to pick up managed config changes
  await reloadExtension();
}

async function cleanManagedOptions() {
  await setManagedOptions();
}

describe('Managed Configuration', function () {
  before(enableExtension);
  after(cleanManagedOptions);

  it('pauses domains added to `trustedDomains`', async function () {
    const TRACKER_IDS = ['facebook_connect', 'pinterest_conversion_tracker'];

    await setManagedOptions({ trustedDomains: [PAGE_DOMAIN] });

    await browser.url(PAGE_URL);

    await openPanel();

    const pauseButton = await getExtensionElement('button:pause');
    await expect(pauseButton).toBeDisplayed();

    await expect(getExtensionElement('button:resume')).not.toBeDisplayed();

    await getExtensionElement('button:detailed-view').click();

    for (const trackerId of TRACKER_IDS) {
      await expect(
        getExtensionElement(`icon:tracker:${trackerId}:blocked`),
      ).not.toBeDisplayed();
      await expect(
        getExtensionElement(`icon:tracker:${trackerId}:modified`),
      ).not.toBeDisplayed();
    }

    await setManagedOptions({ trustedDomains: [] });

    await browser.url(PAGE_URL);

    await openPanel();

    await expect(getExtensionElement('button:pause-type')).toBeDisplayed();
  });

  it('hides menu in panel when `disableUserControl` is enabled', async function () {
    await openPanel();
    await expect(getExtensionElement('button:menu')).toBeDisplayed();

    await setManagedOptions({ disableUserControl: true });

    await openPanel();
    await expect(getExtensionElement('button:menu')).not.toBeDisplayed();
  });
});
