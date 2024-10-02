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
  navigateToExtensionPage,
  getExtensionElement,
  enableExtension,
} from './utils.js';

async function updatePrivacySettings(name, value) {
  await navigateToExtensionPage('settings');

  const toggle = await getExtensionElement(`toggle:${name}`);
  if ((await toggle.getProperty('value')) !== value) {
    await toggle.click();
  }

  await expect(toggle).toHaveElementProperty('value', value);
}

describe('Main features', () => {
  before(enableExtension);

  describe('Never-consent', () => {
    beforeEach(() => updatePrivacySettings('never-consent', false));

    const ESPN_CONSENT_POPUP_SELECTOR = '#onetrust-banner-sdk';

    it('should display consent popup', async () => {
      await browser.navigateTo('https://www.espn.com/');
      await expect($(ESPN_CONSENT_POPUP_SELECTOR)).toBeDisplayed();
    });

    it('should close the consent popup', async () => {
      await updatePrivacySettings('never-consent', true);

      await browser.navigateTo('https://www.espn.com/');
      await expect($(ESPN_CONSENT_POPUP_SELECTOR)).not.toBeDisplayed();
    });
  });

  describe.skip('Ad-Blocking', () => {
    beforeEach(() => updatePrivacySettings('ad-blocking', false));

    it('should display ads on a page', async () => {
      await browser.navigateTo('https://www.espn.com/');
      await browser.pause(1000); // Wait for ads to load

      let displayed = false;
      for (const ad of await $$('.ad-300')) {
        if (displayed) break;
        displayed = await ad.isDisplayed();
      }

      await browser.debug();
    });

    it('should block ads on a page', async () => {
      await updatePrivacySettings('ad-blocking', true);

      await browser.navigateTo('https://www.espn.com/');
      await browser.pause(1000); // Wait for ads to load

      for (const ad of await $$('.ad-300')) {
        await expect(ad).not.toBeDisplayed();
      }
    });
  });
});
