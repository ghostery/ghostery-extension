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
import { browser, expect, $, $$ } from '@wdio/globals';
import {
  enableExtension,
  getExtensionElement,
  getExtensionPageURL,
  switchToPanel,
} from './utils.js';

async function updatePrivacySettings(name, value) {
  await browser.url(await getExtensionPageURL('settings'));

  const toggle = await getExtensionElement(`toggle:${name}`);
  if ((await toggle.getProperty('value')) !== value) {
    await toggle.click();
  }

  await expect(toggle).toHaveElementProperty('value', value);
}

describe('Privacy', () => {
  before(enableExtension);

  describe('Never-consent', () => {
    beforeEach(() => updatePrivacySettings('never-consent', false));

    const WEBSITE_URL = 'https://stackoverflow.com/';
    const SELECTOR = '#onetrust-consent-sdk';

    it('displays consent popup', async () => {
      await browser.url(WEBSITE_URL);

      await expect($(SELECTOR)).toBeDisplayed();
    });

    it('closes the consent popup', async () => {
      await updatePrivacySettings('never-consent', true);

      await browser.url(WEBSITE_URL);
      // Let the never-consent take effect
      await browser.pause(2000);

      // Never-consent can left the cmp structure until next page load
      await browser.url(WEBSITE_URL);

      await expect($(SELECTOR)).not.toBeDisplayed();
    });
  });

  describe('Ad-Blocking', () => {
    beforeEach(() => updatePrivacySettings('ad-blocking', false));

    const WEBSITE_URL = 'https://www.onet.pl/';
    const SELECTOR = 'div[class^="AdSlotPlaceholder_"]';

    it('displays ads on a page', async () => {
      await browser.url(WEBSITE_URL);

      let displayed = false;
      for (const ad of await $$(SELECTOR)) {
        if (displayed) break;
        displayed = await ad.isDisplayed();
      }

      expect(displayed).toBe(true);
    });

    it('blocks ads on a page', async () => {
      await updatePrivacySettings('ad-blocking', true);

      await browser.url(WEBSITE_URL);

      for (const ad of await $$(SELECTOR)) {
        await expect(ad).not.toBeDisplayed();
      }
    });
  });

  describe('Anti-Tracking', () => {
    beforeEach(() => updatePrivacySettings('anti-tracking', false));

    const WEBSITE_URL = 'https://www.aarp.org/';
    const TRACKER_IDS = [
      'ispot.tv',
      'facebook_connect',
      'pinterest_conversion_tracker',
    ];

    it('does not block tracker requests on the page', async () => {
      await browser.url(WEBSITE_URL);

      await switchToPanel(async () => {
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

    it('blocks tracker requests on the page', async () => {
      await updatePrivacySettings('anti-tracking', true);
      await browser.url(WEBSITE_URL);

      await switchToPanel(async () => {
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

  describe('Regional Filters', () => {
    beforeEach(() => updatePrivacySettings('regional-filters', false));

    const WEBSITE_URL = 'https://www.cowwilanowie.pl/';
    const SELECTOR = '.a-slider';

    it('shows the ads on the page', async () => {
      await browser.url(WEBSITE_URL);
      await expect($(SELECTOR)).toBeDisplayed();
    });

    it('hides the ads on the page', async () => {
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

  describe('Pause Website', () => {
    const WEBSITE_URL = 'https://www.onet.pl/';
    const SELECTOR = 'div[class^="AdSlotPlaceholder_"]';

    it("pauses the website's privacy settings", async () => {
      await browser.url(WEBSITE_URL);

      await switchToPanel(async () => {
        if (
          !(await getExtensionElement('component:pause').getProperty('paused'))
        ) {
          await getExtensionElement('button:pause').click();
          await browser.pause(1000); // Pausing triggers the page reload after 1s
        }
      });
      await expect($(SELECTOR)).toBeDisplayed();

      await switchToPanel(async () => {
        if (
          await getExtensionElement('component:pause').getProperty('paused')
        ) {
          await getExtensionElement('button:pause').click();
          await browser.pause(1000); // Pausing triggers the page reload after 1s
        }
      });

      await expect($(SELECTOR)).not.toBeDisplayed();
    });
  });

  describe('Global pause', () => {
    const WEBSITE_URL = 'https://www.onet.pl/';

    it('shows blocked trackers in the panel', async () => {
      await updatePrivacySettings('global-pause', false);
      await browser.url(WEBSITE_URL);

      await switchToPanel(async () => {
        await expect(getExtensionElement('component:feedback')).toBeDisplayed();
      });
    });

    it("doesn't show blocked trackers in the panel", async () => {
      await updatePrivacySettings('global-pause', true);
      await browser.url(WEBSITE_URL);

      await switchToPanel(async () => {
        await expect(
          getExtensionElement('component:feedback'),
        ).not.toBeDisplayed();
      });
    });
  });
});
