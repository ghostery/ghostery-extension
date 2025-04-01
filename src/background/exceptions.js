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
import { parseFilter } from '@ghostery/adblocker';

import Options from '/store/options.js';
import * as OptionsObserver from '/utils/options-observer.js';
import * as trackerdb from '/utils/trackerdb.js';

import {
  createDocumentConverter,
  createOffscreenConverter,
} from '../utils/dnr-converter.js';

// Migrate exceptions from old format
// TODO: Remove this in the next version
try {
  chrome.storage.local
    .get(['exceptions'])
    .then(async ({ exceptions: values }) => {
      if (values) {
        const exceptions = {};
        Object.entries(values).forEach(([id, { blocked, trustedDomains }]) => {
          exceptions[id] = { global: !blocked, domains: trustedDomains };
        });

        await store.set(Options, { exceptions });
        await chrome.storage.local.remove('exceptions');

        updateFilters();

        console.log('[exceptions] Migration completed successfully.');
      }
    });
} catch (e) {
  console.error(
    '[exceptions] Error while migrating exceptions from old format:',
    e,
  );
}

const convert =
  __PLATFORM__ === 'chromium'
    ? createOffscreenConverter()
    : createDocumentConverter();

async function updateFilters() {
  const options = await store.resolve(Options);
  const rules = [];

  for (const [id, exception] of Object.entries(options.exceptions)) {
    const tracker = (await trackerdb.getTracker(id)) || {
      domains: [id],
      filters: [],
    };
    const domains = !exception.global ? exception.domains : undefined;

    const filters = tracker.filters
      .concat(tracker.domains.map((domain) => `||${domain}^`))
      .map((f) => parseFilter(f))
      .filter((filter) => filter.isNetworkFilter())
      // Negate the filters to make them allow rules
      .map((filter) => `@@${filter.toString()}`);

    for (const filter of filters) {
      try {
        const result = (await convert(filter.toString())).rules;

        for (const rule of result) {
          if (rule.condition.regexFilter) {
            const { isSupported, reason } =
              await chrome.declarativeNetRequest.isRegexSupported({
                regex: rule.condition.regexFilter,
              });
            if (!isSupported) {
              console.error(
                `Could not add an exception for "${tracker.name}" as filter "${filter.toString()}" is a not supported regexp due to: ${reason}`,
              );
              continue;
            }
          }

          rules.push({
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
                  }
                : {
                    initiatorDomains:
                      domains &&
                      domains.concat(rule.condition.initiatorDomains || []),
                  }),
            },
            // Internal prefix + priority
            priority: 2000000 + rule.priority,
          });
        }
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

  if (addRules.length || removeRuleIds.length) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules,
      removeRuleIds,
    });

    console.info('[exceptions] Updated DNR rules');
  }
}

if (__PLATFORM__ === 'chromium' || __PLATFORM__ === 'safari') {
  // Update exceptions filters every time TrackerDB updates
  // It happens when all engines are updated
  OptionsObserver.addListener(
    'filtersUpdatedAt',
    async function updateExceptions(value, lastValue) {
      // Only update exceptions filters if the value has changed and is set to timestamp.
      // It will happen only after successful update of the engines.
      if (lastValue !== undefined && value !== 0) {
        await updateFilters();
      }
    },
  );

  OptionsObserver.addListener(
    'exceptions',
    async function updateExceptions(value, lastValue) {
      if (lastValue === undefined) return;
      await updateFilters();
    },
  );
}
