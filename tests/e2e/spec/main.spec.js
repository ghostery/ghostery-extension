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
  getExtensionPageURL,
  setToggle,
  switchToPanel,
} from '../utils.js';

import { PAGE_URL } from '../wdio.conf.js';

async function setPrivacyToggle(name, value) {
  await browser.url(await getExtensionPageURL('settings'));
  await setToggle(name, value);
}

describe('Main Features', function () {
  before(enableExtension);

  describe('Never-consent', function () {
    beforeEach(() => setPrivacyToggle('never-consent', false));

    const WEBSITE_URL = 'https://stackoverflow.com/';
    const SELECTOR = '#onetrust-consent-sdk';

    it('displays consent popup', async function () {
      await browser.url(WEBSITE_URL);

      await expect($(SELECTOR)).toBeDisplayed();
    });

    it('closes the consent popup', async function () {
      await setPrivacyToggle('never-consent', true);

      await browser.url(WEBSITE_URL);
      // Let the never-consent take effect
      await browser.pause(2000);

      // Never-consent can left the cmp structure until next page load
      await browser.url(WEBSITE_URL);

      await expect($(SELECTOR)).not.toBeDisplayed();
    });
  });

  describe('Ad-Blocking', function () {
    beforeEach(() => setPrivacyToggle('ad-blocking', false));

    const SELECTOR = 'ad-slot';

    it('does not block ads on a page', async function () {
      await browser.url(PAGE_URL);
      await expect($(SELECTOR)).toBeDisplayed();
    });

    it('blocks ads on a page', async function () {
      await setPrivacyToggle('ad-blocking', true);

      await browser.url(PAGE_URL);
      await expect($(SELECTOR)).not.toBeDisplayed();
    });
  });

  describe('Anti-Tracking', function () {
    beforeEach(() => setPrivacyToggle('anti-tracking', false));

    const TRACKER_IDS = ['facebook_connect', 'pinterest_conversion_tracker'];

    it('does not block tracker requests on the page', async function () {
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

    it('blocks tracker requests on the page', async function () {
      await setPrivacyToggle('anti-tracking', true);

      await browser.url(PAGE_URL);

      await switchToPanel(async function () {
        await getExtensionElement('button:detailed-view').click();

        for (const trackerId of TRACKER_IDS) {
          await expect(
            getExtensionElement(`icon:tracker:${trackerId}:blocked`),
          ).toBeDisplayed();
        }
      });
    });
  });

  describe('Regional Filters', function () {
    beforeEach(() => setPrivacyToggle('regional-filters', false));

    const WEBSITE_URL = 'https://www.cowwilanowie.pl/';
    const SELECTOR = '.a-slider';

    it('shows the ads on the page', async function () {
      await browser.url(WEBSITE_URL);
      await expect($(SELECTOR)).toBeDisplayed();
    });

    it('hides the ads on the page', async function () {
      await setPrivacyToggle('regional-filters', true);
      const checkbox = await getExtensionElement(
        'checkbox:regional-filters:pl',
      );

      if (!(await checkbox.getProperty('checked'))) {
        await checkbox.click();
        await expect(checkbox).toBeChecked();
      }

      await browser.url(WEBSITE_URL);
      await expect($(SELECTOR)).not.toBeDisplayed();
    });
  });

  describe('Global Pause', function () {
    it('shows blocked trackers in the panel', async function () {
      await setPrivacyToggle('global-pause', false);
      await browser.url(PAGE_URL);

      await switchToPanel(async function () {
        await expect(getExtensionElement('component:feedback')).toBeDisplayed();
      });
    });

    it("doesn't show blocked trackers in the panel", async function () {
      await setPrivacyToggle('global-pause', true);
      await browser.url(PAGE_URL);

      await switchToPanel(async function () {
        await expect(
          getExtensionElement('component:feedback'),
        ).not.toBeDisplayed();
      });
    });
  });

  describe('Website Pause', function () {
    it("pauses the website's privacy settings", async function () {
      await browser.url(PAGE_URL);

      await switchToPanel(async function () {
        const pauseComponent = await getExtensionElement('component:pause');
        const pauseButton = await getExtensionElement('button:pause');

        if (await pauseComponent.getProperty('paused')) {
          await pauseButton.click();
        }

        await pauseButton.click();
        await expect(
          getExtensionElement('component:feedback'),
        ).not.toBeDisplayed();

        await pauseButton.click();
        await expect(getExtensionElement('component:feedback')).toBeDisplayed();
      });
    });
  });
});
