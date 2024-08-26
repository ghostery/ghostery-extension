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

// Regions for which we have language-specific engines
// The list is used different contexts, eg. in the build process to download the engines,
// in the settings page to show the available regions, etc.

// WARNING: Any change to this list must be reflected in `/store/options.js` migration
// (clean up the selected regions) as the user might have selected a region that
// is no longer available.

const REGIONS = [
  'ar',
  'cs',
  'de',
  'el',
  'es',
  'fr',
  'he',
  'hi',
  'hu',
  'id',
  'it',
  'ja',
  'ko',
  'lt',
  'lv',
  'nl',
  'pl',
  'pt',
  'ro',
  'ru',
  'sv',
  'tr',
  'vi',
  'zh',
];

export default REGIONS;

export const DEFAULT_REGIONS = (navigator.languages || [navigator.language])
  .map((lang) => lang.split('-')[0].toLowerCase())
  .filter(
    (lang, i, list) => REGIONS.includes(lang) && list.indexOf(lang) === i,
  );
