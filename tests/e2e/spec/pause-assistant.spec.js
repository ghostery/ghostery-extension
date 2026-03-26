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
  dismissPageNotification,
  enableExtension,
  expectNoPageNotification,
  sendMessage,
  setWhoTracksMeToggle,
  waitForIdleBackgroundTasks,
  ADBLOCKING_GLOBAL_SELECTOR,
  expectAdsBlocked,
  PAGE_DOMAIN,
  PAGE_URL,
} from '../utils.js';

describe('Pause Assistant', function () {
  async function clearConfig() {
    await browser.url('ghostery:panel');
    await sendMessage({ action: 'e2e:setConfigDomains', domains: {} });
    await waitForIdleBackgroundTasks();
  }

  before(enableExtension);

  before(async () => {
    await browser.url('ghostery:panel');
    await sendMessage({
      action: 'e2e:setConfigDomains',
      domains: { [PAGE_DOMAIN]: { actions: ['pause-assistant'] } },
    });
    await waitForIdleBackgroundTasks();
  });

  after(clearConfig);

  it('does not pause the domain if the feature is turned off', async function () {
    await setWhoTracksMeToggle('pauseAssistant', false);

    await browser.url(PAGE_URL);

    await expectNoPageNotification(PAGE_URL, 'pause-assistant');
    await expectNoPageNotification(PAGE_URL, 'pause-resume');

    await setWhoTracksMeToggle('pauseAssistant', true);
  });

  it('pauses the domain when the feature is turned on', async function () {
    // Dismiss the notification
    await dismissPageNotification(PAGE_URL, 'pause-assistant');

    // Ads are shown
    await expect($(ADBLOCKING_GLOBAL_SELECTOR)).toBeDisplayed();

    // resume when action is removed from config
    await clearConfig();

    // Reload to page and dismiss the notification
    await dismissPageNotification(PAGE_URL, 'pause-resume');

    await expectAdsBlocked();
  });
});
