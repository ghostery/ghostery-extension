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
import * as engines from './engines.js';
import asyncSetup from './setup.js';

// TODO: remove after sunsetting Ghostery 8
// This code is a duplicate of '@ghostery/ui/categories'
// It's a walkaround to deal with WebPack problems with import.meta in @ghostery/ui when using type=module
const categoryOrder = [
  'advertising',
  'site_analytics',
  'consent',
  'essential',
  'hosting',
  'customer_interaction',
  'audio_video_player',
  'cdn',
  'comments',
  'email',
  'extensions',
  'misc',
  'pornvertising',
  'social_media',
  'telemetry',
  'unidentified',
  'other',
];

const setup = asyncSetup([engines.init(engines.TRACKERDB_ENGINE)]);

export function isCategoryBlockedByDefault(categoryId) {
  return categoryId !== 'essential';
}

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
    matches = engine.metadata.fromDomain(request.domain);
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
        blockedByDefault: isCategoryBlockedByDefault(p.category),
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
        blockedByDefault: isCategoryBlockedByDefault(key),
        trackers: [],
      },
    ]),
  );

  for (const p of getTrackers().values()) {
    categories.get(p.category).trackers.push(p);
  }

  return [...categories.values()]
    .filter((c) => c.trackers.length > 0)
    .sort(
      (a, b) => categoryOrder.indexOf(a.key) - categoryOrder.indexOf(b.key),
    );
}

export function addUpdateListener(fn) {
  engines.addUpdateListener(engines.TRACKERDB_ENGINE, fn);
}
