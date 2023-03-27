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
import {
  tryWTMReportOnMessageHandler,
  isDisableWTMReportMessage,
} from '@whotracksme/webextension-packages/packages/trackers-preview/background';

import Options from '/store/options.js';

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const options = store.get(Options);

  if (!store.ready(options)) {
    return false;
  }

  if (options.wtmSerpReport) {
    if (tryWTMReportOnMessageHandler(msg, sender, sendResponse)) {
      return false;
    }

    if (isDisableWTMReportMessage(msg)) {
      store.set(options, { wtmSerpReport: false });
    }
  }

  return false;
});
