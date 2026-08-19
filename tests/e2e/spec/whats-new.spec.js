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
  reloadExtension,
  waitForIdleBackgroundTasks,
} from '../utils.js';

describe("What's new", function () {
  before(enableExtension);

  it('shows the panel notification and recap page', async function () {
    // Debug builds announce the recap on every reload of the unpacked extension
    await reloadExtension();

    // The background may have opened the panel with the recap view already,
    // so open it again to get the main view
    await browser.url('ghostery:panel');

    const notification = await getExtensionElement('button:whats-new:notification');
    await expect(notification).toBeDisplayed();

    const url = await notification.getProperty('href');
    await expect(url).toBe(getExtensionPageURL('whats-new'));

    await browser.url(url);
    await expect($('>>>whats-new-hero')).toBeDisplayed();

    // Opening the page marks the recap as seen
    await waitForIdleBackgroundTasks();

    await browser.url('ghostery:panel');
    await expect(getExtensionElement('button:whats-new:notification')).not.toExist();
  });
});
