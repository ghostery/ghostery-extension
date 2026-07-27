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
  setUserScriptsAllowed,
  isUserScriptsPathActive,
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

// A duplicate run compounds into a visible "++": `rpnt` (ISOLATED) rewrites DOM text, and
// `trusted-replace-outbound-text` (MAIN) rewrites the page's own `JSON.stringify` output.
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

  it('injects a MAIN-world scriptlet exactly once into local frames (about:blank, srcdoc)', async function () {
    await browser.url(PAGE_URL);
    await expectMainWorldRanExactlyOnce();

    await browser.execute(() => {
      const blank = document.createElement('iframe');
      blank.id = 'iframe-blank';
      document.body.appendChild(blank);

      const srcdoc = document.createElement('iframe');
      srcdoc.id = 'iframe-srcdoc';
      srcdoc.srcdoc = '<p>local</p>';
      document.body.appendChild(srcdoc);
    });

    for (const id of ['iframe-blank', 'iframe-srcdoc']) {
      await switchFrame($(`#${id}`));
      await expectMainWorldRanExactlyOnce();
    }

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

  describe('via the legacy injection path', function () {
    before(async function () {
      if (browser.isChromium) {
        await setUserScriptsAllowed(false);
        await ensureScriptletActive();
        await expect(await isUserScriptsPathActive()).toBe(false);
      }
    });

    idempotencyChecks();
  });

  describe('via chrome.userScripts', function () {
    before(async function () {
      if (!browser.isChromium) this.skip();

      await setUserScriptsAllowed(true);
      await ensureScriptletActive();
      await expect(await isUserScriptsPathActive()).toBe(true);
    });

    after(async function () {
      if (browser.isChromium) await setUserScriptsAllowed(false);
    });

    idempotencyChecks();
  });
});
