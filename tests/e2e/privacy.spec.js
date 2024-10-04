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
  getExtensionElement,
  enableExtension,
  getExtensionPageURL,
} from './utils.js';

async function updatePrivacySettings(name, value) {
  await browser.url(await getExtensionPageURL('settings'));

  const toggle = await getExtensionElement(`toggle:${name}`);
  if ((await toggle.getProperty('value')) !== value) {
    await toggle.click();
  }

  await expect(toggle).toHaveElementProperty('value', value);
  await browser.pause(1000);
}

describe('Main features', () => {
  before(enableExtension);

  describe('Never-consent', () => {
    beforeEach(() => updatePrivacySettings('never-consent', false));

    const WEBSITE_URL = 'https://www.onet.pl/';
    const SELECTOR = '.cmp-popup_popup';

    it('should display consent popup', async () => {
      await browser.url(WEBSITE_URL);
      await expect($(SELECTOR)).toBeDisplayed();
    });

    it('should close the consent popup', async () => {
      await updatePrivacySettings('never-consent', true);

      await browser.url(WEBSITE_URL);
      await expect($(SELECTOR)).not.toBeDisplayed();
    });
  });

  describe('Ad-Blocking', () => {
    beforeEach(() => updatePrivacySettings('ad-blocking', false));

    const WEBSITE_URL = 'https://www.onet.pl/';
    const SELECTOR = '[class*="AdSlotPlaceholder_"]';

    it('should display ads on a page', async () => {
      await browser.url(WEBSITE_URL);

      let displayed = false;
      for (const ad of await $$(SELECTOR)) {
        if (displayed) break;
        displayed = await ad.isDisplayed();
      }

      expect(displayed).toBe(true);
    });

    it('should block ads on a page', async () => {
      await updatePrivacySettings('ad-blocking', true);

      await browser.url(WEBSITE_URL);

      for (const ad of await $$(SELECTOR)) {
        await expect(ad).not.toBeDisplayed();
      }
    });
  });

  describe('Global pause', () => {
    beforeEach(() => updatePrivacySettings('global-pause', false));

    const WEBSITE_URL = 'https://www.onet.pl';

    it('should pause the extension', async () => {
      await updatePrivacySettings('global-pause', true);

      await browser.url(WEBSITE_URL, { wait: 'complete', timeout: 20000 });

      await browser.newWindow(await getExtensionPageURL('panel'));
      expect(getExtensionElement('component:feedback')).not.toBeDisplayed();
    });
  });
});
