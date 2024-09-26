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

const SUPPORTED_LANGUAGES = new Set([
  'de',
  'en',
  'es',
  'fr',
  'hu',
  'it',
  'ja',
  'ko',
  'nl',
  'pl',
  'pt_BR',
  'ru',
  'zh_CN',
  'zh_TW',
]);

export default function getDefaultLanguage() {
  let lang = navigator.language.replace('-', '_');

  if (SUPPORTED_LANGUAGES.has(lang)) {
    return lang;
  }

  lang = lang.slice(0, 2);

  if (SUPPORTED_LANGUAGES.has(lang)) {
    return lang;
  }

  return 'en';
}
