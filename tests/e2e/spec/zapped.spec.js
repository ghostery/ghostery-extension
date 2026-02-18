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
import { FLAG_MODES } from '@ghostery/config';

import {
  enableExtension,
  getExtensionElement,
  getExtensionPageURL,
  openPanel,
  waitForIdleBackgroundTasks,
  expectAdsBlocked,
  switchFrame,
  ADBLOCKING_GLOBAL_SELECTOR,
  ADBLOCKING_URL_SELECTOR,
  TRACKER_IDS,
} from '../utils.js';

import { argv, PAGE_URL, PAGE_DOMAIN } from '../wdio.conf.js';

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

if (argv.flags.includes(FLAG_MODES)) {
  describe('ZAP Mode', function () {
    before(enableExtension);

    before(() => setFilteringMode('zap'));
    after(() => setFilteringMode('ghostery'));

    it('does not block ads when not enabled', async function () {
      await browser.url(PAGE_URL);

      await expect($(ADBLOCKING_GLOBAL_SELECTOR)).toBeDisplayed();
      await expect($(ADBLOCKING_URL_SELECTOR)).toBeDisplayed();

      await switchFrame($('#iframe-static'));
      await expect($(ADBLOCKING_GLOBAL_SELECTOR)).toBeDisplayed();
      await expect($(ADBLOCKING_URL_SELECTOR)).toBeDisplayed();

      await switchFrame($('#iframe-dynamic'));
      await expect($(ADBLOCKING_GLOBAL_SELECTOR)).toBeDisplayed();
      await expect($(ADBLOCKING_URL_SELECTOR)).toBeDisplayed();

      await switchFrame($('#iframe-local'));
      await expect($(ADBLOCKING_GLOBAL_SELECTOR)).toBeDisplayed();
      await expect($(ADBLOCKING_URL_SELECTOR)).toBeDisplayed();

      await browser.switchFrame(null);
    });

    it('does not block trackers when not enabled', async function () {
      await browser.url(PAGE_URL);

      await openPanel();
      await getExtensionElement('button:detailed-view').click();

      for (const trackerId of TRACKER_IDS) {
        await expect(getExtensionElement(`icon:tracker:${trackerId}:blocked`)).not.toBeDisplayed();
        await expect(getExtensionElement(`icon:tracker:${trackerId}:modified`)).not.toBeDisplayed();
      }
    });

    describe('block trackers and ads when enabled in the panel', function () {
      before(() => toggleZapInPanel('enable'));
      after(() => toggleZapInPanel('disable'));

      it('blocks trackers when enabled in the panel', async function () {
        await browser.url(PAGE_URL);

        await openPanel();
        await getExtensionElement('button:detailed-view').click();

        for (const trackerId of TRACKER_IDS) {
          await expect(getExtensionElement(`icon:tracker:${trackerId}:blocked`)).toBeDisplayed();
        }
      });
    });

    describe('block ads when enabled in the panel', function () {
      before(() => toggleZapInPanel('enable'));
      after(() => toggleZapInPanel('disable'));

      before(async function () {
        await browser.url(PAGE_URL);
      });

      it('main frame of the page', expectAdsBlocked);

      it('subframe of the page', async function () {
        await switchFrame($('#iframe-static'));
        await expectAdsBlocked();

        await browser.switchFrame(null);
      });

      it('dynamic subframe of the page', async function () {
        await switchFrame($('#iframe-dynamic'));
        await expectAdsBlocked();

        await browser.switchFrame(null);
      });

      it('local subframe of the page', async function () {
        await switchFrame($('#iframe-local'));
        await expectAdsBlocked();

        await browser.switchFrame(null);
      });

      it('displays the page in Websites section of the settings page', async function () {
        await browser.url(getExtensionPageURL('settings'));
        await getExtensionElement('button:websites').click();

        const pageEntry = await getExtensionElement(`component:website:${PAGE_DOMAIN}`);
        await expect(pageEntry).toBeDisplayed();
      });
    });
  });
}
