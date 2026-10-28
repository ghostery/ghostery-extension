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
import { browser, expect } from '@wdio/globals';
import {
  setupExtension,
  getExtensionElement,
  waitForIdleBackgroundTasks,
  setCustomFilters,
  disableCustomFilters,
  setUserScriptsAllowed,
  setPrivacyToggle,
  isUserScriptsPathActive,
  getUserScriptsRegistrations,
  reloadUntilActive,
  getFrame,
  PAGE_DOMAIN,
  PAGE_URL,
} from '../utils.js';

function readMarker(id, context = browser) {
  return context.execute((el) => document.getElementById(el)?.textContent, id);
}

// Registrations persist in the browser, so a filter change must drop them without
// any page navigation — navigating first would let the per-navigation cleanup
// unregister the hostname and mask a missing engine-change refresh.
async function waitForRegistrationDrop() {
  await browser.url('ghostery:panel');
  await browser.waitUntil(
    async () => {
      const ids = await getUserScriptsRegistrations();
      return !ids.some((id) => id.includes(PAGE_DOMAIN));
    },
    {
      timeout: 10000,
      timeoutMsg: 'stale scriptlet registration was not dropped after the filters changed',
    },
  );
}

async function expectRanExactlyOnce(id, expected, context = browser) {
  try {
    await browser.waitUntil(async () => (await readMarker(id, context)) === expected, {
      timeout: 5000,
    });
  } catch {
    throw new Error(
      `marker "${id}" was not rewritten exactly once: ${JSON.stringify(await readMarker(id, context))}`,
    );
  }

  // Give any further overlapping triggers a chance to (incorrectly) run again.
  await browser.pause(500);
  await expect(await readMarker(id, context)).toBe(expected);
}

// A MAIN-world-only wrap of the page's `JSON.stringify`; each extra wrap adds a `+` ("aaa++").
function readStringifyMarker(context = browser) {
  return context.execute(() => JSON.parse(JSON.stringify({ marker: 'aaa' })).marker);
}

async function expectMainWorldRanExactlyOnce(context = browser) {
  try {
    await browser.waitUntil(async () => (await readStringifyMarker(context)) === 'aaa+', {
      timeout: 5000,
    });
  } catch {
    throw new Error(
      `MAIN-world scriptlet did not wrap JSON.stringify exactly once: ${JSON.stringify(await readStringifyMarker(context))}`,
    );
  }

  // Give any further overlapping triggers a chance to (incorrectly) run again.
  await browser.pause(500);
  await expect(await readStringifyMarker(context)).toBe('aaa+');
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

    await expectRanExactlyOnce('rpnt-a', 'aaa+', await getFrame('#iframe-static'));
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

    await expectMainWorldRanExactlyOnce(await getFrame('#iframe-static'));
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
      await expectMainWorldRanExactlyOnce(await getFrame(`#${id}`));
    }
  });
}

describe('Scriptlet injection idempotency', function () {
  before(setupExtension);
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

    // Nested to share the "Allow user scripts" setup, as switching it reloads the extension
    describe('Scriptlet registration refresh', function () {
      before(async function () {
        await setCustomFilters([`${PAGE_DOMAIN}##+js(rpnt, rpnt-marker, aaa, aaa+)`]);

        // The "bbb" filter of the idempotency checks must be gone as well
        await reloadUntilActive(
          async () =>
            (await readMarker('rpnt-a')) === 'aaa+' && (await readMarker('rpnt-b')) === 'bbb',
        );
      });

      it('stops injecting a scriptlet on the first load after its filter is replaced', async function () {
        await setCustomFilters([`${PAGE_DOMAIN}##+js(rpnt, rpnt-marker, bbb, bbb+)`]);
        await waitForRegistrationDrop();

        await browser.url(PAGE_URL);
        await browser.pause(500);
        await expect(await readMarker('rpnt-a')).toBe('aaa');
      });

      it('injects the replacement scriptlet after the registration refresh', async function () {
        await reloadUntilActive(
          async () => (await readMarker('rpnt-b')) === 'bbb+',
          'the replacement scriptlet never became active',
        );
        await expect(await readMarker('rpnt-a')).toBe('aaa');
      });

      it('stops injecting scriptlets on the first load after the site is paused', async function () {
        await browser.url(PAGE_URL);
        await browser.url('ghostery:panel');
        await getExtensionElement('button:pause').click();
        await waitForIdleBackgroundTasks();
        await waitForRegistrationDrop();

        await browser.url(PAGE_URL);
        await browser.pause(500);
        await expect(await readMarker('rpnt-b')).toBe('bbb');

        await browser.url('ghostery:panel');
        await getExtensionElement('button:resume').click();
        await waitForIdleBackgroundTasks();

        await reloadUntilActive(
          async () => (await readMarker('rpnt-b')) === 'bbb+',
          'the scriptlet did not resume after unpausing',
        );
      });

      it('stops injecting scriptlets on the first load after a global pause', async function () {
        await setPrivacyToggle('global-pause', true);

        try {
          await waitForRegistrationDrop();

          await browser.url(PAGE_URL);
          await browser.pause(500);
          await expect(await readMarker('rpnt-b')).toBe('bbb');
        } finally {
          // A leaked global pause would disable filtering for every test that follows.
          await setPrivacyToggle('global-pause', false);
        }

        await reloadUntilActive(
          async () => (await readMarker('rpnt-b')) === 'bbb+',
          'the scriptlet did not resume after the global pause was lifted',
        );
      });

      it('stops injecting scriptlets on the first load after their filters are removed', async function () {
        await setCustomFilters([]);
        await waitForRegistrationDrop();

        await browser.url(PAGE_URL);
        await browser.pause(500);
        await expect(await readMarker('rpnt-a')).toBe('aaa');
        await expect(await readMarker('rpnt-b')).toBe('bbb');
      });
    });
  });
});
