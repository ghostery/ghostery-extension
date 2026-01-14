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
  enableExtension,
  getExtensionElement,
  getExtensionPageURL,
} from '../utils.js';

describe('Attribution', () => {
  // The attribution cookie must be set before enableExtension() - see tests/e2e/utils.js
  before(enableExtension);

  it('captures attribution from ghostery.com cookie', async () => {
    await browser.url(getExtensionPageURL('settings'));

    await expect(getExtensionElement('text:utm-source')).toHaveText('source');
    await expect(getExtensionElement('text:utm-campaign')).toHaveText(
      'campaign',
    );
  });
});
