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

import phantomStats from '/rule_resources/phantom-stats.js';

export function getPhantomStats(domain) {
  return phantomStats.sites[domain] || null;
}

export function getPhantomCount(domain) {
  const stats = phantomStats.sites[domain];
  return stats ? Object.values(stats).reduce((acc, count) => acc + count, 0) : 0;
}

export function hasPhantomStats(domain) {
  return phantomStats.sites[domain] !== undefined;
}
