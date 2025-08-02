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
import convert from '/utils/dnr-converter.js';
import {
  EXCEPTIONS_ID_RANGE,
  EXCEPTIONS_RULE_PRIORITY,
  getDynamicRulesIds,
} from '/utils/dnr.js';

// Migrate exceptions from old format
// TODO: Remove this in the next version
try {
  chrome.storage.local
    .get(['exceptions'])
    .then(async ({ exceptions: values }) => {
      if (values) {
        const exceptions = {};
        Object.entries(values).forEach(([id, { blocked, trustedDomains }]) => {
          if (!blocked || trustedDomains.length > 0) {
            exceptions[id] = { global: !blocked, domains: trustedDomains };
          }
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

    if (!filters.length) continue;

    const result = await convert(filters);

    for (const rule of result.rules) {
      if (domains && domains.length) {
        if (__PLATFORM__ === 'safari') {
          rule.condition.domains = domains
            .map((d) => `*${d}`)
            .concat(rule.condition.domains || []);
        } else {
          rule.condition.initiatorDomains = domains.concat(
            rule.condition.initiatorDomains || [],
          );
        }
      }

      rules.push({
        ...rule,
        priority: EXCEPTIONS_RULE_PRIORITY + rule.priority,
      });
    }
  }

  const addRules = rules.map((rule, index) => ({
    ...rule,
    id: EXCEPTIONS_RULE_PRIORITY + index,
  }));

  const removeRuleIds = await getDynamicRulesIds(EXCEPTIONS_ID_RANGE);

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
