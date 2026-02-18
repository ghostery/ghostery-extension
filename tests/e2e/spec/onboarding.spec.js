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

import { browser, expect } from '@wdio/globals';
import { enableExtension, getExtensionElement, getExtensionPageURL, openPanel } from '../utils.js';

describe('Onboarding', function () {
  it('keeps ghostery disabled', async function () {
    await browser.url('about:blank');
    await browser.url(getExtensionPageURL('onboarding'));

    await getExtensionElement('button:skip').click();
    await expect(getExtensionElement('view:skip')).toBeDisplayed();

    await openPanel();
    await expect(getExtensionElement('button:enable')).toBeDisplayed();
  });

  if (browser.isChromium) {
    it('shows the dialog with Privacy Policy', async function () {
      await browser.url('about:blank');
      await browser.url(getExtensionPageURL('onboarding'));

      await getExtensionElement('text:description', 'a:last-of-type').click();

      await expect(getExtensionElement('text:privacy-policy', 'p')).toBeDisplayed();
    });
  }

  it('enables ghostery', () => enableExtension({ force: true }));
});
