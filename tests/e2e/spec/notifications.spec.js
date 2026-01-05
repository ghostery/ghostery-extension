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
import { FLAG_NOTIFICATION_REVIEW } from '@ghostery/config';

import { argv } from '../wdio.conf.js';
import { enableExtension } from '../utils.js';
import { PAGE_URL } from '../wdio.conf.js';

describe.only('Notifications', function () {
  before(enableExtension);

  if (browser.isChromium) {
    // The "pin-it" notification is only available in Chromium-based browsers
    // and it is displayed just after enabling the extension on the first visited page.
    it('shows pin-it notification', async function () {
      await browser.url(PAGE_URL);

      const url = 'notifications/pin-it.html';
      const iframe = $('>>>iframe#ghostery-notification-iframe');

      await expect(iframe).toBeDisplayed();
      await expect(iframe).toHaveAttribute('src', expect.stringContaining(url));
    });
  }

  // The "review" notification is displayed after 30 days of usage,
  // but in debug mode it is shown immediately
  if (argv.flags.includes(FLAG_NOTIFICATION_REVIEW)) {
    it('shows review notification', async function () {
      await browser.url(PAGE_URL);

      const url = 'notifications/review.html';
      const iframe = $('>>>iframe#ghostery-notification-iframe');

      await expect(iframe).toBeDisplayed();
      await expect(iframe).toHaveAttribute('src', expect.stringContaining(url));
    });
  }
});
