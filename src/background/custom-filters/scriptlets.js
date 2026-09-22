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

import { CosmeticFilter } from '@ghostery/adblocker';

// Lists shipped from the CDN percent-encode scriptlet arguments and the injection
// decodes them, so arguments written in the plain list syntax are encoded the same
// way to stay literal after the decode.
function encodeSelector(filter) {
  const parsed = filter.parseScript();
  if (!parsed || !parsed.name) return undefined;

  return [parsed.name, ...parsed.args.map((arg) => encodeURIComponent(arg))].join(', ');
}

function withSelector(filter, selector) {
  return new CosmeticFilter({
    mask: filter.mask,
    selector,
    domains: filter.domains,
    parentDomains: filter.parentDomains,
    style: filter.style,
    rawLine: filter.rawLine,
  });
}

// An exception cancels an injection only when both selectors are equal, so a scriptlet
// unhide keeps the selector as written (matching a filter copied from the logger, where
// CDN lists are already encoded) next to the encoded copy (matching custom injections
// and arguments written in the plain syntax).
export function encodeScriptletFilters(cosmeticFilters, preprocessors) {
  const result = [];

  for (const filter of cosmeticFilters) {
    const selector =
      filter.isScriptInject() && filter.selector ? encodeSelector(filter) : undefined;

    if (selector === undefined || selector === filter.selector) {
      result.push(filter);
      continue;
    }

    const encoded = withSelector(filter, selector);

    for (const preprocessor of preprocessors) {
      if (preprocessor.filterIDs.has(filter.getId())) {
        preprocessor.filterIDs.add(encoded.getId());
      }
    }

    if (filter.isUnhide()) result.push(filter);
    result.push(encoded);
  }

  return result;
}
