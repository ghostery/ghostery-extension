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

const SUPPORTED_ENVS = [...ENV.keys()];
const IDENTIFIER_RE = /[a-zA-Z0-9_]+/g;

function extractSupportedIdentifiers(expression) {
  const ids = expression.match(IDENTIFIER_RE) || [];
  return [...new Set(ids.filter((id) => SUPPORTED_ENVS.includes(id)))];
}

/**
 * Returns true if the preprocessor expression can yield different results
 * depending on the value of supported envs. If the result is constant
 * regardless of the environment (always true or always false), returns false.
 */
function dependsOnSupportedEnvs(expression) {
  const ids = extractSupportedIdentifiers(expression);
  if (ids.length === 0) {
    return false;
  }

  const combinations = 1 << ids.length;
  let firstResult;
  for (let mask = 0; mask < combinations; mask++) {
    const env = new Map();
    ids.forEach((key, i) => {
      env.set(key, !!(mask & (1 << i)));
    });
    const result = evaluatePreprocessor(expression, env);
    if (mask === 0) {
      firstResult = result;
    } else if (result !== firstResult) {
      return true;
    }
  }
  return false;
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
  const filtered = {};
  for (const [id, entry] of Object.entries(metadata)) {
    if (entry.preprocessor && !dependsOnSupportedEnvs(entry.preprocessor)) {
      continue;
    }
    filtered[id] = entry;
  }
  return filtered;
}
