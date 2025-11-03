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
  openPanel,
  waitForIdleBackgroundTasks,
} from '../utils.js';

import { PAGE_URL } from '../wdio.conf.js';

const ADBLOCKING_SELECTOR = '[data-ad-name]';

describe('Main Features', function () {
  before(enableExtension);

  describe('Never-consent', function () {
    const WEBSITE_URL = 'https://stackoverflow.com/';
    const SELECTOR = '#onetrust-consent-sdk';

    it('displays consent popup', async function () {
      await setPrivacyToggle('never-consent', false);
      await browser.url(WEBSITE_URL);

      // In some regions the cmp element might not be loaded at all
      // so we only check if the CMP is visible if the element exists
      const cmp = await $(SELECTOR);
      if (await cmp.isExisting()) await expect(cmp).toBeDisplayed();
    });

    it('closes the consent popup', async function () {
      await setPrivacyToggle('never-consent', true);

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
  });

  describe('Ad-Blocking', function () {
    const DYNAMIC_SELECTOR = '#ghostery-test-page-element-1';

    it('does not block ads on a page', async function () {
      await setPrivacyToggle('ad-blocking', false);
      await browser.url(PAGE_URL);
      await expect($(ADBLOCKING_SELECTOR)).toBeDisplayed();
    });

    it('blocks ads on a page', async function () {
      await setPrivacyToggle('ad-blocking', true);

      await browser.url(PAGE_URL);
      await expect($(ADBLOCKING_SELECTOR)).not.toBeDisplayed();
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

      await expect($(DYNAMIC_SELECTOR)).toExist();
      await expect($(DYNAMIC_SELECTOR)).not.toBeDisplayed();
    });
  });

  describe('Anti-Tracking', function () {
    const TRACKER_IDS = ['facebook_connect', 'pinterest_conversion_tracker'];

    it('does not block tracker requests on the page', async function () {
      await setPrivacyToggle('anti-tracking', false);
      await browser.url(PAGE_URL);

      await openPanel();
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

    it('blocks tracker requests on the page', async function () {
      await setPrivacyToggle('anti-tracking', true);
      await browser.url(PAGE_URL);

      await openPanel();
      await getExtensionElement('button:detailed-view').click();

      for (const trackerId of TRACKER_IDS) {
        await expect(
          getExtensionElement(`icon:tracker:${trackerId}:blocked`),
        ).toBeDisplayed();
      }
    });
  });

  describe('Regional Filters', function () {
    const WEBSITE_URL = 'https://www.cowwilanowie.pl/';
    const SELECTOR = '.a-slider';

    it('shows the ads on the page', async function () {
      await setPrivacyToggle('regional-filters', false);
      await browser.url(WEBSITE_URL);
      await expect($(SELECTOR)).toBeDisplayed();
    });

    it('hides the ads on the page', async function () {
      await setPrivacyToggle('regional-filters', true);
      await getExtensionElement('button:regional-filters').click();

      const checkbox = await getExtensionElement(
        'checkbox:regional-filters:pl',
      );

      if (!(await checkbox.getProperty('checked'))) {
        await checkbox.click();
        await expect(checkbox).toHaveElementProperty('checked', true);
      }

      // Allow engines to reload
      await waitForIdleBackgroundTasks();

      await browser.url(WEBSITE_URL);
      await expect($(SELECTOR)).not.toBeDisplayed();
      await setPrivacyToggle('regional-filters', false);
    });
  });

  describe('Global Pause', function () {
    it('blocks trackers when is disabled', async function () {
      await setPrivacyToggle('global-pause', false);
      await browser.url(PAGE_URL);

      await expect($(ADBLOCKING_SELECTOR)).not.toBeDisplayed();
    });

    it("doesn't block trackers when is enabled", async function () {
      await setPrivacyToggle('global-pause', true);
      await browser.url(PAGE_URL);

      await expect($(ADBLOCKING_SELECTOR)).toBeDisplayed();

      await setPrivacyToggle('global-pause', false);
    });
  });

  describe('Website Pause', function () {
    it("pauses the website's privacy settings", async function () {
      // Ensure ad-blocking is enabled
      await browser.url(PAGE_URL);
      await expect($(ADBLOCKING_SELECTOR)).not.toBeDisplayed();

      // Pause the website
      await openPanel();
      await getExtensionElement('button:pause').click();
      await waitForIdleBackgroundTasks();

      // Reload and check ads are displayed
      await browser.url(PAGE_URL);
      await expect($(ADBLOCKING_SELECTOR)).toBeDisplayed();

      // Resume the website
      await openPanel();
      await getExtensionElement('button:resume').click();
      await waitForIdleBackgroundTasks();

      // Reload and check ads are blocked again
      await browser.url(PAGE_URL);
      await expect($(ADBLOCKING_SELECTOR)).not.toBeDisplayed();
    });
  });
});
