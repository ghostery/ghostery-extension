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
  setPrivacyToggle,
  switchToPanel,
} from '../utils.js';

import { PAGE_DOMAIN, PAGE_URL } from '../wdio.conf.js';

async function setCustomFilters(filters, callback) {
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

describe('Advanced Features', function () {
  before(enableExtension);

  describe('Custom Filters', function () {
    it('adds custom network filter', async function () {
      await setCustomFilters([`@@connect.facebook.net^`]);

      await browser.url(PAGE_URL);

      await switchToPanel(async () => {
        await getExtensionElement('button:detailed-view').click();

        await expect(
          getExtensionElement(`icon:tracker:facebook_connect:blocked`),
        ).not.toBeDisplayed();
        await expect(
          getExtensionElement(`icon:tracker:facebook_connect:modified`),
        ).not.toBeDisplayed();
      });
    });

    it('adds supported custom regex filter', async function () {
      await setCustomFilters([`/.*example.com/`]);

      await browser.url(PAGE_URL);

      await switchToPanel(async () => {
        await getExtensionElement('button:detailed-view').click();

        await expect(
          getExtensionElement(`icon:tracker:www.example.com:blocked`),
        ).toBeDisplayed();
      });
    });

    if (browser.isChromium) {
      it('adds unsupported custom regex filter', async function () {
        await setCustomFilters([`/(?>ab)c/`], async () => {
          const errors = await getExtensionElement(
            'component:custom-filters:errors',
          );

          const text = await errors.getText();
          await expect(text).toContain('Could not apply a custom filter');
        });
      });
    }

    it('adds custom cosmetic filter', async function () {
      await setCustomFilters([`${PAGE_DOMAIN}###custom-filter`]);

      await browser.url(PAGE_URL);
      await expect($('#custom-filter')).not.toBeDisplayed();
    });

    it('adds custom scriptlet filter', async function () {
      await setCustomFilters([
        `${PAGE_DOMAIN}##+js(rpnt, h1, Test Page, "Hello world")`,
      ]);

      await browser.url(PAGE_URL);
      await expect($('h1')).toHaveText('Hello world');
    });

    it('adds custom scriptlet filter depending on `scriptletsGlobal.warOrigin`', async function () {
      await setCustomFilters([
        `${PAGE_DOMAIN}##+js(no-fetch-if, ads.js, war:googlesyndication_adsbygoogle.js)`,
      ]);

      await browser.url(PAGE_URL);
      await $('#war').waitForExist({ timeout: 1000 });
      await expect($('#war')).toHaveText('google');
    });

    it('disables custom filters', async function () {
      await setCustomFilters([`${PAGE_DOMAIN}###custom-filter`]);
      await setPrivacyToggle('custom-filters', false);

      await browser.url(PAGE_URL);
      await expect($('#custom-filter')).toBeDisplayed();

      await switchToPanel(async () => {
        await getExtensionElement('button:detailed-view').click();

        await expect(
          getExtensionElement('icon:tracker:facebook_connect:blocked'),
        ).toBeDisplayed();
      });
    });

    // Scope for Firefox webRequest API tests
    if (browser.isFirefox) {
      it('adds $replace network filter', async function () {
        await setCustomFilters([
          `||${PAGE_DOMAIN}^$replace=/<title>.*<\\/title>/<title>hello world<\\/title>/`,
        ]);

        await browser.url(PAGE_URL);
        await expect(await browser.getTitle()).toBe('hello world');
      });
    }

    it('removes custom filters in settings page', async function () {
      await setCustomFilters([]);
      await setPrivacyToggle('custom-filters', false);
    });
  });
});
