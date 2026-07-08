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
  setCustomFilters,
  disableCustomFilters,
  setUserScriptsAllowed,
  isUserScriptsPathActive,
  PAGE_DOMAIN,
  PAGE_PORT,
  PAGE_URL,
  SUBPAGE_URL,
} from '../utils.js';

// A different registrable domain than PAGE_DOMAIN — a genuinely cross-origin, cross-site child.
const CROSS_ORIGIN_PROBE_URL = `${SUBPAGE_URL}subframe-probe.html`;
// Same origin as the top frame.
const SAME_ORIGIN_PROBE_URL = `${PAGE_URL}subframe-probe.html`;
// A subdomain of PAGE_DOMAIN (same registrable domain): both the parent-domain registration and
// the subdomain's own registration match it, which is where the historical double-injection lived.
const SUBDOMAIN_PROBE_URL = `http://sub.${PAGE_DOMAIN}:${PAGE_PORT}/subframe-probe.html`;

// Embeds a child frame and returns what the probe reports back over postMessage. Scriptlets can
// land a beat after the frame parses, so the probe posts repeatedly and we keep every value seen.
function probeSubframe(src, windowMs = 3500) {
  return browser.executeAsync(
    (src, windowMs, done) => {
      const result = { received: false, subframeScriptlet: false, markers: [] };

      function onMessage(event) {
        const data = event && event.data;
        if (!data || data.__subframeProbe !== true) return;

        result.received = true;
        if (data.subframeScriptlet === true) result.subframeScriptlet = true;
        if (data.stringifyMarker != null) result.markers.push(data.stringifyMarker);
      }

      window.addEventListener('message', onMessage);

      const iframe = document.createElement('iframe');
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      iframe.style.opacity = '0';
      iframe.src = src;
      document.body.appendChild(iframe);

      setTimeout(() => {
        window.removeEventListener('message', onMessage);
        iframe.remove();
        done(result);
      }, windowMs);
    },
    src,
    windowMs,
  );
}

// Custom filter updates reach the engine asynchronously; reload until the direct-domain scriptlet
// (which runs on the top frame) is live before asserting on the subframe behavior.
async function ensureFiltersActive() {
  await browser.waitUntil(
    async () => {
      await browser.url(PAGE_URL);
      await browser.pause(300);
      return browser.execute(() => JSON.parse(JSON.stringify({ marker: 'aaa' })).marker === 'aaa+');
    },
    { timeout: 20000, interval: 500, timeoutMsg: 'scriptlet never became active' },
  );
}

function subframeChecks() {
  it('injects a subframe (>>) scriptlet into a cross-origin child frame', async function () {
    await browser.url(PAGE_URL);

    const report = await probeSubframe(CROSS_ORIGIN_PROBE_URL);

    await expect(report.received).toBe(true);
    await expect(report.subframeScriptlet).toBe(true);
  });

  it('injects a subframe (>>) scriptlet into a same-origin child frame', async function () {
    await browser.url(PAGE_URL);

    const report = await probeSubframe(SAME_ORIGIN_PROBE_URL);

    await expect(report.subframeScriptlet).toBe(true);
  });

  it('does not inject a subframe (>>) scriptlet into the top frame', async function () {
    await browser.url(PAGE_URL);
    // Give any (incorrect) top-frame injection a chance to land before asserting its absence.
    await browser.pause(500);

    const topInjected = await browser.execute(() => window.__ghostery_subframe__ === true);

    await expect(topInjected).toBe(false);
  });

  it('injects a direct-domain scriptlet exactly once into a subdomain child frame', async function () {
    await browser.url(PAGE_URL);

    const report = await probeSubframe(SUBDOMAIN_PROBE_URL);

    // A single injection wraps JSON.stringify once ("aaa+"); a duplicate would show "aaa++".
    await expect(report.markers).toContain('aaa+');
    await expect(report.markers.some((marker) => (marker || '').includes('++'))).toBe(false);
  });
}

describe('Subframe scriptlet injection', function () {
  before(enableExtension);
  before(async () => {
    await setCustomFilters([
      `${PAGE_DOMAIN}>>##+js(set, __ghostery_subframe__, true)`,
      `${PAGE_DOMAIN}##+js(trusted-replace-outbound-text, JSON.stringify, aaa, aaa+)`,
    ]);
    await ensureFiltersActive();
  });

  after(disableCustomFilters);

  describe('via the legacy injection path', function () {
    before(async function () {
      if (browser.isChromium) {
        await setUserScriptsAllowed(false);
        await ensureFiltersActive();
        await expect(await isUserScriptsPathActive()).toBe(false);
      }
    });

    subframeChecks();
  });

  describe('via chrome.userScripts', function () {
    before(async function () {
      if (!browser.isChromium) this.skip();

      await setUserScriptsAllowed(true);
      await ensureFiltersActive();
      await expect(await isUserScriptsPathActive()).toBe(true);
    });

    after(async function () {
      if (browser.isChromium) await setUserScriptsAllowed(false);
    });

    subframeChecks();
  });
});
