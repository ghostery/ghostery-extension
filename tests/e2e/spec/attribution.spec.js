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
  setAttributionCookie,
  removeAttributionCookie,
  openDevtools,
  clearStorageAndReload,
} from '../utils.js';

describe('Attribution', () => {
  before(enableExtension);

  afterEach(async () => {
    await browser.url(getExtensionPageURL('panel'));
    await removeAttributionCookie();
  });

  it('captures attribution from ghostery.com cookie', async () => {
    await browser.url(getExtensionPageURL('panel'));

    await setAttributionCookie('test_source', 'test_campaign');
    await clearStorageAndReload();
    await enableExtension();
    await openDevtools();

    await expect(getExtensionElement('text:utm-source')).toHaveText(
      'test_source',
    );
    await expect(getExtensionElement('text:utm-campaign')).toHaveText(
      'test_campaign',
    );
  });

  it('handles special characters in cookie values', async () => {
    await browser.url(getExtensionPageURL('panel'));

    await setAttributionCookie('source&special=chars', 'campaign/with spaces');
    await clearStorageAndReload();
    await enableExtension();
    await openDevtools();

    await expect(getExtensionElement('text:utm-source')).toHaveText(
      'source&special=chars',
    );
    await expect(getExtensionElement('text:utm-campaign')).toHaveText(
      'campaign/with spaces',
    );
  });

  it('stores empty attribution when no cookie present', async () => {
    await browser.url(getExtensionPageURL('panel'));

    await removeAttributionCookie();
    await clearStorageAndReload();
    await enableExtension();
    await openDevtools();

    await expect(getExtensionElement('text:utm-source')).toHaveText('N/A');
    await expect(getExtensionElement('text:utm-campaign')).toHaveText('N/A');
  });
});
