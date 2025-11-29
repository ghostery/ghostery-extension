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
  setPrivacyToggle,
  setCustomFilters,
} from '../utils.js';

import { PAGE_DOMAIN, PAGE_URL as baseUrl } from '../wdio.conf.js';

const PAGE_URL = baseUrl + 'adblocker/index.html';
const BROWSER_CONSTRAINT_FIREFOX = 1;
const BROWSER_CONSTRAINT_CHROMIUM = 2;

async function collectTestResults() {
  let result;
  for (let i = 0; i < 4; i++) {
    result = await browser.execute(() => {
      if (
        typeof suite === 'undefined' ||
        suite.collection.expected !== suite.collection.reports.length
      ) {
        return false;
      }
      return suite.collection.reports;
    });
    if (result === false) {
      await new Promise(function (resolve) {
        setTimeout(function () {
          resolve(null);
        }, 1000);
      });
    } else {
      return result;
    }
  }

  expect(result).not.toBe(false);

  return result;
}

describe.only('Adblocker Capabilities', function () {
  before(enableExtension);
  // Disable all community filters to ensure the pure adblocker capability
  // Community filters often ship generic hides to special hostnames like
  // localhost. However, still at least one engine is required to bring
  // redirect resources to the resulting engine.
  before(setPrivacyToggle('ad-blocking', false));
  // We will bring the never-consent engine, which will have minimum effect
  // to the testing page.
  before(setPrivacyToggle('never-consent', true));
  before(setPrivacyToggle('anti-tracking', false));

  after(setPrivacyToggle('custom-filters', false));

  describe('Styling', function () {
    for (const [id, filter] of [
      ['generic-selector-id', '###generic-target'],
      ['generic-selector-class', '##.generic-target'],
      ['generic-selector-attribute', '##[generic-target]'],
      ['generic-selector-has', '##.generic-outer-target:has(span)'],
      ['generic-selector-lazy', '##[generic-lazy-target="100ms"]'],
      ['generic-selector-adjunct', '##[generic-adjunct-target="100ms"]'],
      ['selector-id', '###target'],
      ['selector-class', '##.target'],
      ['selector-attribute', '##[target]'],
      ['selector-has', '##.outer-target:has(span)'],
      ['selector-lazy', '##[lazy-target="100ms"]'],
      ['selector-adjunct', '##[adjunct-target="100ms"]'],
    ]) {
      it(filter, async function () {
        await setCustomFilters([
          id.startsWith('generic') ? filter : PAGE_DOMAIN + filter,
        ]);
        await browser.url(PAGE_URL);

        const reports = await collectTestResults();
        const onReadystatechange = reports.find(function (report) {
          return (
            report.type === 'styling' && report.phase === 'readystatechange'
          );
        });
        const onDOMContentLoaded = reports.find(function (report) {
          return (
            report.type === 'styling' && report.phase === 'DOMContentLoaded'
          );
        });
        const on1000ms = reports.find(function (report) {
          return report.type === 'styling' && report.phase === '1000ms';
        });

        expect([
          onReadystatechange.results[id],
          onDOMContentLoaded.results[id],
          on1000ms.results[id],
        ]).toContain(true);
      });
    }
  });

  describe('Scripting', function () {
    for (const [id, filter] of [
      ['globals-safeself', '##+js(json-prune, globals-safeself)'],
      ['aopr', '##+js(aopr, encodeURIComponent)'],
      ['aopw', '##+js(aopw, __checkadb__custom)'],
      ['aeld', '##+js(aeld, click)'],
      ['call-nothrow', '##+js(call-nothrow, atob)'],
      ['json-prune', '##+js(json-prune, __checkadb__custom)'],
      ['set', '##+js(set, checkadb, true)'],
      ['nostif0', '##+js(nostif, , 0)'],
      ['nostif50', '##+js(nostif, , 50)'],
      ['nosiif50', '##+js(nosiif, , 50)'],
    ]) {
      it(filter, async function () {
        await setCustomFilters([PAGE_DOMAIN + filter]);
        await browser.url(PAGE_URL);

        const reports = await collectTestResults();
        const onHead = reports.find(function (report) {
          return report.type === 'scripting' && report.phase === 'head';
        });
        const onBody = reports.find(function (report) {
          return report.type === 'scripting' && report.phase === 'body';
        });
        const onDOMContentLoaded = reports.find(function (report) {
          return (
            report.type === 'scripting' && report.phase === 'DOMContentLoaded'
          );
        });
        const on1000ms = reports.find(function (report) {
          return report.type === 'scripting' && report.phase === '1000ms';
        });

        expect([
          onHead.results[id],
          onBody.results[id],
          onDOMContentLoaded.results[id],
          on1000ms.results[id],
        ]).toContain(true);
      });
    }
  });

  describe('Networking', function () {
    for (const [id, filter, constraint] of [
      ['url', '/gen/url.js^'],
      ['regex', '/gen\\/regex.js\\?t=[a-z0-9]{6}/'],
      ['modscript', '/gen/modscript.js^$script'],
      ['modxhr', '/gen/modxhr.js^$xhr'],
      [
        'modmatchcase',
        '/gen\\/modmatchcase-UPPERCASE.js/$match-case',
        // modmatchcase is not supported by adblocker library yet
        // refs https://github.com/ghostery/adblocker/pull/5296
        BROWSER_CONSTRAINT_CHROMIUM,
      ],
      ['redirnoopjs', '/gen/redirnoop.js^$redirect=noopjs'],
      [
        'rediradsbygoogle',
        '/gen/rediradsbygoogle.js^$redirect=googlesyndication_adsbygoogle.js',
      ],
      [
        'redirfallback',
        '/gen/redirfallback.js^$redirect=something_does_not_exist.js',
        BROWSER_CONSTRAINT_FIREFOX,
      ],
    ]) {
      if (constraint === BROWSER_CONSTRAINT_CHROMIUM && !browser.isChromium) {
        continue;
      }

      if (constraint === BROWSER_CONSTRAINT_FIREFOX && !browser.isFirefox) {
        continue;
      }

      it(filter, async function () {
        await setCustomFilters([filter]);
        await browser.url(PAGE_URL);

        const reports = await collectTestResults();
        // Networking tests only have one timing "lazy" starting in 200ms
        const report = reports.find(function (report) {
          return report.type === 'networking';
        });

        expect(report.results[id]).toBe(true);
      });
    }
  });
});
