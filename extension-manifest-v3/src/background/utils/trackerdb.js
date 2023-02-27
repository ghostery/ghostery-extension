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

import { FiltersEngine, Request } from '@cliqz/adblocker';
import trackerDBEngine from '/assets/trackerdb.engine.bytes';

// let engine;
// let trackerDBStartupPromise = (async () => {
//   const response = await fetch(
//     chrome.runtime.getURL('assets/bytes/trackerdb.engine'),
//   );
//   const rawTrackerDB = await response.arrayBuffer();
//   engine = FiltersEngine.fromTrackerDB(rawTrackerDB);
//   trackerDBStartupPromise = undefined;
// })();

const engine = FiltersEngine.deserialize(new Uint8Array(trackerDBEngine.buffer));

export function getMetadata(url, sourceUrl) {
  // if (trackerDBStartupPromise) {
  //   await trackerDBStartupPromise;
  // }

  const request = Request.fromRawDetails({ url, sourceUrl });

  let matches = engine.getPatternMetadata(request);

  if (matches.length === 0) {
    matches = engine.metadata.fromDomain(request.domain);
  }

  if (matches.length === 0) {
    return null;
  }

  const { category, pattern, organization } = matches[0];

  return {
    name: pattern.name,
    category: category.key,
    company: {
      id: organization.key,
      name: organization.name,
      description: organization.description,
      website: organization.website_url,
      contact: organization.privacy_contact,
      privacyPolicy: organization.privacy_policy_url,
    },
    url,
  };
}
