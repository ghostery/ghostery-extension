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

import { html, router, store } from 'hybrids';
import { stringify } from 'csv-stringify/browser/esm/sync';

import Options from '/store/options.js';
import TabStats from '/store/tab-stats.js';

import { isWebkit } from '/utils/browser-info.js';
import { download } from '/utils/files.js';

import blockedImageUrl from '../assets/trackers-blocked.svg';
import modifiedImageUrl from '../assets/trackers-modified.svg';

import { showCopyNotification } from '../components/alert.js';

const REPORT_COLUMNS = ['Tracker', 'Organization', 'URL'];

async function downloadReport(host, event) {
  const button = event.currentTarget;
  button.disabled = true;

  const report = [];
  for (const tracker of host.trackers) {
    const organization =
      tracker.organization && (await store.resolve(tracker.organization));

    const organizationName = organization?.name ?? '';

    for (const request of tracker.requestsBlocked) {
      report.push([tracker.name, organizationName, request.url]);
    }
  }

  await download({
    data: stringify(report, { header: true, columns: REPORT_COLUMNS }),
    filename: `ghostery-website-report-${host.stats.hostname}.csv`,
    type: 'text/csv;charset=utf-8;',
    // Safari does not support downloading files from the popup window,
    // so we need to open the download helper page in a new tab
    forceNewTab: __PLATFORM__ !== 'firefox' && isWebkit(),
  });

  button.disabled = false;
}

export default {
  [router.connect]: { dialog: true },
  type: '', // 'blocked' | 'modified'
  options: store(Options),
  stats: store(TabStats),
  trackers: ({ type, stats }) => stats.trackers.filter((t) => t[type]),
  render: ({ type, stats, trackers }) => html`
    <template layout="column">
      <panel-dialog header>
        <div layout="column center gap:2.5 margin:1:0">
          ${type === 'blocked' &&
          html`<img
            src="${blockedImageUrl}"
            alt="Trackers Blocked"
            layout="width:300px"
          />`}
          ${type === 'modified' &&
          html`<img
            src="${modifiedImageUrl}"
            alt="Trackers Blocked"
            layout="width:300px"
          />`}
          <div layout="block:center column gap:0.5">
            <div layout="row items:center gap:0.5">
              ${type === 'blocked' &&
              html`
                <panel-badge type="danger">${trackers.length}</panel-badge>
                <ui-text type="label-m">Trackers blocked</ui-text>
              `}
              ${type === 'modified' &&
              html`
                <panel-badge type="brand">${trackers.length}</panel-badge>
                <ui-text type="label-m">Trackers modified</ui-text>
              `}
            </div>
            <ui-text type="body-s" color="secondary">${stats.hostname}</ui-text>
          </div>
        </div>
        <div layout="column gap:2.5">
          ${trackers.map(
            (tracker) => html`
              <div layout="column gap">
                <div layout="row items:center gap:0.5">
                  <ui-text type="label-s">${tracker.name}</ui-text>
                  <ui-category-icon
                    name="${tracker.category}"
                    size="small"
                  ></ui-category-icon>
                  <ui-stats-badge layout="height:full">
                    ${tracker.requestsBlocked.length}
                  </ui-stats-badge>
                </div>
                ${tracker.requestsBlocked.map(
                  ({ url }) => html`
                    <panel-copy oncopy="${showCopyNotification}">
                      ${url}
                    </panel-copy>
                  `,
                )}
              </div>
            `,
          )}
        </div>
        <ui-button type="primary" slot="footer" onclick="${downloadReport}">
          <button><ui-icon name="download"></ui-icon> Download report</button>
        </ui-button>
      </panel-dialog>
    </template>
  `,
};
