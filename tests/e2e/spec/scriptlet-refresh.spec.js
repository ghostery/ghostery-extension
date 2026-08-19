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
  enableExtension,
  getExtensionElement,
  waitForIdleBackgroundTasks,
  setCustomFilters,
  disableCustomFilters,
  setUserScriptsAllowed,
  setPrivacyToggle,
  isUserScriptsPathActive,
  getUserScriptsRegistrations,
  reloadUntilActive,
  PAGE_DOMAIN,
  PAGE_URL,
} from '../utils.js';

function readMarker(id) {
  return browser.execute((el) => document.getElementById(el)?.textContent, id);
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

if (browser.isChromium) {
  describe('Scriptlet registration refresh', function () {
    before(enableExtension);

    before(async function () {
      await setCustomFilters([`${PAGE_DOMAIN}##+js(rpnt, rpnt-marker, aaa, aaa+)`]);

      await setUserScriptsAllowed(true);
      await expect(await isUserScriptsPathActive()).toBe(true);
      await reloadUntilActive(async () => (await readMarker('rpnt-a')) === 'aaa+');
    });

    after(async function () {
      await setUserScriptsAllowed(false);
      await disableCustomFilters();
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
}
