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

import trackersPreviewCSS from '/content_scripts/trackers-preview.css?raw';

import Options, { isGloballyPaused } from '/store/options.js';
import * as OptionsObserver from '/utils/options-observer.js';
import { getWTMStats } from '/utils/wtm-stats.js';
import { parseWithCache } from '/utils/request.js';

// Trackers preview messages
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'getWTMReport') {
    sendResponse({
      wtmStats: msg.links.map((url) => {
        const { domain } = parseWithCache(url);

        return {
          stats: getWTMStats(domain),
          domain,
        };
      }),
    });
  }

  if (msg.action === 'disableWTMReport') {
    store.set(Options, { wtmSerpReport: false });
  }

  return false;
});

export const SERP_URL_REGEXP =
  /^https?:[/][/][^/]*[.](google|bing)[.][a-z]+([.][a-z]+)?([/][a-z]+)*[/]search/;

// Trackers preview content script
chrome.webNavigation.onCommitted.addListener(async (details) => {
  if (details.url.match(SERP_URL_REGEXP)) {
    const options = await store.resolve(Options);

    if (options.wtmSerpReport) {
      chrome.scripting.insertCSS({
        target: {
          tabId: details.tabId,
        },
        css: trackersPreviewCSS,
      });

      chrome.scripting.executeScript(
        {
          injectImmediately: true,
          world: chrome.scripting.ExecutionWorld?.ISOLATED ?? 'ISOLATED',
          target: {
            tabId: details.tabId,
          },
          files: ['/content_scripts/trackers-preview.js'],
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
          }
        },
      );
    }
  }
});

const SERP_TRACKING_CONTENT_SCRIPT_ID = 'serp-tracking-prevention';

// A result page has to be covered from the moment it starts loading, wherever
// it loads - in a frame, or in a document the browser is prerendering, which
// no navigation is reported for until it is shown. Registering the script
// leaves that to the browser instead of racing it.
//
// Registering once wiped Safari's manifest-declared content scripts
// (FB12817504, the reason for the `executeScript` approach in #1278);
// verified fixed on Safari 18.6, the minimum supported version.
OptionsObserver.addListener(async function serpTrackingPrevention(options, lastOptions) {
  const enabled = options.serpTrackingPrevention && !isGloballyPaused(options);

  if (lastOptions) {
    const wasEnabled = lastOptions.serpTrackingPrevention && !isGloballyPaused(lastOptions);
    if (enabled === wasEnabled) return;
  }

  const registered = (
    await chrome.scripting.getRegisteredContentScripts({
      ids: [SERP_TRACKING_CONTENT_SCRIPT_ID],
    })
  ).length;

  if (registered) {
    await chrome.scripting.unregisterContentScripts({
      ids: [SERP_TRACKING_CONTENT_SCRIPT_ID],
    });
  }

  if (enabled) {
    await chrome.scripting.registerContentScripts([
      {
        id: SERP_TRACKING_CONTENT_SCRIPT_ID,
        js: ['/content_scripts/prevent-serp-tracking.js'],
        // Result pages are served from a domain per country, and a match
        // pattern cannot wildcard a top level domain. What they do share is
        // `/search` in the path; the domain itself is checked in the script.
        matches: ['*://*/search*', '*://*/*/search*'],
        allFrames: true,
        runAt: 'document_start',
        persistAcrossSessions: true,
      },
    ]);
  }
});

// Result destinations for the session, keyed by the id a result page derives
// from how a result reads (see the content script). Pages that link results
// outright record them; pages that hide them behind `/goto` tokens look them up.
const SERP_TARGETS_STORAGE_KEY = 'serpTargetsMap';
const SERP_TARGETS_LIMIT = 5000;

// Writes are serialized so that concurrent pages do not overwrite each other
let serpTargetsPending = Promise.resolve();

async function loadSerpTargets() {
  const { [SERP_TARGETS_STORAGE_KEY]: entries = [] } =
    await chrome.storage.session.get(SERP_TARGETS_STORAGE_KEY);
  return new Map(entries);
}

function recordSerpTargets(entries) {
  serpTargetsPending = serpTargetsPending
    .then(async () => {
      const map = await loadSerpTargets();

      for (const [id, url] of Object.entries(entries)) {
        if (typeof url !== 'string' || !/^https?:\/\//.test(url)) continue;

        // Re-inserting moves a known result to the end, so the oldest go first
        map.delete(id);
        map.set(id, url);
      }

      while (map.size > SERP_TARGETS_LIMIT) {
        map.delete(map.keys().next().value);
      }

      await chrome.storage.session.set({ [SERP_TARGETS_STORAGE_KEY]: [...map] });
    })
    .catch((e) => console.error('[serp] Failed to record targets', e));
}

async function resolveSerpTargets(ids) {
  const map = await loadSerpTargets();
  const resolved = {};

  for (const id of ids) {
    const url = map.get(id);
    if (url) resolved[id] = url;
  }

  return resolved;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'serp:record-targets') {
    if (msg.entries && typeof msg.entries === 'object') recordSerpTargets(msg.entries);
    return false;
  }

  if (msg.action === 'serp:resolve-targets') {
    resolveSerpTargets(Array.isArray(msg.ids) ? msg.ids : []).then(sendResponse, () =>
      sendResponse({}),
    );
    return true;
  }

  return false;
});

const SERP_TARGETS_CONTENT_SCRIPT_ID = 'prevent-serp-targets';

OptionsObserver.addListener(async function serpTargets(options, lastOptions) {
  const enabled = options.serpTrackingPrevention && !isGloballyPaused(options);

  if (lastOptions) {
    const wasEnabled = lastOptions.serpTrackingPrevention && !isGloballyPaused(lastOptions);
    if (enabled === wasEnabled) return;
  }

  const registered = !!(
    await chrome.scripting.getRegisteredContentScripts({
      ids: [SERP_TARGETS_CONTENT_SCRIPT_ID],
    })
  ).length;

  if (enabled === registered) return;

  if (enabled) {
    await chrome.scripting.registerContentScripts([
      {
        id: SERP_TARGETS_CONTENT_SCRIPT_ID,
        js: ['/content_scripts/prevent-serp-targets.js'],
        matches: ['*://*/search*', '*://*/*/search*'],
        allFrames: true,
        runAt: 'document_start',
        persistAcrossSessions: true,
      },
    ]);
  } else {
    await chrome.scripting.unregisterContentScripts({
      ids: [SERP_TARGETS_CONTENT_SCRIPT_ID],
    });
  }
});
