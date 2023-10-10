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
  advertising: '#CB55CD',
  site_analytics: '#5EBEDB',
  consent: '#556FCD',
  essential: '#FC9734',
  hosting: '#8459A5',
  customer_interaction: '#EF671E',
  unidentified: '#79859E',
  audio_video_player: '#4ECB4E',
  cdn: '#4ECBA1',
  comments: '#4EA1CB',
  email: '#4E4ECB',
  extensions: '#A14ECB',
  misc: '#CB4EA1',
  pornvertising: '#CB4E4E',
  social_media: '#CBA14E',
  telemetry: '#A1CB4E',
  other: '#D5DBE5',
};

const backgroundColors = {
  ...colors,
  site_analytics: '#87D7EF',
  unidentified: '#DBDFE7',
};

export const order = [
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

export function getCategoryKey(category) {
  return colors[category] ? category : 'unidentified';
}

export function getCategoryColor(category) {
  return colors[getCategoryKey(category)];
}

export function getCategoryBgColor(category) {
  return backgroundColors[getCategoryKey(category)];
}

export function sortCategories(resolveCategoryName = (a) => a) {
  return (a, b) => {
    const a1 = getCategoryKey(resolveCategoryName(a));
    const b1 = getCategoryKey(resolveCategoryName(b));
    return order.indexOf(a1) - order.indexOf(b1);
  };
}
