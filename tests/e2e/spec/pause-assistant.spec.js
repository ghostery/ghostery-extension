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
import { FLAG_PAUSE_ASSISTANT } from '@ghostery/config';

import {
  enableExtension,
  getExtensionPageURL,
  getNotificationIframe,
  sendMessage,
  setWhoTracksMeToggle,
  waitForIdleBackgroundTasks,
  ADBLOCKING_GLOBAL_SELECTOR,
  dismissNotification,
} from '../utils.js';

import { argv, PAGE_DOMAIN, PAGE_URL } from '../wdio.conf.js';

// IMPORTANT: The feature relys on the notifications, so the tests must be run always with
// and after notifications.spec.js (other notifications must not interfere with the tests)

if (argv.flags.includes(FLAG_PAUSE_ASSISTANT)) {
  describe('Pause Assistant', function () {
    before(enableExtension);

    before(async () => {
      await browser.url(getExtensionPageURL('panel'));
      await sendMessage({
        action: 'e2e:setConfigDomains',
        domains: { [PAGE_DOMAIN]: { actions: ['pause-assistant'] } },
      });

      await waitForIdleBackgroundTasks();
    });

    after(async () => {
      await browser.url(getExtensionPageURL('panel'));
      await sendMessage({ action: 'e2e:setConfigDomains', domains: {} });

      await waitForIdleBackgroundTasks();
    });

    it('does not pause the domain if the feature is turned off', async function () {
      await setWhoTracksMeToggle('pauseAssistant', false);

      await browser.url(PAGE_URL, { wait: 'complete' });

      await expect(getNotificationIframe('pause-assistant')).not.toExist();
      await expect(getNotificationIframe('pause-resume')).not.toExist();
    });

    it('pauses the domain when the feature is turned on', async function () {
      await setWhoTracksMeToggle('pauseAssistant', true);

      await browser.url(PAGE_URL, { wait: 'complete' });

      // Ads are showned
      await expect($(ADBLOCKING_GLOBAL_SELECTOR)).toBeDisplayed();

      // Notification is shown
      await expect(getNotificationIframe('pause-assistant')).toExist();

      // Notification is shown again after reload (until user interacts with it)
      await browser.url(PAGE_URL, { wait: 'complete' });
      const iframe = getNotificationIframe('pause-assistant');
      await expect(iframe).toExist();

      // Dismiss the notification
      await dismissNotification('pause-assistant');

      // Ensure iframe is closed after dismissing
      await expect(getNotificationIframe('pause-assistant')).not.toExist();

      // Notification is not shown after dismissing
      await browser.url(PAGE_URL, { wait: 'complete' });
      await expect(getNotificationIframe('pause-assistant')).not.toExist();
    });

    it('resumes when action is removed from config', async function () {
      await browser.url(getExtensionPageURL('panel'));
      await sendMessage({ action: 'e2e:setConfigDomains', domains: {} });

      await waitForIdleBackgroundTasks();

      await browser.url(PAGE_URL, { wait: 'complete' });

      const iframe = getNotificationIframe('pause-resume');
      await expect(iframe).toExist();

      // Dismiss the notification
      await dismissNotification('pause-resume');

      // Adblocking is active again
      await browser.url(PAGE_URL, { wait: 'complete' });
      await expect($(ADBLOCKING_GLOBAL_SELECTOR)).not.toBeDisplayed();
    });
  });
}
