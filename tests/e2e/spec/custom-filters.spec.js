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
  setCustomFilters,
  disableCustomFilters,
  switchFrame,
  PAGE_DOMAIN,
  PAGE_URL,
} from '../utils.js';

describe('Custom Filters', function () {
  before(enableExtension);
  before(async () => {
    await setCustomFilters([
      `${PAGE_DOMAIN}###custom-filter`,
      `@@connect.facebook.net^`,
      `/.*example.com/`,
      `${PAGE_DOMAIN}##+js(rpnt, h1, Test Page, "Hello world")`,
      `${PAGE_DOMAIN}##+js(no-fetch-if, ads.js, war:noop.js)`,
      `!#if env_chromium
      ||example.net^
      !#endif`,
      `!#if env_firefox
      ||example.org^
      !#endif`,
    ]);
  });

  after(disableCustomFilters);

  it('disables custom filters by toggle', async function () {
    await setPrivacyToggle('custom-filters', false);

    await browser.url(PAGE_URL);
    await expect($('#custom-filter')).toBeDisplayed();

    await browser.url('ghostery:panel');
    await getExtensionElement('button:detailed-view').click();

    await expect(getExtensionElement('icon:tracker:facebook_connect:blocked')).toBeDisplayed();

    await setPrivacyToggle('custom-filters', true);
  });

  it('supports custom network filter', async function () {
    await browser.url(PAGE_URL);

    await browser.url('ghostery:panel');
    await getExtensionElement('button:detailed-view').click();

    await expect(getExtensionElement(`icon:tracker:facebook_connect:blocked`)).not.toBeDisplayed();
    await expect(getExtensionElement(`icon:tracker:facebook_connect:modified`)).not.toBeDisplayed();
  });

  it('supports regex filter', async function () {
    await browser.url(PAGE_URL);

    await browser.url('ghostery:panel');
    await getExtensionElement('button:detailed-view').click();

    await expect(getExtensionElement(`icon:tracker:www.example.com:blocked`)).toBeDisplayed();
  });

  it('supports cosmetic filter', async function () {
    await browser.url(PAGE_URL);
    await expect($('#custom-filter')).not.toBeDisplayed();

    await switchFrame($('#iframe-static'));
    await expect($('#custom-filter')).not.toBeDisplayed();

    await switchFrame($('#iframe-dynamic'));
    await expect($('#custom-filter')).not.toBeDisplayed();

    await switchFrame($('#iframe-local'));
    await expect($('#custom-filter')).not.toBeDisplayed();

    await browser.switchFrame(null);
  });

  it('supports scriptlet filter', async function () {
    await browser.url(PAGE_URL);
    await expect($('h1')).toHaveText('Hello world');
  });

  it('supports scriptlet filter depending on `scriptletsGlobal.warOrigin`', async function () {
    await browser.url(PAGE_URL);
    await $('#war').waitForExist();
    await expect($('#war')).toHaveText('(function(){"use strict"})();');
  });

  it('applies preprocessor to the network filter', async function () {
    await browser.url(PAGE_URL);

    await openPanel();
    await getExtensionElement('button:detailed-view').click();

    if (browser.isFirefox) {
      await expect(getExtensionElement(`icon:tracker:www.example.net:blocked`)).toBeDisplayed();
    } else if (browser.isChromium) {
      await expect(getExtensionElement(`icon:tracker:www.example.org:blocked`)).toBeDisplayed();
    }
  });

  // Scope for Firefox webRequest API tests
  if (browser.isFirefox) {
    it('supports $replace network filter', async function () {
      await setCustomFilters([
        `||${PAGE_DOMAIN}^$replace=/<title>.*<\\/title>/<title>hello world<\\/title>/`,
      ]);

      await browser.url(PAGE_URL);
      await expect(await browser.getTitle()).toBe('hello world');
    });
  }

  if (browser.isChromium) {
    it('throws for unsupported regex filter', async function () {
      await setCustomFilters([`/(?>ab)c/`]);

      const errors = await getExtensionElement('component:custom-filters:errors');

      const text = await errors.getText();
      await expect(text).toContain('Syntax error');
    });
  }
});
