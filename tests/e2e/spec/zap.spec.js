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

import { browser, expect, $ } from '@wdio/globals';
import {
  enableExtension,
  getExtensionElement,
  getExtensionPageURL,
  openPanel,
  waitForIdleBackgroundTasks,
  expectAdsBlocked,
  ADBLOCKING_GLOBAL_SELECTOR,
  ADBLOCKING_URL_SELECTOR,
} from '../utils.js';

import { PAGE_URL, PAGE_DOMAIN } from '../wdio.conf.js';

async function setFilteringMode(mode) {
  await browser.url(getExtensionPageURL('settings'));
  await getExtensionElement('button:my-ghostery').click();

  const modeInput = await getExtensionElement(`input:filtering-mode:${mode}`);
  await modeInput.click();

  // Wait for the filtering mode to be applied
  await waitForIdleBackgroundTasks();
}

async function toggleZapInPanel(type) {
  await browser.url(PAGE_URL);

  await openPanel();

  const toggle = await getExtensionElement(`button:zap:${type}`);
  await toggle.click();

  await waitForIdleBackgroundTasks();
}

describe('ZAP Mode', function () {
  before(enableExtension);

  before(() => setFilteringMode('zap'));
  after(() => setFilteringMode('ghostery'));

  it('does not block ads when not enabled', async function () {
    await browser.url(PAGE_URL);

    await expect($(ADBLOCKING_GLOBAL_SELECTOR)).toBeDisplayed();
    await expect($(ADBLOCKING_URL_SELECTOR)).toBeDisplayed();

    await browser.switchFrame($('#iframe-static'));
    await expect($(ADBLOCKING_GLOBAL_SELECTOR)).toBeDisplayed();
    await expect($(ADBLOCKING_URL_SELECTOR)).toBeDisplayed();

    // wait for dynamic and local iframes to load
    await browser.pause(1000);

    await browser.switchFrame(null);
    await browser.switchFrame($('#iframe-dynamic'));
    await expect($(ADBLOCKING_GLOBAL_SELECTOR)).toBeDisplayed();
    await expect($(ADBLOCKING_URL_SELECTOR)).toBeDisplayed();

    await browser.switchFrame(null);
    await browser.switchFrame($('#iframe-local'));
    await expect($(ADBLOCKING_GLOBAL_SELECTOR)).toBeDisplayed();
    await expect($(ADBLOCKING_URL_SELECTOR)).toBeDisplayed();

    await browser.switchFrame(null);
  });

  describe('block ads when enabled in the panel', function () {
    before(() => toggleZapInPanel('enable'));
    after(() => toggleZapInPanel('disable'));

    before(async function () {
      await browser.url(PAGE_URL);
    });
    afterEach(async function () {
      await browser.switchFrame(null);
    });

    it('main frame of the page', expectAdsBlocked);

    it('subframe of the page', async function () {
      const iframe = await $('#iframe-static');
      await browser.switchFrame(iframe);

      await expectAdsBlocked();
    });

    it('dynamic subframe of the page', async function () {
      // Wait for iframe to load
      await browser.pause(1000);

      const dynamicIframe = await $('#iframe-dynamic');
      await browser.switchFrame(dynamicIframe);

      await expectAdsBlocked();
    });

    it('local subframe of the page', async function () {
      // Wait for iframe to load
      await browser.pause(1000);

      const localIframe = await $('#iframe-local');
      await browser.switchFrame(localIframe);

      await expectAdsBlocked();
    });

    it('displays the page in Websites section of the settings page', async function () {
      await browser.url(getExtensionPageURL('settings'));
      await getExtensionElement('button:websites').click();

      const pageEntry = await getExtensionElement(
        `component:website:${PAGE_DOMAIN}`,
      );
      await expect(pageEntry).toBeDisplayed();
    });
  });
});
