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
import {
  getExtensionElement,
  getExtensionPageURL,
  switchToPanel,
} from './utils.js';

describe('Onboarding', function () {
  it('keeps ghostery disabled', async function () {
    await browser.url(await getExtensionPageURL('onboarding'));

    await getExtensionElement('button:skip').click();
    await expect(getExtensionElement('view:skip')).toBeDisplayed();

    await switchToPanel(async function () {
      await expect(getExtensionElement('button:enable')).toBeDisplayed();
    });

    await browser.url('about:blank');
  });

  it('enables ghostery', async function () {
    await browser.url(await getExtensionPageURL('onboarding'));

    await getExtensionElement('button:enable').click();
    await expect(getExtensionElement('view:success')).toBeDisplayed();

    await switchToPanel(async function () {
      await expect(getExtensionElement('button:enable')).not.toBeDisplayed();
    });

    await browser.url('about:blank');
  });
});
