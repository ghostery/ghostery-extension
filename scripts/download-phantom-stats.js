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

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'node:path';

import { RESOURCES_PATH } from './utils/urls.js';

const TARGET_PATH = resolve(RESOURCES_PATH, 'phantom-stats.js');
if (existsSync(TARGET_PATH)) process.exit(0);

const THRESHOLD = 0.05;
const CONCURRENCY = 20;
const RETRIES = 2;

const { dataDependencies } = JSON.parse(readFileSync(resolve('package.json'), 'utf-8'));

async function fetchSite(domain) {
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      const res = await fetch(
        `https://whotracks.me/api/v2/websites/${encodeURIComponent(domain)}.json`,
        { signal: controller.signal },
      );
      clearTimeout(timeout);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error(`${res.status}`);
      }
      return await res.json();
    } catch {
      if (attempt === RETRIES) return undefined;
    }
  }
}

async function main() {
  console.log('Downloading phantom-stats (top sites @ site_proportion >= 0.05, by category)...');

  const preview = await fetch(
    `https://raw.githubusercontent.com/whotracksme/whotracks.me/${dataDependencies['wtm-stats']}/whotracksme/data/assets/trackers-preview.json`,
  ).then((res) => {
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
  });

  const domains = Object.keys(preview.trackers);

  const sites = {};
  let month = '';
  let failed = 0;
  let index = 0;
  let done = 0;

  async function worker() {
    while (index < domains.length) {
      const domain = domains[index++];
      const data = await fetchSite(domain);
      if (data) {
        month ||= data.site?.overview?.month || '';
        const byCategory = {};
        for (const tracker of data.tracker_list || []) {
          if (tracker.site_proportion >= THRESHOLD) {
            byCategory[tracker.category] = (byCategory[tracker.category] || 0) + 1;
          }
        }
        if (Object.keys(byCategory).length) sites[domain] = byCategory;
      } else if (data === undefined) {
        failed += 1;
      }
      done += 1;
      if (done % 1000 === 0) console.log(`  ${done}/${domains.length} (failed: ${failed})`);
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const allCategories = [...new Set(Object.values(sites).flatMap((s) => Object.keys(s)))].sort();
  console.log(`Done. month=${month} sites=${Object.keys(sites).length} failed=${failed}`);
  console.log(`categories: ${allCategories.join(', ')}`);

  writeFileSync(
    TARGET_PATH,
    `/**
 * Per-site, per-category count of trackers observed on at least ${THRESHOLD * 100}% of page
 * loads, derived from the WhoTracks.Me website reports (month ${month}). Matches the default
 * threshold used by the WhoTracks.Me website reports.
 *
 * Conversion script: scripts/download-phantom-stats.js
 *
 * Note for AMO reviewers: This is not actual JavaScript code, but a data file.
 */
export default ${JSON.stringify({ threshold: THRESHOLD, month, sites })};
`,
  );
}

main();
