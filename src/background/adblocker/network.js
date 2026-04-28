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
import { filterRequestHTML, updateResponseHeadersWithCSP } from '@ghostery/adblocker-webextension';

import Options, { getPausedDetails } from '/store/options.js';

import * as exceptions from '/utils/exceptions.js';
import * as engines from '/utils/engines.js';
import * as trackerdb from '/utils/trackerdb.js';
import Request from '/utils/request.js';

import { updateTabStats } from '../stats.js';
import { getRedirectProtectionUrl } from '../redirect-protection.js';

import { setup } from './engines.js';

/*
 * Network requests blocking - Firefox only
 */

if (__FIREFOX__) {
  function isTrusted(request, type) {
    const options = store.get(Options);

    // The request is from a tab that is paused
    if (getPausedDetails(options, request.sourceHostname)) {
      return true;
    }

    if (type === 'main_frame') {
      return false;
    }

    return exceptions.getStatus(
      options,
      // Get exception for known tracker (metadata id) or by the request hostname (unidentified tracker)
      trackerdb.getMetadata(request)?.id || request.hostname,
      request.sourceHostname,
    ).trusted;
  }

  function isMatchableRequest(details, request) {
    // Extension context request
    if (
      (details.tabId === -1 && details.url.startsWith('moz-extension://')) ||
      details.originUrl?.startsWith('moz-extension://')
    ) {
      return false;
    }

    // Engine not ready
    if (setup.pending) {
      console.error('[adblocker] not ready for network requests blocking');
      return false;
    }

    // sourceHostname empty - for example for service workers
    // Trusted request - for example from a paused tab
    if (!request.sourceHostname || isTrusted(request, details.type)) {
      return false;
    }

    return true;
  }

  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      const request = Request.fromRequestDetails(details);
      let result = undefined;

      if (isMatchableRequest(details, request)) {
        const engine = engines.get(engines.MAIN_ENGINE);
        const { redirect, match, filter } = engine.match(request);

        if (details.type === 'main_frame') {
          // For main_frame, only consider matches from filters with an
          // explicit $document modifier. Type-less filters match main_frame
          // via @ghostery/adblocker's FROM_ANY mask, but Chrome MV3 DNR's
          // safety default excludes main_frame for filters that don't specify
          // a resource type — we mirror that here.
          if (match === true && !filter?.fromAny()) {
            const options = store.get(Options);
            const redirectUrl = getRedirectProtectionUrl(details.url, request.hostname, options);

            return { redirectUrl };
          }
        } else if (redirect !== undefined) {
          request.blocked = true;
          // There's a possibility that redirecting to file URL can expose
          // extension existence.
          if (details.type !== 'xmlhttprequest') {
            result = {
              redirectUrl: chrome.runtime.getURL('rule_resources/redirects/' + redirect.filename),
            };
          } else {
            result = { redirectUrl: redirect.dataUrl };
          }
        } else if (match === true) {
          request.blocked = true;
          result = { cancel: true };
        }
      }

      updateTabStats(details.tabId, [request]);

      return result;
    },
    { urls: ['<all_urls>'] },
    ['blocking'],
  );

  chrome.webRequest.onHeadersReceived.addListener(
    (details) => {
      const request = Request.fromRequestDetails(details);
      if (!isMatchableRequest(details, request)) return;

      const engine = engines.get(engines.MAIN_ENGINE);

      const htmlFilters = engine.getHtmlFilters(request);
      if (htmlFilters.length !== 0) {
        request.modified = true;
        updateTabStats(details.tabId, [request]);
        filterRequestHTML(chrome.webRequest.filterResponseData, request, htmlFilters);
      }

      if (details.type !== 'main_frame') return;

      const cspPolicies = engine.getCSPDirectives(request);
      if (!cspPolicies || cspPolicies.length === 0) return;

      return updateResponseHeadersWithCSP(details, cspPolicies);
    },
    { urls: ['http://*/*', 'https://*/*'] },
    ['blocking', 'responseHeaders'],
  );
}
