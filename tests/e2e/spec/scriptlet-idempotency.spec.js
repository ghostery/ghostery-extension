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

function waitForGlobal(key) {
  return browser.waitUntil(async () => (await readGlobal(key)) === 1, {
    timeout: 10000,
    timeoutMsg: `scriptlet "${key}" did not run exactly once`,
  });
}

async function expectRanExactlyOnce(key) {
  await waitForGlobal(key);

  // Give any further overlapping triggers a chance to (incorrectly) run again.
  await browser.pause(500);
  await expect(await readGlobal(key)).toBe(1);
}

// Firefox's `contentScripts.register` only affects future document loads; reload until active.
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

// `__e2e-inc` is the debug-build-only counting scriptlet from scripts/utils/scriptlets-module.js.
describe('Scriptlet injection idempotency', function () {
  before(enableExtension);
  before(async () => {
    await setCustomFilters([`${PAGE_DOMAIN}##+js(__e2e-inc, counter)`]);
    await ensureScriptletActive('counter');
  });

  after(disableCustomFilters);

  it('injects a scriptlet exactly once per document, including after reload', async function () {
    await browser.url(PAGE_URL);
    await expectRanExactlyOnce('counter');

    await browser.refresh();
    await expectRanExactlyOnce('counter');
  });

  it('keeps a separate registry per frame', async function () {
    await browser.url(PAGE_URL);
    await waitForGlobal('counter');

    await switchFrame($('#iframe-static'));
    await expectRanExactlyOnce('counter');

    await browser.switchFrame(null);
  });

  it('treats different scriptlet args as distinct injections', async function () {
    await setCustomFilters([
      `${PAGE_DOMAIN}##+js(__e2e-inc, a)`,
      `${PAGE_DOMAIN}##+js(__e2e-inc, b)`,
    ]);
    await ensureScriptletActive('a');

    await browser.url(PAGE_URL);
    await expectRanExactlyOnce('a');
    await expectRanExactlyOnce('b');
  });
});
