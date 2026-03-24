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

import {
  enableExtension,
  getExtensionElement,
  sendMessage,
  reloadExtension,
  PAGE_DOMAIN,
  PAGE_URL,
  SUBPAGE_DOMAIN,
  SUBPAGE_URL,
  TRACKER_IDS,
} from '../utils.js';

async function setManagedConfig(config = {}) {
  await browser.url('ghostery:panel');
  await sendMessage({ action: 'e2e:managedConfig', config });

  await reloadExtension();
}

describe('Managed Configuration', function () {
  before(enableExtension);
  before(() =>
    setManagedConfig({
      disableUserControl: true,
      trustedDomains: [SUBPAGE_DOMAIN],
      customFilters: [`${PAGE_DOMAIN}###custom-filter`],
    }),
  );

  after(() => setManagedConfig());

  it('hides menu in panel when `disableUserControl` is enabled', async function () {
    await browser.url('ghostery:panel');
    await expect(getExtensionElement('button:menu')).not.toBeDisplayed();
  });

  it('pauses domains added to `trustedDomains`', async function () {
    await browser.url(SUBPAGE_URL);
    await browser.url('ghostery:panel');

    await expect(getExtensionElement('button:pause')).not.toBeDisplayed();
    await expect(getExtensionElement('button:resume')).not.toBeDisplayed();

    await getExtensionElement('button:detailed-view').click();

    for (const trackerId of TRACKER_IDS) {
      await expect(getExtensionElement(`icon:tracker:${trackerId}:blocked`)).not.toBeDisplayed();
      await expect(getExtensionElement(`icon:tracker:${trackerId}:modified`)).not.toBeDisplayed();
    }
  });

  it('applies custom filters added to `customFilters`', async function () {
    await browser.url(PAGE_URL);
    await expect($('#custom-filter')).not.toBeDisplayed();
  });
});
