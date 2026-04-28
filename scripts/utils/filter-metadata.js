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

// Set globals for `utils/preprocessors.js`
globalThis.__FIREFOX__ ??= true;
globalThis.__CHROMIUM__ ??= false;

const { ENV } = await import('../../src/utils/preprocessors.js');

function isConditionAlwaysTrue(condition, target) {
  // If the condition doesn't include target, it means we don't have any
  // other factors to judge the condition.
  if (condition.includes(target) === false) {
    return evaluatePreprocessor(condition, ENV);
  }

  // Do negative test against target, so we can know it actually affects
  // the resulting logical gate.
  const re = new RegExp(`(env_)?${target}[a-z_]*`, 'gi');
  return (
    evaluatePreprocessor(condition.replace(re, 'true'), ENV) === false &&
    evaluatePreprocessor(condition, ENV) === true
  );
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
      return (
        !isConditionAlwaysTrue(preprocessor, 'adguard') &&
        !isConditionAlwaysTrue(preprocessor, 'firefox')
      );
    }),
  );
}
