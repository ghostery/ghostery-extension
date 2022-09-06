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

const colors = {
  advertising: '#cb55cd',
  audio_video_player: '#ef671e',
  cdn: '#43b7c5',
  customer_interaction: '#fdc257',
  essential: '#fc9734',
  misc: '#ecafc2',
  site_analytics: '#87d7ef',
  social_media: '#388ee8',
  hosting: '#e8e8e8',
  pornvertising: '#fb5b8b',
  extensions: '#e2e781',
  comments: '#b0a8ff',
  consent: '#becfb3',
  unknown: '#959595',
  default: '#ffffff30',
  no_tracker: '#94c59e',
};

export const order = [
  'advertising',
  'site_analytics',
  'cdn',
  'audio_video_player',
  'misc',
  'essential',
  'social_media',
  'hosting',
  'customer_interaction',
  'pornvertising',
  'extensions',
  'comments',
  'consent',
  'unknown',
];

export const getCategoryKey = (category) => {
  return colors[category] ? category : 'unknown';
};

export const getCategoryColor = (category) => {
  return colors[getCategoryKey(category)];
};

export const sortCategories = (resolveCategoryName = (a) => a) => {
  return (a, b) => {
    const a1 = getCategoryKey(resolveCategoryName(a));
    const b1 = getCategoryKey(resolveCategoryName(b));
    return order.indexOf(a1) - order.indexOf(b1);
  };
};
