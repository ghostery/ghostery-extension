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

let promise = engines.init(engines.TRACKERDB_ENGINE).then(() => {
  promise = null;
});

export function getMetadata(request) {
  if (promise) {
    console.warn('TrackerDB not ready yet');
    return null;
  }

  const engine = engines.get(engines.TRACKERDB_ENGINE);
  let isFilterMatched = true;

  let matches = engine.getPatternMetadata(request);

  if (matches.length === 0) {
    isFilterMatched = false;
    matches = engine.metadata.fromDomain(request.domain);
  }

  if (matches.length === 0) {
    return null;
  }

  const { category, pattern, organization } = matches[0];

  const metadata = {
    id: pattern.key,
    name: pattern.name,
    category: category.key,
    company: organization?.name,
    description: organization?.description,
    website: pattern.website_url,
    organizationWebsite:
      organization?.website_url !== pattern.website_url
        ? organization?.website_url
        : '',
    contact: organization?.privacy_contact,
    country: organization?.country,
    privacyPolicy: organization?.privacy_policy_url,
    isFilterMatched,
  };

  return metadata;
}

const trackersMap = new Map();
function getTrackers() {
  if (!trackersMap.size) {
    const engine = engines.get(engines.TRACKERDB_ENGINE);
    const organizations = engine.metadata.organizations.getValues();

    for (const p of engine.metadata.getPatterns()) {
      const organization = organizations.find((o) => o.key === p.organization);

      trackersMap.set(p.key, {
        id: p.key,
        name: p.name,
        category: p.category,
        exception: p.key,
        organization: organization
          ? {
              id: organization.key,
              name: organization.name,
              country: organization.country,
              websiteUrl: organization.website_url,
              privacyPolicyUrl: organization.privacy_policy_url,
            }
          : undefined,
      });
    }
  }

  return trackersMap;
}

export async function getTracker(key) {
  if (promise) await promise;

  const engine = engines.get(engines.TRACKERDB_ENGINE);
  if (!engine) return null;

  // Ensure trackers are loaded
  getTrackers();

  return trackersMap.get(key);
}

export async function getCategories() {
  if (promise) await promise;

  const engine = engines.get(engines.TRACKERDB_ENGINE);
  if (!engine) return [];

  const categories = new Map(
    engine.metadata.categories
      .getValues()
      .map(({ key, description }) => [key, { key, description, trackers: [] }]),
  );

  for (const p of getTrackers().values()) {
    categories.get(p.category).trackers.push(p);
  }

  return [...categories.values()].filter((c) => c.trackers.length > 0);
}

export function isCategoryBlockedByDefault(categoryId) {
  switch (categoryId) {
    case 'advertising':
    case 'pornvertising':
    case 'email':
    case 'site_analytics':
    case 'unidentified':
    case undefined:
      return true;
    default:
      return false;
  }
}
