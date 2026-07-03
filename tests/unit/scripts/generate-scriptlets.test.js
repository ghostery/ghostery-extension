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

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import scriptlets from '@ghostery/scriptlets';
import {
  generateScriptletsModule,
  TEST_SCRIPTLET_NAME,
} from '../../../scripts/utils/scriptlets-module.js';

function evaluateModule(source) {
  return import('data:text/javascript,' + encodeURIComponent(source));
}

const FIXTURE = { 'noop.js': { aliases: [], func: function () {} } };

const generatedPromise = evaluateModule(generateScriptletsModule(scriptlets));

describe('generate-scriptlets', () => {
  it('emits an importable module preserving every name, alias and world', async () => {
    const { default: generated } = await generatedPromise;

    assert.deepEqual(Object.keys(generated).sort(), Object.keys(scriptlets).sort());

    for (const [name, entry] of Object.entries(scriptlets)) {
      assert.equal(typeof generated[name].func, 'function', `func for ${name}`);
      assert.equal(generated[name].world, entry.world, `world for ${name}`);
    }
  });

  it('adds the test scriptlet and error logging only in debug builds', async () => {
    const debugModule = generateScriptletsModule(FIXTURE, { debug: true });
    const { default: debugBuild } = await evaluateModule(debugModule);
    const { default: releaseBuild } = await generatedPromise;

    assert.equal(typeof debugBuild[TEST_SCRIPTLET_NAME].func, 'function');
    assert.equal(releaseBuild[TEST_SCRIPTLET_NAME], undefined);
    assert.match(debugModule, /console\.error\("\[adblocker\] noop\.js failed:", e\)/);
    assert.doesNotMatch(generateScriptletsModule(FIXTURE), /console\.error/);
  });

  it('fails loudly when an upstream entry is not a function', () => {
    assert.throws(
      () => generateScriptletsModule({ 'broken.js': { aliases: [], func: 'not-a-function' } }),
      /expected "func" to be a function/,
    );
  });
});
