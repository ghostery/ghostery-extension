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

import { parseFilters } from '@ghostery/adblocker';

// Makes one plain hiding filter for one hostname. Rejects any other
// filter syntax: scriptlets, styles, extended selectors, extra lines.
export function toCosmeticFilter(hostname, selector) {
  if (!/^[a-z0-9.-]+$/i.test(hostname)) return null;

  const { cosmeticFilters, networkFilters } = parseFilters(`${hostname}##${selector}`);
  const [filter] = cosmeticFilters;

  // Expect exactly one cosmetic filter
  if (!filter || cosmeticFilters.length > 1 || networkFilters.length > 0) return null;
  if (filter.isScriptInject() || filter.isExtended()) return null;
  if (filter.hasCustomStyle() || filter.isHtmlFiltering()) return null;

  return filter;
}
