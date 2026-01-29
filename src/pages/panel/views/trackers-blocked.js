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
import { saveAs } from 'file-saver';

import Options from '/store/options.js';
import TabStats from '/store/tab-stats.js';

import headerImageUrl from '../assets/trackers-blocked.svg';
import { showCopyNotification } from '../components/alert.js';

async function downloadReport(host, event) {
  const button = event.currentTarget;
  button.disabled = true;

  let report = `Tracker\tOrganization\tURL\n`;

  for (const tracker of host.trackers) {
    const organization =
      tracker.organization && (await store.resolve(tracker.organization));

    const organizationName = organization?.name ?? '';

    for (const request of tracker.requestsBlocked) {
      report += `${tracker.name}\t${organizationName}\t${request.url}\n`;
    }
  }

  saveAs(
    new Blob([report], { type: 'text/csv' }),
    `Ghostery Website Report (${host.stats.hostname}).csv`,
  );

  button.disabled = false;
}

export default {
  [router.connect]: { dialog: true },
  options: store(Options),
  stats: store(TabStats),
  trackers: ({ stats }) => stats.trackers.filter((t) => t.blocked),
  render: ({ stats, trackers }) => html`
    <template layout="column">
      <panel-dialog header>
        <div layout="column center gap:2.5 margin:1:0">
          <img
            src="${headerImageUrl}"
            alt="Trackers Blocked"
            layout="width:300px"
          />
          <div layout="block:center column gap:0.5">
            <div layout="row items:center gap:0.5">
              <panel-badge type="danger">${trackers.length}</panel-badge>
              <ui-text type="label-m">Trackers blocked</ui-text>
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
          <button><ui-icon name="download"></ui-icon> Download Report</button>
        </ui-button>
      </panel-dialog>
    </template>
  `,
};
