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

/*
 * Finds the best matching parent domain for a given hostname from a record
 * of domains. The best match is determined as the shortest domain that is
 * either identical to the hostname or is a parent domain of the hostname.
 *
 * Returns null if no match is found or if no hostname is provided.
 */
export function findParentDomain(record, hostname = '') {
  if (!hostname) return null;

  let bestMatch = null;
  let lengthToBeat = hostname.length + 1;

  for (const domain of Object.keys(record)) {
    if (domain.length < lengthToBeat && hostname.endsWith(domain)) {
      const startPos = hostname.length - domain.length;
      if (startPos == 0 || hostname[startPos - 1] === '.') {
        bestMatch = domain;
        lengthToBeat = domain.length;
      }
    }
  }
  return bestMatch;
}
