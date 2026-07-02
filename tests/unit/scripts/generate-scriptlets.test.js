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
  it('emits a wrapped, importable module with every scriptlet preserved', async () => {
    const { default: generated } = await generatedPromise;

    assert.deepEqual(Object.keys(generated).sort(), Object.keys(scriptlets).sort());

    for (const [name, entry] of Object.entries(generated)) {
      assert.equal(typeof entry.func, 'function', `func missing for ${name}`);
      // the wrapped body must be valid JS for executeScript / the FF content script string
      new Function(`return (${entry.func.toString()});`)();
    }
  });

  it('preserves aliases, world and requiresTrust metadata', async () => {
    const { default: generated } = await generatedPromise;

    for (const [name, entry] of Object.entries(scriptlets)) {
      assert.deepEqual(generated[name].aliases, entry.aliases, `aliases for ${name}`);
      assert.equal(generated[name].world, entry.world, `world for ${name}`);
      assert.equal(generated[name].requiresTrust, entry.requiresTrust, `requiresTrust for ${name}`);
    }
  });

  it('includes the synthetic test scriptlet only in debug builds', async () => {
    const { default: debugBuild } = await evaluateModule(
      generateScriptletsModule(FIXTURE, { debug: true }),
    );
    const { default: releaseBuild } = await generatedPromise;

    assert.equal(typeof debugBuild[TEST_SCRIPTLET_NAME].func, 'function');
    assert.equal(releaseBuild[TEST_SCRIPTLET_NAME], undefined);
  });

  it('fails loudly when an upstream entry is not a function', () => {
    assert.throws(
      () => generateScriptletsModule({ 'broken.js': { aliases: [], func: 'not-a-function' } }),
      /expected "func" to be a function/,
    );
  });

  it('emits per-scriptlet error logging only in debug builds', () => {
    const debugModule = generateScriptletsModule(FIXTURE, { debug: true });
    const releaseModule = generateScriptletsModule(FIXTURE);

    assert.match(debugModule, /console\.error\("\[adblocker\] noop\.js failed:", e\)/);
    assert.doesNotMatch(releaseModule, /console\.error/);
  });
});
