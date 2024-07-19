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

import * as trackerdb from '../utils/trackerdb.js';

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
    updateFilters();
  }
});

export function getException(id) {
  return exceptions[id];
}

async function updateFilters() {
  const filters = await convertExceptionsToFilters(exceptions);

  const networkFilters = [];
  const cosmeticFilters = [];

  for (const filter of filters) {
    if (filter.isNetworkFilter()) {
      networkFilters.push(filter.toString());
    } else if (filter.isCosmeticFilter()) {
      cosmeticFilters.push(filter.toString());
    }
  }

  if (__PLATFORM__ !== 'firefox') {
    await updateDNRRules(networkFilters);
  }

  console.info('Exceptions: filters updated successfully');
}

// Update exceptions filters every time TrackerDB updates
trackerdb.addUpdateListener(updateFilters);

async function updateDNRRules(networkFilters) {
  const dnrRules = [];
  for (const filter of networkFilters) {
    const { rules, errors } = await convert(filter);
    if (errors.length > 0) {
      console.error(errors);
    }
    dnrRules.push(
      ...rules.map((rule) => ({
        ...rule,
        priority: 2000000 + rule.priority,
      })),
    );
  }

  const addRules = dnrRules.map((rule, index) => ({
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
}

const convert =
  __PLATFORM__ !== 'safari' && __PLATFORM__ !== 'firefox'
    ? createOffscreenConverter()
    : createDocumentConverter();

function negateFilter(filter) {
  const cleanFilter = filter.toString();
  let negatedFilter = '';
  if (filter.isNetworkFilter()) {
    negatedFilter = filter.isException()
      ? cleanFilter.slice(2)
      : `@@${cleanFilter}`;
  } else if (filter.isCosmeticFilter()) {
    negatedFilter = filter.isUnhide()
      ? cleanFilter.replace('#@#', '##')
      : cleanFilter.replace('##', '#@#');
  }
  return parseFilter(negatedFilter);
}

export function restrictFilter(filter, domain) {
  const cleanFilter = filter.toString();
  let restrictedFilter = '';
  if (filter.isNetworkFilter()) {
    if (!filter.domains) {
      restrictedFilter = `${cleanFilter}${
        cleanFilter.includes('$') ? ',' : '$'
      }domain=${domain}`;
    } else {
      const domains = [...filter.domains.parts.split(','), domain];
      restrictedFilter = cleanFilter.replace(
        /domain=(.*?)(,|$)/,
        `domain=${domains.join('|')}$2`,
      );
    }
  } else if (filter.isCosmeticFilter()) {
    if (cleanFilter.startsWith('##') || cleanFilter.startsWith('#@#')) {
      restrictedFilter = `${domain}${cleanFilter}`;
    } else {
      restrictedFilter = `${domain},${cleanFilter}`;
    }
  }
  return parseFilter(restrictedFilter);
}

async function convertExceptionsToFilters(exceptions) {
  const filters = [];

  for (const exception of Object.values(exceptions)) {
    const pattern = (await trackerdb.getTracker(exception.id)) || {
      domains: [exception.id],
      filters: [],
    };

    const blockedByDefault = trackerdb.isCategoryBlockedByDefault(
      pattern.category,
    );

    const blockFilters = pattern.filters.map((filter) => parseFilter(filter));

    if (blockedByDefault) {
      blockFilters.push(
        ...pattern.domains
          .map((domain) => `||${domain}^`)
          .map((filter) => parseFilter(filter)),
      );
    }

    const allowFilters = blockFilters.map((filter) => negateFilter(filter));

    // Exception overwrites default behavior
    if (exception.blocked !== blockedByDefault) {
      filters.push(...(exception.blocked ? blockFilters : allowFilters));
    }

    if (exception.blocked) {
      for (const domain of exception.trustedDomains) {
        for (const filter of allowFilters) {
          filters.push(restrictFilter(filter, domain));
        }
      }
    } else {
      for (const domain of exception.blockedDomains) {
        for (const filter of blockFilters) {
          filters.push(restrictFilter(filter, domain));
        }
      }
    }
  }
  return filters;
}
