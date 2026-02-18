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
import { FLAG_NOTIFICATION_REVIEW } from '@ghostery/config';

import { argv, PAGE_URL } from '../wdio.conf.js';
import { enableExtension, getNotificationIframe } from '../utils.js';

describe('Notifications', function () {
  before(enableExtension);

  it('shows pin-it and review notifications', async function () {
    // The "pin-it" notification is only available in Chromium-based browsers
    // and it is displayed just after enabling the extension on the first visited page.
    if (browser.isChromium) {
      await browser.url(PAGE_URL);
      await expect(getNotificationIframe('pin-it')).toBeDisplayed();
    }

    // The "review" notification is displayed after 30 days of usage,
    // but in debug mode it is shown immediately. As the code in background
    // runs after the "pin-it" notification, it will be shown after it.
    if (argv.flags.includes(FLAG_NOTIFICATION_REVIEW)) {
      await browser.url(PAGE_URL, { wait: 'complete' });
      await expect(getNotificationIframe('review')).toBeDisplayed();
    }

    // After pin-it and review notifications have been displayed,
    // no further notification should be shown
    await browser.url(PAGE_URL, { wait: 'complete' });

    try {
      await expect(await getNotificationIframe('pin-it')).not.toBeDisplayed();
      await expect(await getNotificationIframe('review')).not.toBeDisplayed();
    } catch {
      throw new Error(`No notification should be displayed after notifications have been shown`);
    }
  });
});
