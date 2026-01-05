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

import { store } from 'hybrids';
import { FLAG_NOTIFICATION_REVIEW } from '@ghostery/config';

import Config from '/store/config.js';
import { debugMode } from '/utils/debug.js';

import * as telemetry from './telemetry/index.js';
import { openNotification } from './notifications.js';

const REVIEW_NOTIFICATION_DELAY = 30 * 24 * 60 * 60 * 1000; // 30 days

chrome.webNavigation.onCompleted.addListener(async (details) => {
  if (details.frameId !== 0) return;

  const { installDate } = await telemetry.getStorage();
  if (!installDate) return;

  const config = await store.resolve(Config);
  if (!config.hasFlag(FLAG_NOTIFICATION_REVIEW)) return;

  if (
    debugMode ||
    Date.now() - new Date(installDate).getTime() >= REVIEW_NOTIFICATION_DELAY
  ) {
    openNotification({
      id: 'review',
      tabId: details.tabId,
      shownLimit: 1,
      position: 'center',
    });
  }
});
