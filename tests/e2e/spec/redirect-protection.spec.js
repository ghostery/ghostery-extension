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

import {
  enableExtension,
  getExtensionElement,
  setCustomFilters,
  setAdditionalFiltersToggle,
  setToggle,
  disableCustomFilters,
  PAGE_DOMAIN,
  PAGE_URL,
  REDIRECT_PAGE_URL,
} from '../utils.js';

async function openRedirectSettings() {
  await browser.url('ghostery:settings');
  await getExtensionElement('button:redirect-protection').click();
}

async function setRedirectProtectionToggle(value) {
  await openRedirectSettings();
  await setToggle('redirect-protection', value);
}

async function expectOnWarningPage(expected) {
  const url = await browser.getUrl();
  expect(url.includes('pages/redirect-protection')).toBe(expected);
}

async function waitForNavigation() {
  await browser.waitUntil(
    async () => !(await browser.getUrl()).includes('pages/redirect-protection'),
    { timeout: 5000, timeoutMsg: 'Did not navigate away from warning page' },
  );
}

describe('Redirect Protection', function () {
  before(enableExtension);
  before(() => setCustomFilters([`||${PAGE_DOMAIN}^$document`]));

  after(() => disableCustomFilters());

  it('is enabled by default', async function () {
    await openRedirectSettings();

    const toggle = await getExtensionElement('toggle:redirect-protection');
    const value = await toggle.getProperty('value');

    await expect(value).toBe(true);
  });

  it('redirects to warning page when navigating to blocked domain', async function () {
    await browser.url(PAGE_URL);

    await expectOnWarningPage(true);
    await expect(getExtensionElement('text:redirect-protection:url')).toHaveText(PAGE_URL, {
      containing: true,
    });
  });

  it('redirects to warning page when navigating to redirecting domain', async function () {
    await browser.url(REDIRECT_PAGE_URL);

    await expectOnWarningPage(true);
    await expect(getExtensionElement('text:redirect-protection:url')).toHaveText(PAGE_URL, {
      containing: true,
    });
  });

  it("doesn't redirect when redirect protection is disabled", async function () {
    await setRedirectProtectionToggle(false);

    await browser.url(PAGE_URL);
    await expectOnWarningPage(false);

    // Re-enable for next tests
    await setRedirectProtectionToggle(true);
  });

  it("doesn't redirect when custom filters are disabled (keeping the content)", async function () {
    await setAdditionalFiltersToggle('custom-filters', false);

    await browser.url(PAGE_URL);
    await expectOnWarningPage(false);

    // Re-enable for next tests
    await setAdditionalFiltersToggle('custom-filters', true);
  });

  describe('Proceed with exception', function () {
    before(async () => {
      await browser.url(PAGE_URL);

      const checkbox = await browser.waitUntil(async () =>
        getExtensionElement('checkbox:redirect-protection:exception'),
      );

      await checkbox.click();

      await getExtensionElement('button:redirect-protection:proceed').click();
      await waitForNavigation();
    });

    it('adds domain exception when clicking "Dont warn me again"', async function () {
      await openRedirectSettings();

      await expect(
        getExtensionElement(`item:redirect-protection:exception:${PAGE_DOMAIN}`),
      ).toBeDisplayed();
    });

    it('navigates directly after domain is added to exceptions', async function () {
      await browser.url(PAGE_URL);

      await expectOnWarningPage(false);
    });

    it('shows domain in redirect exceptions list', async function () {
      await openRedirectSettings();

      await expect(
        getExtensionElement(`item:redirect-protection:exception:${PAGE_DOMAIN}`),
      ).toBeDisplayed();
    });

    it('removes domain exception', async function () {
      await openRedirectSettings();

      await getExtensionElement(`button:redirect-protection:remove:${PAGE_DOMAIN}`).click();

      await expect(
        getExtensionElement('component:redirect-protection:empty-state'),
      ).toBeDisplayed();
    });

    describe('Settings page exceptions management', function () {
      it('adds exception via settings page', async function () {
        await browser.url(PAGE_URL);
        await expectOnWarningPage(true);

        await openRedirectSettings();
        await getExtensionElement('button:redirect-protection:add').click();
        await getExtensionElement('input:redirect-protection:hostname').setValue(PAGE_DOMAIN);
        await getExtensionElement('button:redirect-protection:save').click();

        await expect(
          getExtensionElement(`item:redirect-protection:exception:${PAGE_DOMAIN}`),
        ).toBeDisplayed();
      });

      it('navigates directly when exception is added', async function () {
        await browser.url(PAGE_URL);
        await expectOnWarningPage(false);
      });

      it('removes exception via settings page', async function () {
        await openRedirectSettings();
        await getExtensionElement(`button:redirect-protection:remove:${PAGE_DOMAIN}`).click();

        await expect(
          getExtensionElement('component:redirect-protection:empty-state'),
        ).toBeDisplayed();
      });

      it('redirects again after exception is removed', async function () {
        await browser.url(PAGE_URL);
        await expectOnWarningPage(true);
      });
    });
  });

  describe('Proceed once', function () {
    it('allows navigation when clicking proceed button', async function () {
      await browser.url(PAGE_URL);

      await getExtensionElement('button:redirect-protection:proceed').click();

      await waitForNavigation();
      expect(await browser.getUrl()).toBe(PAGE_URL);
    });
  });
});

// Type-less filters (no $document modifier) must NOT redirect main_frame on
// either platform. Chrome MV3 DNR enforces this by default (omitting
// resourceTypes excludes main_frame). Firefox previously matched main_frame
// for type-less filters via @ghostery/adblocker's FROM_ANY mask; we now skip
// those matches in src/background/adblocker/network.js.
describe('Type-less filter does not affect main_frame', function () {
  before(enableExtension);
  before(() => setCustomFilters([`||${PAGE_DOMAIN}^`]));
  after(() => disableCustomFilters());

  it('does not redirect when redirect protection is enabled', async function () {
    await browser.url('ghostery:settings');
    await getExtensionElement('button:redirect-protection').click();
    await setToggle('redirect-protection', true);

    await browser.url(PAGE_URL);
    expect((await browser.getUrl()).includes('pages/redirect-protection')).toBe(false);
    expect(await browser.getTitle()).toBe('E2E Test Page');
  });

  it('does not block when redirect protection is disabled', async function () {
    await browser.url('ghostery:settings');
    await getExtensionElement('button:redirect-protection').click();
    await setToggle('redirect-protection', false);

    await browser.url(PAGE_URL);
    expect((await browser.getUrl()).includes('pages/redirect-protection')).toBe(false);
    expect(await browser.getTitle()).toBe('E2E Test Page');

    await browser.url('ghostery:settings');
    await getExtensionElement('button:redirect-protection').click();
    await setToggle('redirect-protection', true);
  });
});
