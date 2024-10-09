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
  switchToPanel,
} from './utils.js';

import { PAGE_URL } from '../wdio.conf.js';

async function updatePrivacySettings(name, value) {
  await browser.url(await getExtensionPageURL('settings'));

  const toggle = await getExtensionElement(`toggle:${name}`);
  if ((await toggle.getProperty('value')) !== value) {
    await toggle.click();
  }

  await expect(toggle).toHaveElementProperty('value', value);

  // Allow background process to update the settings
  // E.g. reload engines / DNR rules
  await browser.pause(2000);
}

describe('Privacy', function () {
  before(enableExtension);

  describe('Never-consent', function () {
    beforeEach(() => updatePrivacySettings('never-consent', false));

    const WEBSITE_URL = 'https://stackoverflow.com/';
    const SELECTOR = '#onetrust-consent-sdk';

    it('displays consent popup', async function () {
      await browser.url(WEBSITE_URL);

      await expect($(SELECTOR)).toBeDisplayed();
    });

    it('closes the consent popup', async function () {
      await updatePrivacySettings('never-consent', true);

      await browser.url(WEBSITE_URL);
      // Let the never-consent take effect
      await browser.pause(2000);

      // Never-consent can left the cmp structure until next page load
      await browser.url(WEBSITE_URL);

      await expect($(SELECTOR)).not.toBeDisplayed();
    });
  });

  describe('Ad-Blocking', function () {
    beforeEach(() => updatePrivacySettings('ad-blocking', false));

    const SELECTOR = 'ad-slot';

    it('does not block ads on a page', async function () {
      await browser.url(PAGE_URL);
      await expect($(SELECTOR)).toBeDisplayed();
    });

    it('blocks ads on a page', async function () {
      await updatePrivacySettings('ad-blocking', true);

      await browser.url(PAGE_URL);
      await expect($(SELECTOR)).not.toBeDisplayed();
    });
  });

  describe('Anti-Tracking', function () {
    beforeEach(() => updatePrivacySettings('anti-tracking', false));

    const TRACKER_IDS = ['facebook_connect', 'pinterest_conversion_tracker'];

    it('does not block tracker requests on the page', async function () {
      await disableCache();
      await browser.url(PAGE_URL);

      await switchToPanel(async function () {
        await getExtensionElement('button:detailed-view').click();

        for (const trackerId of TRACKER_IDS) {
          const trackerEl = await getExtensionElement(
            `button:tracker:${trackerId}`,
          );

          if (trackerEl.isDisplayed()) {
            await expect(
              getExtensionElement(`icon:tracker:${trackerId}:blocked`),
            ).not.toBeDisplayed();
            await expect(
              getExtensionElement(`icon:tracker:${trackerId}:modified`),
            ).not.toBeDisplayed();
          }
        }
      });
    });

    it('blocks tracker requests on the page', async function () {
      await updatePrivacySettings('anti-tracking', true);

      await disableCache();
      await browser.url(PAGE_URL);

      await switchToPanel(async function () {
        await getExtensionElement('button:detailed-view').click();

        for (const trackerId of TRACKER_IDS) {
          const trackerEl = await getExtensionElement(
            `button:tracker:${trackerId}`,
          );

          if (trackerEl.isDisplayed()) {
            await expect(
              getExtensionElement(`icon:tracker:${trackerId}:blocked`),
            ).toBeDisplayed();
          }
        }
      });
    });
  });

  describe('Regional Filters', function () {
    beforeEach(() => updatePrivacySettings('regional-filters', false));

    const WEBSITE_URL = 'https://www.cowwilanowie.pl/';
    const SELECTOR = '.a-slider';

    it('shows the ads on the page', async function () {
      await browser.url(WEBSITE_URL);
      await expect($(SELECTOR)).toBeDisplayed();
    });

    it('hides the ads on the page', async function () {
      await updatePrivacySettings('regional-filters', true);
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

  describe('Pause Website', function () {
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

  describe('Global pause', function () {
    it('shows blocked trackers in the panel', async function () {
      await updatePrivacySettings('global-pause', false);
      await browser.url(PAGE_URL);

      await switchToPanel(async function () {
        await expect(getExtensionElement('component:feedback')).toBeDisplayed();
      });
    });

    it("doesn't show blocked trackers in the panel", async function () {
      await updatePrivacySettings('global-pause', true);
      await browser.url(PAGE_URL);

      await switchToPanel(async function () {
        await expect(
          getExtensionElement('component:feedback'),
        ).not.toBeDisplayed();
      });
    });
  });
});
