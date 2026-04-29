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
  setAdditionalFiltersToggle,
  waitForIdleBackgroundTasks,
  expectAdsBlocked,
  switchFrame,
  ADBLOCKING_GLOBAL_SELECTOR,
  ADBLOCKING_URL_SELECTOR,
  TRACKER_IDS,
  PAGE_URL,
} from '../utils.js';

describe('Main Features', function () {
  before(enableExtension);

  describe('Never-consent', function () {
    const WEBSITE_URL = 'https://www.onetrust.com/';
    const SELECTOR = '#onetrust-consent-sdk';

    it('displays consent popup', async function () {
      await setPrivacyToggle('never-consent', false);
      await browser.url(WEBSITE_URL);

      // In some regions the cmp element might not be loaded at all
      // so we only check if the CMP is visible if the element exists
      const cmp = await $(SELECTOR);
      if (await cmp.isExisting()) await expect(cmp).toBeDisplayed();

      await setPrivacyToggle('never-consent', true);
    });

    it('closes the consent popup', async function () {
      await browser.url(WEBSITE_URL);
      // Let the never-consent take effect
      await browser.pause(2000);

      // Never-consent can left the cmp structure until next page load
      await browser.url(WEBSITE_URL);

      // In some regions the cmp element might not be loaded at all
      // so we only check if the CMP is visible if the element exists
      const cmp = await $(SELECTOR);
      if (await cmp.isExisting()) await expect(cmp).toHaveText('');
    });

    it('sets the Sec-GPC request header', async function () {
      await browser.url(PAGE_URL);

      const headers = await browser.execute(async () => {
        const response = await fetch('/headers', { cache: 'no-store' });
        return response.json();
      });

      expect(headers['sec-gpc']).toBe('1');

      await setPrivacyToggle('never-consent', false);

      await browser.url(PAGE_URL);

      const headersAfter = await browser.execute(async () => {
        const response = await fetch('/headers', { cache: 'no-store' });
        return response.json();
      });

      expect(headersAfter['sec-gpc']).toBeUndefined();

      await setPrivacyToggle('never-consent', true);
    });
  });

  describe('Ad-Blocking', function () {
    const DYNAMIC_SELECTOR = '#ghostery-test-page-element-1';

    it('does not block ads on a page', async function () {
      await setPrivacyToggle('ad-blocking', false);
      await browser.url(PAGE_URL);

      await expect($(ADBLOCKING_GLOBAL_SELECTOR)).toBeDisplayed();
      await expect($(ADBLOCKING_URL_SELECTOR)).toBeDisplayed();

      await switchFrame($('#iframe-static'));
      await expect($(ADBLOCKING_GLOBAL_SELECTOR)).toBeDisplayed();
      await expect($(ADBLOCKING_URL_SELECTOR)).toBeDisplayed();

      await switchFrame($('#iframe-dynamic'));
      await expect($(ADBLOCKING_GLOBAL_SELECTOR)).toBeDisplayed();
      await expect($(ADBLOCKING_URL_SELECTOR)).toBeDisplayed();

      await switchFrame($('#iframe-local'));
      await expect($(ADBLOCKING_GLOBAL_SELECTOR)).toBeDisplayed();
      await expect($(ADBLOCKING_URL_SELECTOR)).toBeDisplayed();

      await browser.switchFrame(null);
    });

    describe('block ads on different frames', function () {
      before(async function () {
        await setPrivacyToggle('ad-blocking', true);
        await browser.url(PAGE_URL);
      });

      it('main frame of the page', expectAdsBlocked);

      it('subframe of the page', async function () {
        await switchFrame($('#iframe-static'));
        await expectAdsBlocked();

        await browser.switchFrame(null);
      });

      it('dynamic subframe of the page', async function () {
        await switchFrame($('#iframe-dynamic'));
        await expectAdsBlocked();

        await browser.switchFrame(null);
      });

      it('local subframe of the page', async function () {
        await switchFrame($('#iframe-local'));
        await expectAdsBlocked();

        await browser.switchFrame(null);
      });
    });

    it('blocks dynamic ads on a page', async function () {
      await setPrivacyToggle('ad-blocking', true);
      await browser.url(PAGE_URL);

      await browser.execute(function (selector) {
        const adSlot = document.createElement('div');

        adSlot.id = selector.slice(1);
        adSlot.style.width = '300px';
        adSlot.style.height = '250px';
        adSlot.style.backgroundColor = 'yellow';

        document.body.appendChild(adSlot);
      }, DYNAMIC_SELECTOR);

      // The dynamic element might be blocked after a delay
      await browser.pause(100);

      await expect($(DYNAMIC_SELECTOR)).toExist();
      await expect($(DYNAMIC_SELECTOR)).not.toBeDisplayed();
    });
  });

  describe('Anti-Tracking', function () {
    it('does not block tracker requests on the page', async function () {
      await setPrivacyToggle('anti-tracking', false);
      await browser.url(PAGE_URL);

      await browser.url('ghostery:panel');
      await getExtensionElement('button:detailed-view').click();

      for (const trackerId of TRACKER_IDS) {
        await expect(getExtensionElement(`icon:tracker:${trackerId}:blocked`)).not.toBeDisplayed();
        await expect(getExtensionElement(`icon:tracker:${trackerId}:modified`)).not.toBeDisplayed();
      }
    });

    it('blocks tracker requests on the page', async function () {
      await setPrivacyToggle('anti-tracking', true);
      await browser.url(PAGE_URL);

      await browser.url('ghostery:panel');
      await getExtensionElement('button:detailed-view').click();

      for (const trackerId of TRACKER_IDS) {
        await expect(getExtensionElement(`icon:tracker:${trackerId}:blocked`)).toBeDisplayed();
      }
    });
  });

  describe('Regional Filters', function () {
    const WEBSITE_URL = 'https://www.cowwilanowie.pl/';
    const SELECTOR = '.a-re';

    it('shows the ads on the page', async function () {
      await setAdditionalFiltersToggle('regional-filters', false);

      await browser.url(WEBSITE_URL);
      await expect($(SELECTOR)).toBeDisplayed();

      await setAdditionalFiltersToggle('regional-filters', true);
    });

    it('hides the ads on the page', async function () {
      await setAdditionalFiltersToggle('regional-filters', true);
      const checkbox = await getExtensionElement('checkbox:regional-filters:pl');

      if (!(await checkbox.getProperty('checked'))) {
        await checkbox.click();
        await expect(checkbox).toHaveElementProperty('checked', true);
      }

      // Allow engines to reload
      await waitForIdleBackgroundTasks();

      await browser.url(WEBSITE_URL);
      await expect($(SELECTOR)).not.toBeDisplayed();
    });
  });

  describe('Global Pause', function () {
    it("doesn't block ads when is enabled", async function () {
      await setPrivacyToggle('global-pause', true);

      // Reload twice the page to ensure it is not loaded from cache
      await browser.url(PAGE_URL);
      await browser.url(PAGE_URL);

      await expect($(ADBLOCKING_GLOBAL_SELECTOR)).toBeDisplayed();

      await setPrivacyToggle('global-pause', false);
    });
  });

  describe('Website Pause', function () {
    it("pauses the website's privacy settings", async function () {
      // Ensure ad-blocking is enabled
      await browser.url(PAGE_URL);
      await expect($(ADBLOCKING_GLOBAL_SELECTOR)).not.toBeDisplayed();

      // Pause the website
      await browser.url('ghostery:panel');
      await getExtensionElement('button:pause').click();
      await waitForIdleBackgroundTasks();

      // Reload twice the page to ensure it is not loaded from cache
      await browser.url(PAGE_URL);
      await browser.url(PAGE_URL);

      await expect($(ADBLOCKING_GLOBAL_SELECTOR)).toBeDisplayed();

      // Resume the website
      await browser.url('ghostery:panel');
      await getExtensionElement('button:resume').click();
      await waitForIdleBackgroundTasks();

      // Reload and check ads are blocked again
      await browser.url(PAGE_URL);
      await expect($(ADBLOCKING_GLOBAL_SELECTOR)).not.toBeDisplayed();
    });
  });
});
