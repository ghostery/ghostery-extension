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

import { order as categoryOrder } from '@ghostery/ui/categories';

import * as engines from './engines.js';
import { getException } from '../background/exceptions.js';

let promise = engines.init(engines.TRACKERDB_ENGINE).then(() => {
  promise = null;
});

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

export function isTrusted(domainOrHostname, category, exception) {
  const isCategoryBlocked = isCategoryBlockedByDefault(category);

  if (exception.blocked) {
    return exception.trustedDomains.includes(domainOrHostname) || false;
  } else {
    return (
      !exception.blockedDomains.includes(domainOrHostname) &&
      exception.blocked !== isCategoryBlocked
    );
  }
}

export function getMetadata(request) {
  if (promise) {
    console.warn('TrackerDB not ready yet');
    return null;
  }

  const engine = engines.get(engines.TRACKERDB_ENGINE);

  let isFilterMatched = true;
  let exception = null;
  let matches = engine.getPatternMetadata(request);

  if (matches.length === 0) {
    isFilterMatched = false;
    matches = engine.metadata.fromDomain(request.domain);
  }

  if (matches.length === 0) {
    exception = getException(request.domain);
    if (!exception) return null;

    matches = [
      {
        pattern: { key: request.domain, name: request.domain },
        category: { key: 'unidentified' },
      },
    ];
  }

  const tracker = getTrackers().get(matches[0].pattern.key);
  exception = exception || getException(tracker.id);

  const metadata = {
    ...tracker,
    isFilterMatched,
    isTrusted:
      exception &&
      request.tab &&
      isTrusted(
        request.tab.domain || request.tab.hostname,
        tracker.category,
        exception,
      ),
  };

  return metadata;
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
  if (promise) await promise;

  // Ensure trackers are loaded
  getTrackers();

  return trackersMap.get(key);
}

export async function getSimilarTrackers(tracker) {
  if (promise) await promise;
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
  if (promise) await promise;
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
