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

import { getPattern, isCategoryBlockedByDefault } from '/utils/trackerdb.js';
import convert from '/utils/dnr-converter.js';

function negateFilter(filter) {
  const cleanFilter = filter.toString();

  if (filter.isNetworkFilter()) {
    if (filter.isException()) {
      return cleanFilter.slice(2);
    }
    return `@@${cleanFilter}`;
  } else if (filter.isCosmeticFilter()) {
    if (filter.isUnhide()) {
      return cleanFilter.replace('#@#', '##');
    }
    return cleanFilter.replace('##', '#@#');
  }
}

chrome.storage.onChanged.addListener(async (changes) => {
  if (!changes['exceptions']) {
    return;
  }

  const networkFilters = [];
  const cosmeticFilters = [];

  for (const exception of changes['exceptions'].newValue || []) {
    const pattern = await getPattern(exception.id);
    const shouldNegate =
      isCategoryBlockedByDefault(pattern.category) ===
      exception.overwriteStatus;
    console.info('exception', exception, shouldNegate);

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

    // WIP
    for (const rawFilter of pattern.filters) {
      const filter = parseFilter(rawFilter);

      // global
      if (filter.isNetworkFilter()) {
        networkFilters.push(negateFilter(filter));
      } else if (filter.isCosmeticFilter()) {
        cosmeticFilters.push(negateFilter(filter));
      }
      // website blocked:
      for (const hostname of exception.blocked) {
        console.info(hostname);
      }
      // website allowed:
      for (const hostname of exception.allowed) {
        console.info(hostname);
      }
    }
  }

  for (const filter of networkFilters) {
    const dnrRule = await convert(filter);
    console.info(dnrRule);
  }
});
