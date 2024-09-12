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
import wtmStats from '/rule_resources/wtm-stats.js';

export function getWTMStats(domain) {
  const data = wtmStats.trackers[domain];

  if (data) {
    const results = {};
    wtmStats.categories.forEach(function (c, i) {
      if (data[i] > 0) {
        results[c] = data[i];
      }
    });

    return Object.keys(results).reduce(
      (all, current) => [...all, ...Array(results[current]).fill(current)],
      [],
    );
  }

  return [];
}

export function hasWTMStats(domain) {
  return !!wtmStats.trackers[domain];
}
