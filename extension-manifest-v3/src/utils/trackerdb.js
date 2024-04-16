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

export async function getCategories() {
  if (promise) await promise;

  const engine = engines.get(engines.TRACKERDB_ENGINE);
  if (!engine) return [];

  const categories = new Map(
    engine.metadata.categories
      .getValues()
      .map(({ key, description }) => [key, { key, description, patterns: [] }]),
  );

  const organizations = engine.metadata.organizations.getValues();

  for (const p of engine.metadata.getPatterns()) {
    categories.get(p.category).patterns.push({
      ...p,
      organization: organizations.find((o) => o.key === p.organization),
    });
  }

  return [...categories.values()].filter((c) => c.patterns.length > 0);
}

const patterns = new Map();
export async function getPattern(key) {
  if (promise) await promise;

  const engine = engines.get(engines.TRACKERDB_ENGINE);
  if (!engine) return null;

  if (!patterns.size) {
    for (const p of engine.metadata.getPatterns()) {
      patterns.set(p.key, p);
    }
  }

  return patterns.get(key);
}

export function isCategoryBlockedByDefault(categoryId) {
  switch (categoryId) {
    case 'advertising':
    case 'adult_advertising':
    case 'email':
    case 'site_analytics':
    case 'unidentified':
    case undefined:
      return true;
    default:
      return false;
  }
}
