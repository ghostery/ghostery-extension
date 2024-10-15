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
  disableCache,
  enableExtension,
  getExtensionElement,
  getExtensionPageURL,
  setToggle,
  switchToPanel,
} from '../utils.js';

import { PAGE_DOMAIN, PAGE_URL } from '../wdio.conf.js';

async function setPrivacyToggle(name, value) {
  await browser.url(await getExtensionPageURL('settings'));
  await setToggle(name, value);
}

async function setCustomFilters(filters) {
  await setPrivacyToggle('custom-filters', true);

  const input = await getExtensionElement('input:custom-filters');
  await input.setValue(filters.join('\n'));

  const checkbox = await getExtensionElement(
    'checkbox:custom-filters:trusted-scriptlets',
  );

  if (!(await checkbox.getProperty('checked'))) {
    await checkbox.click();
    await expect(checkbox).toBeChecked();
  }

  await getExtensionElement('button:custom-filters:save').click();
  await expect(
    getExtensionElement('component:custom-filters:result'),
  ).toBeDisplayed();
}

describe('Advanced Features', function () {
  before(enableExtension);

  describe('Custom Filters', function () {
    before(async function () {
      await setCustomFilters([
        `@@connect.facebook.net^`,
        `${PAGE_DOMAIN}###custom-filter`,
        `${PAGE_DOMAIN}##+js(rpnt, h1, Test Page, "Hello world")`,
      ]);

      await disableCache();
      await browser.url(PAGE_URL);
    });

    it('adds custom network filter', async function () {
      await switchToPanel(async function () {
        await getExtensionElement('button:detailed-view').click();

        await expect(
          getExtensionElement(`icon:tracker:facebook_connect:blocked`),
        ).not.toBeDisplayed();
        await expect(
          getExtensionElement(`icon:tracker:facebook_connect:modified`),
        ).not.toBeDisplayed();
      });
    });

    it('adds custom cosmetic filter', async function () {
      await expect($('#custom-filter')).not.toBeDisplayed();
    });

    it('adds custom scriptlet filter', async function () {
      await expect($('h1')).toHaveText('Hello world');
    });

    it('disables custom filters', async function () {
      await setPrivacyToggle('custom-filters', false);

      await browser.url(PAGE_URL);

      await expect($('#custom-filter')).toBeDisplayed();
      await expect($('h1')).toHaveText('Test Page');

      await switchToPanel(async function () {
        await getExtensionElement('button:detailed-view').click();

        await expect(
          getExtensionElement(`icon:tracker:facebook_connect:blocked`),
        ).toBeDisplayed();
      });
    });
  });
});
