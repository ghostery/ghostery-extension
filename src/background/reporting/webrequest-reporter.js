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

import { RequestReporter } from '@whotracksme/reporting/reporting';

import getBrowserInfo from '/utils/browser-info.js';
import { isPaused } from '/store/options.js';
import Request from '/utils/request.js';
import * as OptionsObserver from '/utils/options-observer.js';

import { updateTabStats } from '../stats.js';

import config from './config.js';
import communication from './communication.js';
import urlReporter from './url-reporter.js';

let webRequestReporter = null;

if (__PLATFORM__ === 'chromium' || __PLATFORM__ === 'firefox') {
  let options = {};
  OptionsObserver.addListener(function webRequestReporting(value) {
    options = value;
  });

  webRequestReporter = new RequestReporter(config.request, {
    communication,
    countryProvider: urlReporter.countryProvider,
    trustedClock: communication.trustedClock,
    getBrowserInfo,
    isRequestAllowed: (state) =>
      !options.blockTrackers || isPaused(options, state.tabUrlParts.hostname),
    dryRunMode: true,
    onTrackerInteraction: (event, state) => {
      if (event === 'observed') {
        return;
      }

      const request = Request.fromRequestDetails({
        url: state.url,
        originUrl: state.tabUrl,
      });
      request.modified = true;

      updateTabStats(state.tabId, [request]);
    },
  });

  chrome.runtime.onMessage.addListener((msg, sender) => {
    if (msg.action === 'mousedown') {
      webRequestReporter.recordClick(msg.event, msg.context, msg.href, sender);
    }
  });
}

export default webRequestReporter;
