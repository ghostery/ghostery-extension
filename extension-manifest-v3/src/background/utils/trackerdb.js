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

import { FiltersEngine } from '@cliqz/adblocker';

let engine;
let trackerDBStartupPromise = (async () => {
  const response = await fetch(
    chrome.runtime.getURL('rule_resources/engine-trackerdb.bytes'),
  );
  const rawTrackerDB = await response.arrayBuffer();
  engine = FiltersEngine.deserialize(new Uint8Array(rawTrackerDB));
  trackerDBStartupPromise = undefined;
})();

export async function getMetadata(request) {
  if (trackerDBStartupPromise) {
    await trackerDBStartupPromise;
  }

  let matches = engine.getPatternMetadata(request);

  if (matches.length === 0) {
    matches = engine.metadata.fromDomain(request.domain);
  }

  if (matches.length === 0) {
    return null;
  }

  const { category, pattern, organization } = matches[0];

  const metadata = {
    key: pattern.key,
    name: pattern.name,
    category: category.key,
    company: organization
      ? {
          id: pattern.key,
          name: organization.name,
          description: organization.description,
          website: organization.website_url || pattern.website_url,
          contact: organization.privacy_contact,
          privacyPolicy: organization.privacy_policy_url,
        }
      : {
          id: pattern.key,
          name: pattern.name,
          website: pattern.website_url,
        },
    url: request.url,
    blocked: request.blocked,
  };

  return metadata;
}

const patterns = new Map();
export async function getPattern(key) {
  if (trackerDBStartupPromise) {
    await trackerDBStartupPromise;
  }

  if (!patterns.size) {
    for (const p of engine.metadata.getPatterns()) {
      patterns.set(p.key, p);
    }
  }

  return patterns.get(key);
}
