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

function readMarker(id) {
  return browser.execute((el) => document.getElementById(el)?.textContent, id);
}

async function expectRanExactlyOnce(id, expected) {
  try {
    await browser.waitUntil(async () => (await readMarker(id)) === expected, {
      timeout: 10000,
    });
  } catch {
    throw new Error(
      `marker "${id}" was not rewritten exactly once: ${JSON.stringify(await readMarker(id))}`,
    );
  }

  // Give any further overlapping triggers a chance to (incorrectly) run again.
  await browser.pause(500);
  await expect(await readMarker(id)).toBe(expected);
}

// Custom filter updates reach the engine asynchronously; reload until the scriptlet is live.
async function ensureScriptletActive() {
  await browser.waitUntil(
    async () => {
      await browser.url(PAGE_URL);
      await browser.pause(300);
      return ((await readMarker('rpnt-a')) || '').includes('+');
    },
    { timeout: 20000, interval: 500, timeoutMsg: 'scriptlet never became active' },
  );
}

// `rpnt` rewrites matching text on every execution, so a duplicate run is DOM-visible ("aaa++").
describe('Scriptlet injection idempotency', function () {
  before(enableExtension);
  before(async () => {
    await setCustomFilters([
      `${PAGE_DOMAIN}##+js(rpnt, rpnt-marker, aaa, aaa+)`,
      `${PAGE_DOMAIN}##+js(rpnt, rpnt-marker, bbb, bbb+)`,
    ]);
    await ensureScriptletActive();
  });

  after(disableCustomFilters);

  it('injects each scriptlet and argument set exactly once per document, including after reload', async function () {
    await browser.url(PAGE_URL);
    await expectRanExactlyOnce('rpnt-a', 'aaa+');
    await expectRanExactlyOnce('rpnt-b', 'bbb+');

    await browser.refresh();
    await expectRanExactlyOnce('rpnt-a', 'aaa+');
  });

  it('keeps a separate registry per frame', async function () {
    await browser.url(PAGE_URL);
    await expectRanExactlyOnce('rpnt-a', 'aaa+');

    await switchFrame($('#iframe-static'));
    await expectRanExactlyOnce('rpnt-a', 'aaa+');

    await browser.switchFrame(null);
  });
});
