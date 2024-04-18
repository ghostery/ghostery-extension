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

import { getTracker, isCategoryBlockedByDefault } from '/utils/trackerdb.js';
import convert from '/utils/dnr-converter.js';

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

let exceptions = {};

chrome.storage.local.get(['exceptions']).then((result) => {
  exceptions = result.exceptions || {};
});

chrome.storage.onChanged.addListener(async (changes) => {
  if (!changes['exceptions']) {
    return;
  }

  exceptions = changes['exceptions'].newValue || {};

  const networkFilters = [];
  const cosmeticFilters = [];

  for (const exception of Object.values(exceptions)) {
    const pattern = (await getTracker(exception.id)) || {
      domains: [exception.id],
      filters: [],
    };
    const shouldBlockByDefault = isCategoryBlockedByDefault(pattern.category);
    const shouldNegate = shouldBlockByDefault === exception.overwriteStatus;

    // Action to take based on category (blocking / non-blocking) and the overwrite
    // global:
    // * blocking with overwrite = trust
    // * blocking without overwrite = nothing
    // * non-blocking with overwrite = block
    // * non-blocking without overwrite = nothing
    // website blocked:
    // * blocking with overwrite = block
    // * blocking without overwrite = nothing
    // * non-blocking with overwrite = nothing
    // * non-blocking without overwrite = block
    // website allowed:
    // * blocking with overwrite = nothing
    // * blocking without overwrite = allow
    // * non-blocking with overwrite = allow
    // * non-blocking without overwrite = nothing

    // TODO:
    // [ ] double click - advertising
    // [ ] google tag manager - essential
    // [ ] onetrust - consent
    // [ ] unidentified

    let filters = [
      ...pattern.filters,
      ...pattern.domains.map((domain) => `||${domain}^$third-party`),
    ].map((filter) => parseFilter(filter));

    if (shouldNegate) {
      filters = filters.map((filter) => negateFilter(filter));
    }

    if (exception.overwriteStatus) {
      for (const filter of filters) {
        if (filter.isNetworkFilter()) {
          networkFilters.push(filter.toString());
        } else if (filter.isCosmeticFilter()) {
          cosmeticFilters.push(filter.toString());
        }
      }
    }
  }

  if (__PLATFORM__ !== 'firefox') {
    await updateDNRRules(networkFilters);
  }
  await updateCosmeticFilters(cosmeticFilters);
});

export function getException(id) {
  return exceptions[id];
}

async function updateCosmeticFilters(/* filters */) {
  // TODO
  //engines.createCustomEngine(filters.join('\n'))
}

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
        priority: 2000000,
      })),
    );
  }
  console.warn(dnrRules);
  const addRules = dnrRules.map((rule, index) => ({
    ...rule,
    id: 2000000 + index,
  }));

  const removeRuleIds = (await chrome.declarativeNetRequest.getDynamicRules())
    .filter(({ id }) => id >= 2000000)
    .map(({ id }) => id);

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds,
  });
  await chrome.declarativeNetRequest.updateDynamicRules({
    addRules,
  });
}
