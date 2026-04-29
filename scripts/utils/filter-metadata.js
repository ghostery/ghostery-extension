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
 * Returns true if the preprocessor expression always evaluates to `true`
 * across every combination of supported envs. Expressions that depend on
 * supported envs (yielding both true and false) or that are constantly
 * false return `false`.
 */
function alwaysTrueForSupportedEnvs(expression) {
  const ids = extractSupportedIdentifiers(expression);
  if (ids.length === 0) {
    return evaluatePreprocessor(expression, new Map()) === true;
  }

  const combinations = 1 << ids.length;
  for (let mask = 0; mask < combinations; mask++) {
    const env = new Map();
    ids.forEach((key, i) => {
      env.set(key, !!(mask & (1 << i)));
    });
    if (evaluatePreprocessor(expression, env) !== true) {
      return false;
    }
  }
  return true;
}

/**
 * Filters out metadata entries whose preprocessor always resolves to `true`
 * regardless of the value of supported envs. Such preprocessors are
 * redundant because the rules they describe will always apply, so the
 * metadata entry carries no useful runtime information.
 *
 * @param {Record<string, { preprocessor?: string }>} metadata
 * @returns {Record<string, { preprocessor?: string }>}
 */
export function filterMetadata(metadata) {
  const filtered = {};
  for (const [id, entry] of Object.entries(metadata)) {
    if (entry.preprocessor && alwaysTrueForSupportedEnvs(entry.preprocessor)) {
      continue;
    }
    filtered[id] = entry;
  }
  return filtered;
}
