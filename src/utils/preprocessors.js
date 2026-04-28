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

import { isEdge, isSafari } from './browser-info.js';

function checkUserAgent(pattern) {
  return navigator.userAgent.indexOf(pattern) !== -1;
}

/**
 * Environment variables for preprocessor evaluation. These define which
 * environment identifiers the extension supports and their current values.
 * This map is the source of truth for all supported preprocessor envs.
 */
export const ENV = new Map([
  ['ext_ghostery', true],
  ['ext_ublock', true],
  ['env_mv3', __CHROMIUM__],
  ['ext_ubol', __FIREFOX__],
  ['cap_html_filtering', __FIREFOX__],
  // TODO: Can be removed once $replace support is sufficiently distributed
  ['cap_replace_modifier', __FIREFOX__],
  ['cap_user_stylesheet', true],
  ['env_firefox', __FIREFOX__],
  ['env_chromium', __CHROMIUM__],
  ['env_edge', __CHROMIUM__ && isEdge()],
  ['env_safari', __CHROMIUM__ && isSafari()],
  ['env_mobile', checkUserAgent('Mobile')],
]);
