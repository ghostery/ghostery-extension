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

import { msg } from 'hybrids';

import { lang } from '/ui/labels.js';

import { PRIVACY_DIGEST_LATEST_EDITION_URL } from '/utils/urls.js';

import privacyDigestImage from '../assets/privacy-digest.svg';

// Editions are dated by day (midnight UTC), so the date must not shift to the local time zone
const dateFormatter = new Intl.DateTimeFormat(lang, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

async function fetchLatestEdition() {
  try {
    const res = await fetch(PRIVACY_DIGEST_LATEST_EDITION_URL);
    if (!res.ok) throw new Error(`Unexpected response status: ${res.status}`);

    const edition = await res.json();
    const publishedAt = Date.parse(edition.published_at);

    if (!edition.edition_number || !edition.body || !edition.url || Number.isNaN(publishedAt)) {
      throw new Error('Incomplete edition data');
    }

    return {
      number: edition.edition_number,
      body: edition.body,
      url: edition.url,
      publishedAt,
    };
  } catch (e) {
    console.error('[privacy-digest] Failed to fetch the latest edition', e);
    return null;
  }
}

export async function getPrivacyDigestNotification() {
  const edition = await fetchLatestEdition();
  if (!edition) return null;

  return {
    img: privacyDigestImage,
    type: 'image',
    title: `Privacy Digest ${edition.number}`,
    date: dateFormatter.format(edition.publishedAt),
    text: edition.body,
    url: `${edition.url}?utm_source=gbe&utm_campaign=privacy_digest`,
    action: msg`Read the latest edition`,
    // Not a part of the model - used to choose the notification
    publishedAt: edition.publishedAt,
  };
}
