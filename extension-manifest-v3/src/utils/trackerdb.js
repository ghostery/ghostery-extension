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
import { sortCategories } from '@ghostery/ui/categories';

import * as engines from './engines.js';
import asyncSetup from './setup.js';

export const setup = asyncSetup([engines.init(engines.TRACKERDB_ENGINE)]);

export function getUnidentifiedTracker(hostname) {
  return {
    id: hostname,
    name: hostname.length > 24 ? '...' + hostname.slice(-24) : hostname,
    category: 'unidentified',
    exception: hostname,
    blockedByDefault: true,
  };
}

export function getMetadata(request) {
  if (setup.pending) {
    console.warn('TrackerDB not ready yet');
    return null;
  }

  const engine = engines.get(engines.TRACKERDB_ENGINE);

  let matches = engine.getPatternMetadata(request);

  // No match for the pattern, try to get metadata from the domain
  if (matches.length === 0) {
    matches = engine.metadata.fromDomain(request.hostname);
  }

  // No match for the domain, try to get metadata for blocked or modified requests
  if (matches.length === 0) {
    // INFO: Blobs and data URLs don't have hostnames
    if (!request.hostname || (!request.blocked && !request.modified)) {
      return null;
    }
    return getUnidentifiedTracker(request.hostname);
  }

  // Get tracker info from the first match of the TrackerDB
  return getTrackers().get(matches[0].pattern.key);
}

const trackersMap = new Map();
function getTrackers() {
  if (!trackersMap.size) {
    const engine = engines.get(engines.TRACKERDB_ENGINE);
    const organizations = engine.metadata.organizations.getValues();
    const categories = engine.metadata.categories.getValues();

    for (const p of engine.metadata.getPatterns()) {
      const organization = organizations.find((o) => o.key === p.organization);

      trackersMap.set(p.key, {
        id: p.key,
        name: p.name,
        category: p.category,
        categoryDescription: categories.find((c) => c.key === p.category)
          ?.description,
        websiteUrl: p.website_url,
        exception: p.key,
        filters: p.filters,
        domains: p.domains,
        organization: organization
          ? {
              id: organization.key,
              name: organization.name,
              description: organization.description,
              country: organization.country,
              contact: organization.privacy_contact,
              websiteUrl: organization.website_url,
              privacyPolicyUrl: organization.privacy_policy_url,
            }
          : undefined,
        blockedByDefault: true,
      });
    }
  }

  return trackersMap;
}

export async function getTracker(key) {
  setup.pending && (await setup.pending);

  // Ensure trackers are loaded
  getTrackers();

  return trackersMap.get(key);
}

export async function getSimilarTrackers(tracker) {
  const result = [];

  tracker = await getTracker(tracker);
  if (!tracker.organization) return result;

  trackersMap.forEach((t) => {
    if (t.organization?.id === tracker.organization.id && t.id !== tracker.id) {
      result.push(t);
    }
  });

  return result;
}

export async function getCategories() {
  setup.pending && (await setup.pending);
  const engine = engines.get(engines.TRACKERDB_ENGINE);

  const categories = new Map(
    engine.metadata.categories.getValues().map(({ key, description }) => [
      key,
      {
        key,
        description,
        blockedByDefault: true,
        trackers: [],
      },
    ]),
  );

  for (const p of getTrackers().values()) {
    categories.get(p.category).trackers.push(p);
  }

  return [...categories.values()]
    .filter((c) => c.trackers.length > 0)
    .sort(sortCategories((c) => c.key));
}
