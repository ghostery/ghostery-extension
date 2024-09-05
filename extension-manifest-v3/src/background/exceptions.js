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

import { parseFilter } from '@cliqz/adblocker';

import * as trackerdb from '/utils/trackerdb.js';
import * as engines from '/utils/engines.js';

import {
  createDocumentConverter,
  createOffscreenConverter,
} from '../utils/dnr-converter.js';

// Create in background sync storage for exceptions
let exceptions = {};
chrome.storage.local.get(['exceptions']).then(({ exceptions: value }) => {
  exceptions = value || {};
});

chrome.storage.onChanged.addListener((records) => {
  if (records.exceptions) {
    exceptions = records.exceptions.newValue || {};
    if (__PLATFORM__ !== 'firefox') updateFilters();
  }
});

export function getException(id) {
  return exceptions[id];
}

const convert =
  __PLATFORM__ !== 'safari' && __PLATFORM__ !== 'firefox'
    ? createOffscreenConverter()
    : createDocumentConverter();

async function updateFilters() {
  const rules = [];

  for (const exception of Object.values(exceptions)) {
    if (exception.blocked && exception.trustedDomains.length === 0) {
      continue;
    }

    const tracker = (await trackerdb.getTracker(exception.id)) || {
      domains: [exception.id],
      filters: [],
    };

    const filters = tracker.filters
      .concat(tracker.domains.map((domain) => `||${domain}^`))
      .map((f) => parseFilter(f))
      .filter((filter) => filter.isNetworkFilter())
      // Negate the filters to make them allow rules
      .map((filter) => `@@${filter.toString()}`);

    // Global rule domains/excludedDomains conditions based on the exception
    const domains = exception.blocked ? exception.trustedDomains : undefined;
    const excludedDomains =
      !exception.blocked && exception.blockedDomains.length
        ? exception.blockedDomains
        : undefined;

    for (const filter of filters) {
      try {
        const result = (await convert(filter.toString())).rules;

        rules.push(
          ...result.map((rule) => ({
            ...rule,
            condition: {
              ...rule.condition,
              // Add domain condition to the rule
              ...(__PLATFORM__ === 'safari'
                ? {
                    domains:
                      domains &&
                      domains
                        .map((d) => `*${d}`)
                        .concat(rule.condition.domains || []),
                    excludedDomains:
                      excludedDomains &&
                      excludedDomains
                        .map((d) => `*${d}`)
                        .concat(rule.condition.excludedDomains || []),
                  }
                : {
                    initiatorDomains:
                      domains &&
                      domains.concat(rule.condition.initiatorDomains || []),
                    excludedInitiatorDomains:
                      excludedDomains &&
                      excludedDomains.concat(
                        rule.condition.excludedInitiatorDomains || [],
                      ),
                  }),
            },
            // Internal prefix + priority
            priority: 2000000 + rule.priority,
          })),
        );
      } catch (e) {
        console.error('[exceptions] Error while converting filter:', e);
      }
    }
  }

  const addRules = rules.map((rule, index) => ({
    ...rule,
    id: 2000000 + index,
  }));

  const removeRuleIds = (await chrome.declarativeNetRequest.getDynamicRules())
    .filter(({ id }) => id >= 2000000)
    .map(({ id }) => id);

  await chrome.declarativeNetRequest.updateDynamicRules({
    addRules,
    removeRuleIds,
  });

  console.info('[exceptions] DNR rules for filters updated successfully');
}

if (__PLATFORM__ !== 'firefox') {
  // Update exceptions filters every time TrackerDB updates
  engines.addChangeListener(engines.TRACKERDB_ENGINE, updateFilters);
}
