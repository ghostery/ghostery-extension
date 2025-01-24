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
import { expect, browser } from '@wdio/globals';
import {
  enableExtension,
  getExtensionElement,
  getExtensionPageURL,
  setWhoTracksMeToggle,
} from '../utils.js';

describe('WhoTracksMe', function () {
  before(enableExtension);

  describe('Trackers Preview', function () {
    it('displays trackers stats', async function () {
      await setWhoTracksMeToggle('wtmSerpReport', true);
      await browser.url(
        getExtensionPageURL('trackers-preview') + '?domain=youtube.com',
      );

      const stats = await getExtensionElement('component:stats');
      await expect((await stats.getProperty('categories')).length > 0).toBe(
        true,
      );
    });

    it('disables the feature from popover', async function () {
      await setWhoTracksMeToggle('wtmSerpReport', true);
      await browser.url(
        getExtensionPageURL('trackers-preview') + '?domain=youtube.com',
      );

      await getExtensionElement('button:disable').click();
      await getExtensionElement('button:confirm').click();

      await browser.url(getExtensionPageURL('settings'));
      await getExtensionElement('button:whotracksme').click();

      const toggleValue = await getExtensionElement(
        'toggle:wtmSerpReport',
      ).getProperty('value');

      await expect(toggleValue).toBe(false);
    });
  });
});
