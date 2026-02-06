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
  openPanel,
  waitForIdleBackgroundTasks,
} from '../utils.js';

import { PAGE_DOMAIN, PAGE_URL } from '../wdio.conf.js';

describe('Clear Cookies', () => {
  const COOKIE_NAME = 'test-cookie';

  before(enableExtension);

  beforeEach(async () => {
    await browser.url(PAGE_URL, { waitUntil: 'load' });
    await browser.setCookies({
      name: COOKIE_NAME,
      value: 'test-value',
      domain: PAGE_DOMAIN,
    });
  });

  afterEach(async () => {
    await browser.url(PAGE_URL, { waitUntil: 'load' });
    await browser.deleteCookies({ name: COOKIE_NAME, domain: PAGE_DOMAIN });
  });

  it('clears cookies when action is triggered in the panel', async () => {
    await browser.url(PAGE_URL);
    await openPanel();

    await getExtensionElement('button:actions').click();
    await browser.pause(1000); // wait for opening menu animation to finish

    await getExtensionElement('button:clear-cookies').click();
    await getExtensionElement('button:confirm-clear-cookies').click();

    await waitForIdleBackgroundTasks();

    const cookies = await browser.getCookies({ domain: PAGE_DOMAIN });
    expect(cookies.length).toBe(0);
  });

  it('clears cookies when action is triggered from website settings page', async () => {
    await browser.url(PAGE_URL);
    await openPanel();

    await getExtensionElement('button:actions').click();
    await browser.pause(1000); // wait for opening menu animation to finish

    const href = await getExtensionElement(
      'button:website-settings',
    ).getAttribute('href');
    await browser.url(href);

    await getExtensionElement('button:clear-cookies').click();
    await getExtensionElement('button:confirm-clear-cookies').click();

    await waitForIdleBackgroundTasks();

    const cookies = await browser.getCookies({ domain: PAGE_DOMAIN });
    expect(cookies.length).toBe(0);
  });
});
