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

import { isUserScriptsSupported } from '/utils/user-scripts.js';

import Options from '/store/options.js';
import CustomFilters from '/store/custom-filters.js';

const MINUTE_IN_MS = 60 * 1000;
const HOUR_IN_MS = 60 * MINUTE_IN_MS;
const DAY_IN_MS = 24 * HOUR_IN_MS;
const WEEK_IN_MS = 7 * DAY_IN_MS;

const DEFAULT_EXPIRES = DAY_IN_MS;
const MIN_EXPIRES = HOUR_IN_MS;
const MAX_EXPIRES = 30 * DAY_IN_MS;

const MAX_LIST_SIZE = 10 * 1024 * 1024;
const METADATA_LINES_LIMIT = 50;

export function parseListMetadata(text) {
  const result = { name: '', expires: DEFAULT_EXPIRES };

  for (const line of text.split(/\r?\n/, METADATA_LINES_LIMIT)) {
    const match = line.match(/^[!#]\s*(Title|Expires):\s*(.+)$/i);
    if (!match) continue;

    if (match[1].toLowerCase() === 'title') {
      // The title is untrusted data, so cap its length and strip control
      // and format characters to avoid breaking the UI.
      result.name = match[2]
        .trim()
        .slice(0, 100)
        .replace(/[\p{Cc}\p{Cf}]/gu, '')
        .trim();
    } else {
      // Supported formats: "5 days", "12 hours", "2 weeks", "30 minutes"
      // or a bare number of days. Unknown units are ignored.
      const expires = match[2].match(/^(\d+)\s*([a-z]+)?/i);
      if (expires) {
        const unit = (expires[2] || 'day').toLowerCase();
        const UNITS = {
          minute: MINUTE_IN_MS,
          hour: HOUR_IN_MS,
          day: DAY_IN_MS,
          week: WEEK_IN_MS,
        };

        // Match the longest unit prefix (e.g. "hours" -> "hour", "d" -> "day")
        const factor = Object.entries(UNITS).find(
          ([name]) => name.startsWith(unit) || unit.startsWith(name),
        )?.[1];

        if (factor) {
          result.expires = Math.min(
            Math.max(parseInt(expires[1], 10) * factor, MIN_EXPIRES),
            MAX_EXPIRES,
          );
        }
      }
    }
  }

  return result;
}

export async function fetchListText(url) {
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Failed to fetch the list: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();

  if (text.length > MAX_LIST_SIZE) {
    throw new Error('The list exceeds the maximum allowed size');
  }

  if (!text.trim() || text.trimStart().startsWith('<')) {
    throw new Error('The URL does not point to a filter list');
  }

  return text;
}

export async function fetchFilterList(url) {
  // On Chromium remote filter lists require the User Scripts API,
  // which is only available when "Allow user scripts" is enabled
  if (__CHROMIUM__ && !isUserScriptsSupported()) {
    throw new Error(
      'Enable "Allow user scripts" in the browser settings to fetch remote filter list',
    );
  }

  const text = await fetchListText(url);
  const { name, expires } = parseListMetadata(text);

  const { filterLists } = await store.resolve(CustomFilters);
  const changed = filterLists[url]?.text !== text;

  await store.set(CustomFilters, {
    filterLists: {
      [url]: { text, name, lastUpdatedAt: Date.now(), expires, error: '' },
    },
  });

  console.info(`[custom filters] Fetched remote list from "${url}" (${text.length} bytes)`);

  return changed;
}

export async function cleanupFilterLists(options) {
  const { filterLists } = await store.resolve(CustomFilters);
  const urls = Object.keys(filterLists).filter((url) => !options.filterLists[url]);

  if (urls.length) {
    await store.set(CustomFilters, {
      filterLists: Object.fromEntries(urls.map((url) => [url, null])),
    });
  }
}

export async function refreshFilterLists({ cache = true } = {}) {
  // On Chromium remote filter lists require the User Scripts API - skip the
  // refresh when it is not available to avoid pointless fetches and confusing
  // "Failed update" errors (the UI shows a dedicated warning instead).
  if (__CHROMIUM__ && !isUserScriptsSupported()) return false;

  const options = await store.resolve(Options);
  if (!options.customFilters.enabled) return false;

  const { filterLists } = await store.resolve(CustomFilters);
  let changed = false;

  for (const [url, { enabled }] of Object.entries(options.customFilters.filterLists)) {
    if (!enabled) continue;

    const cached = filterLists[url];
    if (cache && cached?.lastUpdatedAt && Date.now() < cached.lastUpdatedAt + cached.expires) {
      continue;
    }

    try {
      changed = (await fetchFilterList(url)) || changed;
    } catch (e) {
      console.error(`[custom filters] Failed to fetch the list from "${url}"`, e);

      await store.set(CustomFilters, {
        filterLists: { [url]: { error: e.message } },
      });
    }
  }

  return changed;
}
