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
  await browser.pause(1000);
}

describe('Main features', () => {
  before(enableExtension);

  describe.only('Never-consent', () => {
    beforeEach(() => updatePrivacySettings('never-consent', false));

    const CONSENT_WEBSITE = 'https://www.onet.pl/';
    const CONSENT_POPUP_SELECTOR = '.cmp-popup_popup';

    it('should display consent popup', async () => {
      await browser.navigateTo(CONSENT_WEBSITE);
      await expect($(CONSENT_POPUP_SELECTOR)).toBeDisplayed();
    });

    it('should close the consent popup', async () => {
      await updatePrivacySettings('never-consent', true);

      await browser.navigateTo(CONSENT_WEBSITE);
      await expect($(CONSENT_POPUP_SELECTOR)).not.toBeDisplayed();
    });
  });

  describe('Ad-Blocking', () => {
    beforeEach(() => updatePrivacySettings('ad-blocking', false));

    const ADS_WEBSITE = 'https://www.onet.pl/';
    const ADS_SELECTOR = '[class*="AdSlotPlaceholder_"]';

    it('should display ads on a page', async () => {
      await browser.navigateTo(ADS_WEBSITE);

      let displayed = false;
      for (const ad of await $$(ADS_SELECTOR)) {
        if (displayed) break;
        displayed = await ad.isDisplayed();
      }
    });

    it('should block ads on a page', async () => {
      await updatePrivacySettings('ad-blocking', true);

      await browser.navigateTo(ADS_WEBSITE);

      for (const ad of await $$(ADS_SELECTOR)) {
        await expect(ad).not.toBeDisplayed();
      }
    });
  });
});
