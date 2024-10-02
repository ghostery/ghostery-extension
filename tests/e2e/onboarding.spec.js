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

import { expect } from '@wdio/globals';
import { navigateToExtensionPage, getExtensionElement } from './utils.js';

describe('Onboarding', () => {
  it('should keep ghostery disabled', async () => {
    await navigateToExtensionPage('onboarding');

    await getExtensionElement('button:skip').click();
    await expect(getExtensionElement('view:skip')).toBeDisplayed();

    await navigateToExtensionPage('panel');
    await expect(getExtensionElement('button:enable')).toBeDisplayed();
  });

  it('should enable ghostery', async () => {
    await navigateToExtensionPage('onboarding');

    await getExtensionElement('button:enable').click();
    await expect(getExtensionElement('view:success')).toBeDisplayed();

    await navigateToExtensionPage('panel');
    await expect(getExtensionElement('button:enable')).not.toBeDisplayed();
  });
});
