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
import { browser, expect, $ } from '@wdio/globals';
import {
  enableExtension,
  setCustomFilters,
  disableCustomFilters,
  switchFrame,
  PAGE_DOMAIN,
  PAGE_URL,
} from '../utils.js';

function readGlobal(key) {
  return browser.execute((k) => window[k], key);
}

function waitForGlobal(key, timeoutMsg) {
  return browser.waitUntil(async () => (await readGlobal(key)) === 1, {
    timeout: 10000,
    timeoutMsg,
  });
}

async function expectRanExactlyOnce(key, timeoutMsg) {
  await waitForGlobal(key, timeoutMsg);

  // Give any further overlapping triggers a chance to (incorrectly) run again.
  await browser.pause(500);
  await expect(await readGlobal(key)).toBe(1);
}

// Firefox's `contentScripts.register` only affects future document loads, so the
// first visit after (re)registration can miss the scriptlet; reload until it is
// active. On Chromium the first load already injects.
async function ensureScriptletActive(key) {
  await browser.waitUntil(
    async () => {
      await browser.url(PAGE_URL);
      await browser.pause(300);
      return (await readGlobal(key)) >= 1;
    },
    { timeout: 20000, interval: 500, timeoutMsg: `scriptlet "${key}" never became active` },
  );
}

// Uses the debug-build-only `__e2e-inc` counting scriptlet (see
// scripts/utils/scriptlets-module.js); it bumps `window[args[0]]` in the MAIN world.
describe('Scriptlet injection idempotency', function () {
  before(enableExtension);
  before(async () => {
    await setCustomFilters([`${PAGE_DOMAIN}##+js(__e2e-inc, counter)`]);
    await ensureScriptletActive('counter');
  });

  after(disableCustomFilters);

  it('injects a scriptlet exactly once under natural triggers', async function () {
    await browser.url(PAGE_URL);

    await expectRanExactlyOnce('counter', 'scriptlet did not run exactly once');
  });

  it('re-runs once on reload (self-heals with the new document)', async function () {
    await browser.url(PAGE_URL);
    await waitForGlobal('counter', 'scriptlet did not run on first load');

    await browser.refresh();

    await expectRanExactlyOnce('counter', 'scriptlet did not run exactly once after reload');
  });

  it('keeps a separate registry per frame', async function () {
    await browser.url(PAGE_URL);
    await waitForGlobal('counter', 'scriptlet did not run in the main frame');

    await switchFrame($('#iframe-static'));

    await expectRanExactlyOnce('counter', 'scriptlet did not run exactly once in the sub-frame');

    await browser.switchFrame(null);
  });

  it('treats different scriptlet args as distinct injections', async function () {
    await setCustomFilters([
      `${PAGE_DOMAIN}##+js(__e2e-inc, a)`,
      `${PAGE_DOMAIN}##+js(__e2e-inc, b)`,
    ]);
    await ensureScriptletActive('a');

    await browser.url(PAGE_URL);

    await expectRanExactlyOnce('a', 'scriptlet with arg "a" did not run once');
    await expectRanExactlyOnce('b', 'scriptlet with arg "b" did not run once');
  });
});
