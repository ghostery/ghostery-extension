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
  describeInjectionPaths,
  reloadUntilActive,
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
      timeout: 5000,
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

// A MAIN-world-only wrap of the page's `JSON.stringify`; each extra wrap adds a `+` ("aaa++").
function readStringifyMarker() {
  return browser.execute(() => JSON.parse(JSON.stringify({ marker: 'aaa' })).marker);
}

async function expectMainWorldRanExactlyOnce() {
  try {
    await browser.waitUntil(async () => (await readStringifyMarker()) === 'aaa+', {
      timeout: 5000,
    });
  } catch {
    throw new Error(
      `MAIN-world scriptlet did not wrap JSON.stringify exactly once: ${JSON.stringify(await readStringifyMarker())}`,
    );
  }

  // Give any further overlapping triggers a chance to (incorrectly) run again.
  await browser.pause(500);
  await expect(await readStringifyMarker()).toBe('aaa+');
}

const ensureScriptletActive = () =>
  reloadUntilActive(async () => ((await readMarker('rpnt-a')) || '').includes('+'));

// A duplicate run would compound into a visible "++", so these markers catch double injection.
function idempotencyChecks() {
  it('injects each scriptlet and argument set exactly once per document, including after reload', async function () {
    await browser.url(PAGE_URL);
    await expectRanExactlyOnce('rpnt-a', 'aaa+');
    await expectRanExactlyOnce('rpnt-b', 'bbb+');

    await browser.refresh();
    await expectRanExactlyOnce('rpnt-a', 'aaa+');
    await expectRanExactlyOnce('rpnt-b', 'bbb+');
  });

  it('keeps a separate registry per frame', async function () {
    await browser.url(PAGE_URL);
    await expectRanExactlyOnce('rpnt-a', 'aaa+');

    await switchFrame($('#iframe-static'));
    await expectRanExactlyOnce('rpnt-a', 'aaa+');

    await browser.switchFrame(null);
  });

  it('injects a MAIN-world scriptlet exactly once per document, including after reload', async function () {
    await browser.url(PAGE_URL);
    await expectMainWorldRanExactlyOnce();

    await browser.refresh();
    await expectMainWorldRanExactlyOnce();
  });

  it('keeps a MAIN-world scriptlet idempotent per frame', async function () {
    await browser.url(PAGE_URL);
    await expectMainWorldRanExactlyOnce();

    await switchFrame($('#iframe-static'));
    await expectMainWorldRanExactlyOnce();

    await browser.switchFrame(null);
  });
}

describe('Scriptlet injection idempotency', function () {
  before(enableExtension);
  before(async () => {
    await setCustomFilters([
      `${PAGE_DOMAIN}##+js(rpnt, rpnt-marker, aaa, aaa+)`,
      `${PAGE_DOMAIN}##+js(rpnt, rpnt-marker, bbb, bbb+)`,
      `${PAGE_DOMAIN}##+js(trusted-replace-outbound-text, JSON.stringify, aaa, aaa+)`,
    ]);
    await ensureScriptletActive();
  });

  after(disableCustomFilters);

  describeInjectionPaths(ensureScriptletActive, idempotencyChecks);
});
