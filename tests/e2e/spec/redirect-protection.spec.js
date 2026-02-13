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
import { FLAG_REDIRECT_PROTECTION } from '@ghostery/config';

import {
  enableExtension,
  getExtensionElement,
  getExtensionPageURL,
  setPrivacyToggle,
  waitForIdleBackgroundTasks,
  setCustomFilters,
} from '../utils.js';

import { argv, PAGE_DOMAIN, PAGE_URL } from '../wdio.conf.js';

async function openRedirectSettings() {
  await browser.url('about:blank');
  await browser.url(getExtensionPageURL('settings'));

  await getExtensionElement('button:redirect-protection').click();
}

async function setRedirectProtectionToggle(value) {
  await openRedirectSettings();
  const toggle = await getExtensionElement('toggle:redirect-protection');
  if ((await toggle.getProperty('value')) !== value) {
    await toggle.click();
    await waitForIdleBackgroundTasks();
  }
}

async function expectOnWarningPage(expected) {
  const url = await browser.getUrl();
  expect(url.includes('pages/redirect-protection')).toBe(expected);
}

async function waitForNavigation() {
  await browser.waitUntil(
    async () => !(await browser.getUrl()).includes('pages/redirect-protection'),
    { timeout: 5000, timeoutMsg: 'Did not navigate away from warning page' },
  );
}

if (argv.flags.includes(FLAG_REDIRECT_PROTECTION)) {
  describe('Redirect Protection', function () {
    before(enableExtension);

    before(async () => {
      await setRedirectProtectionToggle(true);
      await setCustomFilters([`||${PAGE_DOMAIN}^$document`]);
    });

    after(async () => {
      await setPrivacyToggle('custom-filters', false);
      await setRedirectProtectionToggle(false);
    });

    it('is enabled by default', async function () {
      await openRedirectSettings();
      const toggle = await getExtensionElement('toggle:redirect-protection');

      await expect(toggle).toHaveProperty('value', true);
    });

    it('redirects to warning page when navigating to blocked domain', async function () {
      await browser.url(PAGE_URL);

      await expectOnWarningPage(true);
      await expect(
        getExtensionElement('text:redirect-protection:url'),
      ).toHaveText(PAGE_DOMAIN, { containing: true });
    });

    it("doesn't redirect when redirect protection is disabled", async function () {
      await setRedirectProtectionToggle(false);

      await browser.url(PAGE_URL);
      await expectOnWarningPage(false);

      // Re-enable for next tests
      await setRedirectProtectionToggle(true);
    });

    describe('Proceed with exception', function () {
      before(async () => {
        await browser.url(PAGE_URL);

        const checkbox = await browser.waitUntil(async () =>
          getExtensionElement('checkbox:redirect-protection:exception'),
        );

        await checkbox.click();

        await getExtensionElement('button:redirect-protection:proceed').click();
        await waitForNavigation();
      });

      it('adds domain exception when clicking "Dont warn me again"', async function () {
        await openRedirectSettings();

        await expect(
          getExtensionElement(
            `item:redirect-protection:exception:${PAGE_DOMAIN}`,
          ),
        ).toBeDisplayed();
      });

      it('navigates directly after domain is added to exceptions', async function () {
        await browser.url('about:blank');
        await browser.url(PAGE_URL);

        await expectOnWarningPage(false);
      });

      it('shows domain in redirect exceptions list', async function () {
        await openRedirectSettings();

        await expect(
          getExtensionElement(
            `item:redirect-protection:exception:${PAGE_DOMAIN}`,
          ),
        ).toBeDisplayed();
      });

      it('removes domain exception', async function () {
        await openRedirectSettings();

        await getExtensionElement(
          `button:redirect-protection:remove:${PAGE_DOMAIN}`,
        ).click();

        await expect(
          getExtensionElement('component:redirect-protection:empty-state'),
        ).toBeDisplayed();
      });

      describe('Settings page exceptions management', function () {
        it('adds exception via settings page', async function () {
          await browser.url(PAGE_URL);
          await expectOnWarningPage(true);

          await openRedirectSettings();
          await getExtensionElement('button:redirect-protection:add').click();
          await getExtensionElement(
            'input:redirect-protection:hostname',
          ).setValue(PAGE_DOMAIN);
          await getExtensionElement('button:redirect-protection:save').click();

          await expect(
            getExtensionElement(
              `item:redirect-protection:exception:${PAGE_DOMAIN}`,
            ),
          ).toBeDisplayed();
        });

        it('navigates directly when exception is added', async function () {
          await browser.url(PAGE_URL);
          await expectOnWarningPage(false);
        });

        it('removes exception via settings page', async function () {
          await openRedirectSettings();
          await getExtensionElement(
            `button:redirect-protection:remove:${PAGE_DOMAIN}`,
          ).click();

          await expect(
            getExtensionElement('component:redirect-protection:empty-state'),
          ).toBeDisplayed();
        });

        it('redirects again after exception is removed', async function () {
          await browser.url(PAGE_URL);
          await expectOnWarningPage(true);
        });
      });
    });

    describe('Proceed once', function () {
      it('allows navigation when clicking proceed button', async function () {
        await browser.url(PAGE_URL);

        await getExtensionElement('button:redirect-protection:proceed').click();

        await waitForNavigation();
        expect(await browser.getUrl()).toBe(PAGE_URL);
      });
    });
  });
}
