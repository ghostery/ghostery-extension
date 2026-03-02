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

import { PAGE_DOMAIN, PAGE_URL } from '../wdio.conf.js';
import {
  enableExtension,
  getExtensionElement,
  getExtensionPageURL,
  openPanel,
  TRACKER_IDS,
  waitForIdleBackgroundTasks,
} from '../utils.js';

describe('Exceptions', function () {
  before(enableExtension);

  const TRACKER_ID = TRACKER_IDS[0];

  it('adds global exception to the selected tracker', async function () {
    await browser.url(PAGE_URL);

    await openPanel();
    await getExtensionElement('button:detailed-view').click();

    await expect(getExtensionElement(`button:tracker:${TRACKER_ID}`)).toBeDisplayed();
    await expect(getExtensionElement(`icon:tracker:${TRACKER_ID}:blocked`)).toBeDisplayed();

    await getExtensionElement(`button:tracker:protection-status:${TRACKER_ID}`).click();

    const toggle = await getExtensionElement('button:protection-status:trust:global');
    await expect(await toggle.getProperty('value')).toBe(false);

    await toggle.click();
    await waitForIdleBackgroundTasks();

    // Check that the tracker is now marked as trusted in the panel

    await browser.url(PAGE_URL);
    await openPanel();
    await expect(getExtensionElement(`button:tracker:${TRACKER_ID}`)).toBeDisplayed();
    await expect(getExtensionElement(`icon:tracker:${TRACKER_ID}:blocked`)).not.toBeDisplayed();

    // Open list of trackers and go to tracker details

    await browser.url(getExtensionPageURL('settings'));
    await getExtensionElement('button:trackers').click();

    const filterSelect = await getExtensionElement('select:trackers:filter');
    await filterSelect.selectByAttribute('value', 'trusted');

    await getExtensionElement(`button:trackers:expand`).click();
    await getExtensionElement(`button:trackers:details:${TRACKER_ID}`).click();

    // Toggle protection status to blocked

    await getExtensionElement(`component:exception-toggle:block`).click();
    await waitForIdleBackgroundTasks();

    await browser.url(PAGE_URL);

    await openPanel();
    await expect(getExtensionElement(`button:tracker:${TRACKER_ID}`)).toBeDisplayed();
    await expect(getExtensionElement(`icon:tracker:${TRACKER_ID}:blocked`)).toBeDisplayed();
  });

  it('adds website exception to the selected tracker', async function () {
    await browser.url(PAGE_URL);

    await openPanel();
    await getExtensionElement('button:detailed-view').click();

    await expect(getExtensionElement(`button:tracker:${TRACKER_ID}`)).toBeDisplayed();
    await expect(getExtensionElement(`icon:tracker:${TRACKER_ID}:blocked`)).toBeDisplayed();

    await getExtensionElement(`button:tracker:protection-status:${TRACKER_ID}`).click();

    const toggle = await getExtensionElement('button:protection-status:trust:website');
    await expect(await toggle.getProperty('value')).toBe(false);

    await toggle.click();
    await waitForIdleBackgroundTasks();

    // Check that the tracker is now marked as trusted in the panel

    await browser.url(PAGE_URL);
    await openPanel();
    await expect(getExtensionElement(`button:tracker:${TRACKER_ID}`)).toBeDisplayed();
    await expect(getExtensionElement(`icon:tracker:${TRACKER_ID}:blocked`)).not.toBeDisplayed();

    // Go to settings and check that the website is listed in the list of websites

    await browser.url(getExtensionPageURL('settings'));
    await getExtensionElement('button:websites').click();

    const trashButton = getExtensionElement(`button:website:trash:${PAGE_DOMAIN}`);
    await expect(trashButton).toBeDisplayed();

    // Remove the website exception

    await trashButton.click();
    await waitForIdleBackgroundTasks();

    // Check that the tracker is now marked as blocked in the panel

    await browser.url(PAGE_URL);

    await openPanel();
    await expect(getExtensionElement(`button:tracker:${TRACKER_ID}`)).toBeDisplayed();
    await expect(getExtensionElement(`icon:tracker:${TRACKER_ID}:blocked`)).toBeDisplayed();
  });
});
