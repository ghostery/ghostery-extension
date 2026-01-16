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

import { processUrlQuery } from './metrics.js';

const ATTRIBUTION_COOKIE = 'attribution';
const ATTRIBUTION_DOMAINS = ['www.ghostery.com', 'ghostery.info'];

function parseAttributionCookie(value) {
  if (!value) return null;
  const params = new URLSearchParams(value);
  const source = params.get('s');
  const campaign = params.get('c');
  if (source && campaign) {
    return { utm_source: source, utm_campaign: campaign };
  }
  return null;
}

async function getAttributionFromCookies() {
  const tabs = await chrome.tabs.query({
    url: ATTRIBUTION_DOMAINS.map((domain) => `https://${domain}/*`),
  });
  const tabIds = new Set(tabs.map((tab) => tab.id));

  const cookieStores = await chrome.cookies.getAllCookieStores();
  const storeIds = cookieStores
    .filter((store) => store.tabIds.some((id) => tabIds.has(id)))
    .map((store) => store.id);

  if (storeIds.length === 0) {
    storeIds.push(undefined);
  }

  for (const domain of ATTRIBUTION_DOMAINS) {
    for (const storeId of storeIds) {
      try {
        const cookie = await chrome.cookies.get({
          url: `https://${domain}/`,
          name: ATTRIBUTION_COOKIE,
          storeId,
        });

        if (cookie) {
          const attribution = parseAttributionCookie(cookie.value);
          if (attribution) return attribution;
        }
      } catch (e) {
        console.error(`[telemetry] Failed to read cookies for ${domain}:`, e);
      }
    }
  }
  return null;
}

async function getAttributionFromUTMs() {
  const tabs = await chrome.tabs.query({
    url: [
      'https://chromewebstore.google.com/detail/ghostery-*/mlomiejdfkolichcflejclcbmpeaniij*',
      'https://chrome.google.com/webstore/detail/ghostery-*/mlomiejdfkolichcflejclcbmpeaniij*',
      'https://microsoftedge.microsoft.com/addons/detail/ghostery-*/fclbdkbhjlgkbpfldjodgjncejkkjcme*',
      'https://addons.mozilla.org/*/firefox/addon/ghostery/*',
      'https://addons.opera.com/*/extensions/details/ghostery/*',
      'https://apps.apple.com/app/apple-store/id6504861501/*',
      'https://apps.apple.com/*/app/ghostery-*/id6504861501*',
      'https://www.ghostery.com/*',
      'https://www.ghosterystage.com/*',
    ],
  });

  for (const tab of tabs) {
    const query = processUrlQuery(tab.url);

    if (query.utm_source && query.utm_campaign) {
      return query;
    }
  }

  return {};
}

export default async function detectAttribution() {
  const cookieAttribution = await getAttributionFromCookies();
  if (cookieAttribution) return cookieAttribution;

  return getAttributionFromUTMs();
}
