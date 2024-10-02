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
import { navigateToPage, getElement } from '../utils.js';

describe('Onboarding', () => {
  it('should keep ghostery disabled', async () => {
    await navigateToPage('onboarding');

    await getElement('button:skip').click();
    await expect(getElement('view:skip')).toBeDisplayed();

    await navigateToPage('panel');
    await expect(getElement('button:enable')).toBeDisplayed();
  });

  it('should enable ghostery', async () => {
    await navigateToPage('onboarding');

    await getElement('button:enable').click();
    await expect(getElement('view:success')).toBeDisplayed();

    await navigateToPage('panel');
    await expect(getElement('button:enable')).not.toBeDisplayed();
  });
});
