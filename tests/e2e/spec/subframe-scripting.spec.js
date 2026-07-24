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
  reloadUntilActive,
  PAGE_DOMAIN,
  PAGE_PORT,
  PAGE_URL,
  SUBPAGE_URL,
} from '../utils.js';

const CROSS_ORIGIN_PROBE_URL = `${SUBPAGE_URL}subframe-probe.html`;
const SAME_ORIGIN_PROBE_URL = `${PAGE_URL}subframe-probe.html`;
const SUBDOMAIN_PROBE_URL = `http://sub.${PAGE_DOMAIN}:${PAGE_PORT}/subframe-probe.html`;

function probeSubframe(src, windowMs = 3000) {
  return browser.executeAsync(
    (src, windowMs, done) => {
      const markers = new Set();
      let subframeScriptlet = false;

      window.addEventListener('message', (event) => {
        if (!event.data || event.data.__subframeProbe !== true) return;
        if (event.data.subframeScriptlet) subframeScriptlet = true;
        if (event.data.marker != null) markers.add(event.data.marker);
      });

      const iframe = document.createElement('iframe');
      iframe.src = src;
      document.body.appendChild(iframe);

      setTimeout(() => done({ subframeScriptlet, markers: [...markers] }), windowMs);
    },
    src,
    windowMs,
  );
}

const ensureFiltersActive = () =>
  reloadUntilActive(() =>
    browser.execute(() => JSON.parse(JSON.stringify({ marker: 'aaa' })).marker === 'aaa+'),
  );

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

  it('injects a subframe (>>) scriptlet into a cross-origin child frame', async function () {
    await browser.url(PAGE_URL);

    const report = await probeSubframe(CROSS_ORIGIN_PROBE_URL);

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

    await expect(report.markers).toContain('aaa+');
    await expect(report.markers.some((marker) => marker.includes('++'))).toBe(false);
  });
});
