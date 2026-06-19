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
  setAdditionalFiltersToggle,
  setCustomFilters,
  disableCustomFilters,
  waitForIdleBackgroundTasks,
  switchFrame,
  PAGE_DOMAIN,
  PAGE_URL,
} from '../utils.js';

async function setCustomFiltersInput(lines) {
  await setAdditionalFiltersToggle('custom-filters', true);

  const input = await getExtensionElement('input:custom-filters');
  await browser.execute(
    (el, value) => {
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    },
    input,
    lines.join('\n'),
  );

  await getExtensionElement('button:custom-filters:save').click();
  await waitForIdleBackgroundTasks();
}

async function addCustomFilterList(url) {
  await setAdditionalFiltersToggle('custom-filters', true);

  const input = await getExtensionElement('input:custom-filters:filter-list');
  await input.setValue(url);

  await getExtensionElement('button:custom-filters:add-filter-list').click();
  await waitForIdleBackgroundTasks();
}

// Errors are wrapped in a collapsed <details> element - expand it to read the text
async function getCustomFiltersErrorsText() {
  const component = await getExtensionElement('component:custom-filters:errors');
  await component.$('summary').click();

  return component.getText();
}

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
    await setAdditionalFiltersToggle('custom-filters', false);

    await browser.url(PAGE_URL);
    await expect($('#custom-filter')).toBeDisplayed();

    await browser.url('ghostery:panel');
    await getExtensionElement('button:detailed-view').click();

    await expect(getExtensionElement('icon:tracker:facebook_connect:blocked')).toBeDisplayed();

    await setAdditionalFiltersToggle('custom-filters', true);
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

    await browser.url('ghostery:panel');
    await getExtensionElement('button:detailed-view').click();

    if (browser.isChromium) {
      await expect(getExtensionElement(`icon:tracker:www.example.net:blocked`)).toBeDisplayed();
      await expect(getExtensionElement(`icon:tracker:www.example.org:blocked`)).not.toBeDisplayed();
    } else if (browser.isFirefox) {
      await expect(getExtensionElement(`icon:tracker:www.example.net:blocked`)).not.toBeDisplayed();
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

      const text = await getCustomFiltersErrorsText();
      await expect(text).toContain('Filter not supported');
    });

    it('shows error when exceeding max dynamic rules', async function () {
      const lines = Array.from({ length: 25001 }, (_, i) => `||f${i}.invalid^`);
      await setCustomFiltersInput(lines);

      const text = await getCustomFiltersErrorsText();
      await expect(text).toContain('Too many custom network filters');
    });

    it('shows error when exceeding max regex rules', async function () {
      const lines = Array.from({ length: 501 }, (_, i) => `/rx${i}x.invalid/`);
      await setCustomFiltersInput(lines);

      const text = await getCustomFiltersErrorsText();
      await expect(text).toContain('Too many custom regex network filters');
    });
  }

  it('preserves escaped commas and special characters in scriptlet arguments', async function () {
    await setCustomFilters([`${PAGE_DOMAIN}##+js(rpnt, h1, Test Page, 100%\\, escaped)`]);

    await browser.url(PAGE_URL);
    await expect($('h1')).toHaveText('100%, escaped');
  });

  it('applies a remote filter list', async function () {
    // The element is visible before the filter list is applied
    await browser.url(PAGE_URL);
    await expect($('#filter-list')).toBeDisplayed();

    // Add the filter list served by the local test server
    await addCustomFilterList(`${PAGE_URL}filter-list.txt`);

    // The list name parsed from its `! Title:` metadata is shown in the UI
    await expect(getExtensionElement('component:custom-filters:filter-lists')).toHaveText(
      expect.stringContaining('E2E Test Filter List'),
    );

    // The cosmetic rule from the list hides the element
    await browser.url(PAGE_URL);
    await expect($('#filter-list')).not.toBeDisplayed();

    // The network rule from the list blocks the tracker request
    await browser.url('ghostery:panel');
    await getExtensionElement('button:detailed-view').click();
    await expect(
      getExtensionElement('icon:tracker:www.filter-list-tracker.test:blocked'),
    ).toBeDisplayed();

    // Remove the filter list and verify the element is visible again
    await browser.url('ghostery:settings');
    await getExtensionElement('button:additional-filters').click();
    await getExtensionElement('button:custom-filters:remove-filter-list').click();
    await waitForIdleBackgroundTasks();

    await browser.url(PAGE_URL);
    await expect($('#filter-list')).toBeDisplayed();

    // The network rule no longer blocks the tracker request
    await browser.url('ghostery:panel');
    await getExtensionElement('button:detailed-view').click();
    await expect(
      getExtensionElement('icon:tracker:www.filter-list-tracker.test:blocked'),
    ).not.toBeDisplayed();
  });
});
