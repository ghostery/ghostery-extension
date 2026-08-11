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
  setCookieInBrowserContext,
  setToggle,
  waitForIdleBackgroundTasks,
  PAGE_DOMAIN,
  PAGE_URL,
} from '../utils.js';

describe('Clear Browsing Data', () => {
  const COOKIE_NAME = 'test-cookie';

  before(enableExtension);

  beforeEach(async () => {
    await setCookieInBrowserContext(PAGE_URL, COOKIE_NAME, 'test-value');
  });

  afterEach(async () => {
    await browser.url(PAGE_URL);
    await browser.deleteCookies({ name: COOKIE_NAME, domain: PAGE_DOMAIN });
  });

  it('clears browsing data of the current website from the panel', async () => {
    await browser.url(PAGE_URL);
    await browser.url('ghostery:panel');

    await getExtensionElement('button:actions').click();
    await browser.pause(1000); // wait for opening menu animation to finish

    await getExtensionElement('button:clear-browsing-data').click();

    // The panel runs in the tab driven by the test, so it must stay open
    await setToggle('tabs', false);

    await getExtensionElement('button:confirm-clear-browsing-data').click();

    await waitForIdleBackgroundTasks();

    const cookies = await browser.getCookies({ domain: PAGE_DOMAIN });
    expect(cookies.length).toBe(0);
  });
});
