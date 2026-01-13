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

import { $, browser, expect } from '@wdio/globals';
import { enableExtension, setPrivacyToggle } from '../utils.js';

describe('Experimental Features', function () {
  before(enableExtension);

  describe('Disable fixes filters', function () {
    before(async function () {
      await setPrivacyToggle('experimental-filters', true);
    });

    after(async function () {
      await setPrivacyToggle('experimental-filters', false);
    });

    it('should apply fixes filters', async function () {
      await browser.url('https://www.ghostery.com/');

      const copyrights = await $('.ds-footer-copyrights');
      if (await copyrights.isExisting()) {
        await expect(copyrights).not.toBeDisplayed();
      }
    });

    it('should not apply fixes filters when `fixesFilters` option is enabled', async function () {
      await setPrivacyToggle('fixes-filters', false);

      await browser.url('https://www.ghostery.com/');

      const copyrights = await $('.ds-footer-copyrights');
      if (await copyrights.isExisting()) {
        await expect(copyrights).toBeDisplayed();
      }

      await setPrivacyToggle('fixes-filters', true);
    });
  });
});
