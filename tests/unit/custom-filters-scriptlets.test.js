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
import { Config, FiltersEngine, parseFilters } from '@ghostery/adblocker';
import { xxh32d64 } from 'minixxh/xxh32d64';

import { encodeScriptletFilters } from '../../src/background/custom-filters/scriptlets.js';

// Filters are parsed in debug mode to keep raw lines, while engines use the config
// of the engines shipped from the CDN, as in the extension
const parseConfig = new Config({ debug: true, loadPreprocessors: true });
const engineConfig = new Config({ loadPreprocessors: true });

// Lists shipped from the CDN carry percent-encoded arguments
const CDN_LIST = [
  'example.com##+js(trusted-set-cookie, consent, %7B%22a%22%3A1%7D)',
  'example.com##+js(set, foo, bar)',
].join('\n');

function createEngine(text, { custom = false } = {}) {
  const { networkFilters, cosmeticFilters, preprocessors } = parseFilters(text, parseConfig);

  return new FiltersEngine({
    networkFilters,
    cosmeticFilters: custom
      ? encodeScriptletFilters(cosmeticFilters, preprocessors)
      : cosmeticFilters,
    preprocessors,
    config: engineConfig,
  });
}

function createCustomEngine(lines) {
  return createEngine(lines.join('\n'), { custom: true });
}

// Mirrors how the extension composes the main engine
function merge(...engines) {
  return FiltersEngine.merge(engines, {
    skipResources: true,
    useBinaryMerge: true,
    hashFunc: xxh32d64,
  });
}

function matchScriptlets(engine, hostname = 'example.com') {
  const { matches } = engine.matchCosmeticFilters({
    domain: hostname,
    hostname,
    url: `https://${hostname}/`,
    classes: [],
    hrefs: [],
    ids: [],
    getInjectionRules: true,
    getExtendedRules: true,
    getRulesFromHostname: true,
    getPureHasRules: true,
    getRulesFromDOM: false,
  });

  return matches
    .filter(({ filter }) => filter?.isScriptInject())
    .map(({ filter, exception }) => ({
      selector: filter.getSelector(),
      args: filter.parseScript().args.map((arg) => decodeURIComponent(arg)),
      excepted: exception !== undefined,
    }));
}

function find(scriptlets, name) {
  return scriptlets.find(({ selector }) => selector.startsWith(`${name},`));
}

describe('custom filters scriptlet encoding', () => {
  it('keeps arguments written in the list syntax literal at injection', () => {
    const engine = createCustomEngine([
      'example.com##+js(rpnt, h1, Test Page, 100%\\, escaped)',
      'example.com##+js(set-cookie, consent, %22yes%22)',
      'example.com##+js(set, foo, bar)',
    ]);
    const scriptlets = matchScriptlets(engine);

    assert.deepEqual(find(scriptlets, 'rpnt').args, ['h1', 'Test Page', '100%, escaped']);
    assert.deepEqual(find(scriptlets, 'set-cookie').args, ['consent', '%22yes%22']);
    assert.equal(find(scriptlets, 'set').selector, 'set, foo, bar');
  });

  it('stores injections the same way as lists shipped from the CDN', () => {
    const engine = createCustomEngine(['example.com##+js(trusted-set-cookie, consent, {"a":1})']);

    assert.deepEqual(
      engine.getFilters().cosmeticFilters.map((filter) => filter.getSelector()),
      ['trusted-set-cookie, consent, %7B%22a%22%3A1%7D'],
    );
  });

  it('cancels a CDN injection with an exception copied from the logger', () => {
    const engine = merge(
      createEngine(CDN_LIST),
      createCustomEngine(['example.com#@#+js(trusted-set-cookie, consent, %7B%22a%22%3A1%7D)']),
    );
    const scriptlets = matchScriptlets(engine);

    assert.equal(find(scriptlets, 'trusted-set-cookie').excepted, true);
    assert.equal(find(scriptlets, 'set').excepted, false);
  });

  it('cancels a CDN injection with an exception written in the list syntax', () => {
    const engine = merge(
      createEngine(CDN_LIST),
      createCustomEngine(['example.com#@#+js(trusted-set-cookie, consent, {"a":1})']),
    );
    const scriptlets = matchScriptlets(engine);

    assert.equal(find(scriptlets, 'trusted-set-cookie').excepted, true);
    assert.equal(find(scriptlets, 'set').excepted, false);
  });

  it('cancels a custom injection with an exception in either form', () => {
    for (const exception of [
      'example.com#@#+js(set, foo, b/c)',
      'example.com#@#+js(set, foo, b%2Fc)',
    ]) {
      const engine = createCustomEngine([
        'example.com##+js(set, foo, b/c)',
        'example.com##+js(set, bar, b/c)',
        exception,
      ]);
      const scriptlets = matchScriptlets(engine);

      assert.equal(find(scriptlets, 'set, foo').excepted, true, exception);
      assert.equal(find(scriptlets, 'set, bar').excepted, false, exception);
    }
  });

  it('cancels every injection with an empty exception', () => {
    const engine = createCustomEngine(['example.com##+js(set, foo, b/c)', 'example.com#@#+js()']);

    assert.equal(find(matchScriptlets(engine), 'set').excepted, true);
  });

  it('keeps the exception under its preprocessor condition', () => {
    const engine = createCustomEngine([
      'example.com##+js(set, foo, b/c)',
      '!#if env_test',
      'example.com#@#+js(set, foo, b/c)',
      '!#endif',
    ]);

    engine.updateEnv(new Map([['env_test', false]]));
    assert.equal(find(matchScriptlets(engine), 'set').excepted, false);

    engine.updateEnv(new Map([['env_test', true]]));
    assert.equal(find(matchScriptlets(engine), 'set').excepted, true);
  });

  it('survives the persisted engine round trip', () => {
    const engine = createCustomEngine([
      'example.com##+js(set, foo, b/c)',
      'example.com#@#+js(set, foo, b/c)',
    ]);
    const restored = FiltersEngine.deserialize(engine.serialize());

    assert.equal(find(matchScriptlets(restored), 'set').excepted, true);
  });
});
