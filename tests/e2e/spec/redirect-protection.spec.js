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
  setPrivacyToggle,
  waitForIdleBackgroundTasks,
} from '../utils.js';

import { PAGE_DOMAIN, PAGE_URL } from '../wdio.conf.js';

async function setCustomFilters(filters) {
  await setPrivacyToggle('custom-filters', true);
  await getExtensionElement('button:custom-filters').click();

  const input = await getExtensionElement('input:custom-filters');
  await input.setValue(filters.join('\n'));

  await getExtensionElement('button:custom-filters:save').click();

  await expect(
    getExtensionElement('component:custom-filters:result'),
  ).toBeDisplayed();

  await getExtensionElement('button:back').click();
}

async function setRedirectProtectionToggle(value) {
  await browser.url(getExtensionPageURL('settings'));
  await getExtensionElement('button:redirect-protection').click();

  const toggle = await getExtensionElement('toggle:redirect-protection');
  if ((await toggle.getProperty('value')) !== value) {
    await toggle.click();
    await waitForIdleBackgroundTasks();
  }

  await expect(toggle).toHaveElementProperty('value', value);
}

async function removeRedirectException(hostname) {
  await browser.url(getExtensionPageURL('settings'));
  await getExtensionElement('button:redirect-protection').click();
  await getExtensionElement(
    `button:redirect-protection:remove:${hostname}`,
  ).click();
  await waitForIdleBackgroundTasks();
}

async function isOnRedirectProtectionPage() {
  const url = await browser.getUrl();
  return url.includes('pages/redirect-protection');
}

describe.only('Redirect Protection', function () {
  before(async () => {
    await enableExtension();
    await setRedirectProtectionToggle(true);
    await setCustomFilters([`||${PAGE_DOMAIN}^$document`]);
  });

  after(async () => {
    await setPrivacyToggle('custom-filters', false);
    await setRedirectProtectionToggle(false);
  });

  it('redirects to warning page when navigating to blocked domain', async function () {
    await browser.url(PAGE_URL);

    await expect(await isOnRedirectProtectionPage()).toBe(true);
    await expect(
      getExtensionElement('link:redirect-protection:hostname'),
    ).toHaveText(PAGE_DOMAIN);
  });

  describe('Always allow from domain', function () {
    it('adds domain exception when clicking "Always allow from this domain"', async function () {
      await browser.url(PAGE_URL);
      await expect(await isOnRedirectProtectionPage()).toBe(true);

      await getExtensionElement(
        'button:redirect-protection:always-allow',
      ).click();
      await waitForIdleBackgroundTasks();

      await browser.waitUntil(
        async () => !(await isOnRedirectProtectionPage()),
        {
          timeout: 5000,
          timeoutMsg: 'Did not navigate away from warning page',
        },
      );

      const url = await browser.getUrl();
      await expect(url).toBe(PAGE_URL);
    });

    it('navigates directly after domain is added to exceptions', async function () {
      await browser.url('about:blank');
      await browser.url(PAGE_URL);

      await expect(await isOnRedirectProtectionPage()).toBe(false);
      const url = await browser.getUrl();
      await expect(url).toBe(PAGE_URL);
    });

    it('shows domain in redirect exceptions list', async function () {
      await browser.url(getExtensionPageURL('settings'));
      await getExtensionElement('button:redirect-protection').click();

      await expect(
        getExtensionElement(
          `item:redirect-protection:exception:${PAGE_DOMAIN}`,
        ),
      ).toBeDisplayed();
    });

    it('removes domain exception', async function () {
      await getExtensionElement(
        `button:redirect-protection:remove:${PAGE_DOMAIN}`,
      ).click();
      await waitForIdleBackgroundTasks();

      await expect(
        getExtensionElement('component:redirect-protection:empty-state'),
      ).toBeDisplayed();
    });
  });

  describe('Settings page exceptions management', function () {
    it('adds exception via settings page', async function () {
      await browser.url(PAGE_URL);
      await expect(await isOnRedirectProtectionPage()).toBe(true);

      await browser.url(getExtensionPageURL('settings'));
      await getExtensionElement('button:redirect-protection').click();

      await getExtensionElement('button:redirect-protection:add').click();

      const input = await getExtensionElement(
        'input:redirect-protection:hostname',
      );
      await input.setValue(PAGE_DOMAIN);

      await getExtensionElement('button:redirect-protection:save').click();
      await waitForIdleBackgroundTasks();

      await expect(
        getExtensionElement(
          `item:redirect-protection:exception:${PAGE_DOMAIN}`,
        ),
      ).toBeDisplayed();
    });

    it('navigates directly when exception is added', async function () {
      await browser.url(PAGE_URL);

      await expect(await isOnRedirectProtectionPage()).toBe(false);
      const url = await browser.getUrl();
      await expect(url).toBe(PAGE_URL);
    });

    it('removes exception via settings page', async function () {
      await removeRedirectException(PAGE_DOMAIN);

      await expect(
        getExtensionElement('component:redirect-protection:empty-state'),
      ).toBeDisplayed();
    });

    it('redirects again after exception is removed', async function () {
      await browser.url(PAGE_URL);

      await expect(await isOnRedirectProtectionPage()).toBe(true);
    });
  });

  // This test must run LAST because clicking "Allow" creates a session rule
  // that persists for the tab and cannot be cleared without closing the tab
  describe('Allow button', function () {
    it('allows navigation when clicking Allow button', async function () {
      await browser.url(PAGE_URL);
      await expect(await isOnRedirectProtectionPage()).toBe(true);

      await getExtensionElement('button:redirect-protection:allow').click();
      await waitForIdleBackgroundTasks();

      await browser.waitUntil(
        async () => !(await isOnRedirectProtectionPage()),
        {
          timeout: 5000,
          timeoutMsg: 'Did not navigate away from warning page',
        },
      );

      const url = await browser.getUrl();
      await expect(url).toBe(PAGE_URL);
    });
  });
});
