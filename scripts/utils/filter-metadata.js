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

import { evaluatePreprocessor } from '@ghostery/adblocker';

const truthyIdentifiers = [
  'ext_ghostery',
  'ext_ublock',
  'env_mv3',
  'ext_ubol',
  'cap_user_stylesheet',
  'env_chromium',
  'adguard_ext_chromium',
  'adguard_ext_opera',
];
const staleIdentifiers = ['env_edge', 'env_safari', 'env_mobile'];

const env = new Map(
  truthyIdentifiers.map(function (identifier) {
    return [identifier, true];
  }),
);

function isConditionAlwaysTrue(condition) {
  for (let i = 0; i < 1 << staleIdentifiers.length; i++) {
    for (let k = 0; k < staleIdentifiers.length; k++) {
      env.set(staleIdentifiers[k], !!(i & (1 << k)));
    }

    if (evaluatePreprocessor(condition, env) === false) {
      return false;
    }
  }

  return true;
}

/**
 * Filters out metadata entries whose preprocessor references unsupported
 * envs in a way that makes the result constant. Such entries cannot be
 * meaningfully evaluated at runtime, so the rules they describe will always
 * either apply or never apply regardless of the environment.
 *
 * @param {Record<string, { preprocessor?: string }>} metadata
 * @returns {Record<string, { preprocessor?: string }>}
 */
export function filterMetadata(metadata) {
  return Object.fromEntries(
    Object.entries(metadata).filter(function ([, { preprocessor }]) {
      return isConditionAlwaysTrue(preprocessor) === false;
    }),
  );
}
