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

import {
  WebRequestPipeline,
  RequestReporter,
} from '@whotracksme/reporting/reporting';
import { getBrowserInfo } from '@ghostery/libs';

import { observe, GLOBAL_PAUSE_ID } from '/store/options.js';

import Request from '../utils/request.js';
import { updateTabStats } from '../stats.js';

import config from './config.js';
import communication from './communication.js';
import urlReporter from './url-reporter.js';

let webRequestReporter = null;

if (__PLATFORM__ !== 'safari') {
  const webRequestPipeline = new WebRequestPipeline();

  // Important to call it in a first tick as it assigns chrome. listeners
  webRequestPipeline.init();

  let pausedHostnames = new Set();
  let isAntiTrackingEnabled = false;

  observe('blockTrackers', (blockTrackers) => {
    isAntiTrackingEnabled = blockTrackers;
  });

  observe('paused', (paused) => {
    pausedHostnames.clear();
    for (const { id } of paused) {
      pausedHostnames.add(id);
    }
  });

  webRequestReporter = new RequestReporter(config.request, {
    webRequestPipeline,
    communication,
    countryProvider: urlReporter.countryProvider,
    trustedClock: communication.trustedClock,
    getBrowserInfo,
    isRequestAllowed: (state) => {
      if (!isAntiTrackingEnabled) {
        return true;
      }

      if (
        pausedHostnames.has(GLOBAL_PAUSE_ID) ||
        pausedHostnames.has(state.tabUrlParts.hostname.replace(/^www\./, ''))
      ) {
        return true;
      }

      return false;
    },
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
