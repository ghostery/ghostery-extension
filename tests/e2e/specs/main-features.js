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
import { navigateToPage, getElement, enableExtension } from '../utils.js';

describe('Main features', () => {
  before(enableExtension);

  describe('Never-consent', () => {
    beforeEach(async () => {
      // Turn off the never-consent
      await navigateToPage('settings');

      const toggle = await getElement('toggle:never-consent');

      if (await toggle.getProperty('value')) {
        await toggle.click();
      }

      await expect(toggle).toHaveElementProperty('value', false);
    });

    it('should display consent popup when turned off', async () => {
      await browser.navigateTo('https://www.espn.com/');
      await expect($('#onetrust-banner-sdk')).toBeDisplayed();
    });

    it('should close the consent popup when turned on', async () => {
      // Turn on the never-consent
      await navigateToPage('settings');

      const toggle = await getElement('toggle:never-consent');
      await toggle.click();
      await expect(toggle).toHaveElementProperty('value', true);

      await browser.navigateTo('https://www.espn.com/');
      await expect($('#onetrust-banner-sdk')).not.toBeDisplayed();
    });
  });
});
