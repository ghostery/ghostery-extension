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

import * as labels from '/ui/labels.js';

import Options from '/store/options.js';
import TabStats from '/store/tab-stats.js';

import * as exceptions from '/utils/exceptions.js';

function toggleDomain({ options, stats, tracker }) {
  return exceptions.toggleDomain(options, tracker.id, stats.hostname);
}

function toggleGlobal({ options, tracker }) {
  return exceptions.toggleGlobal(options, tracker.id);
}

export default {
  [router.connect]: { dialog: true },
  options: store(Options),
  stats: store(TabStats),
  trackerId: '',
  tracker: ({ stats, trackerId }) =>
    stats.trackers.find((t) => t.id === trackerId),
  exceptionStatus: ({ options, stats, tracker }) =>
    exceptions.getStatus(options, tracker.id, stats.hostname),
  exceptionLabel: ({ options, stats, tracker }) =>
    exceptions.getLabel(options, tracker.id, stats.hostname),
  domainStatus: ({ options, stats, tracker }) =>
    options.exceptions[tracker.id]?.domains.some((d) =>
      stats.hostname.includes(d),
    ),
  render: ({
    stats,
    tracker,
    exceptionStatus,
    exceptionLabel,
    domainStatus,
  }) => html`
    <template layout="column">
      <panel-dialog>
        <div
          id="panel-company-alerts"
          layout="absolute inset:1 bottom:auto"
        ></div>
        <ui-text slot="header" type="label-l">${tracker.name}</ui-text>

        <div
          slot="header"
          layout="center row items:center gap overflow margin:0.5:0:0:0"
        >
          <ui-category-icon
            name="${tracker.category}"
            layout="size:2.5"
          ></ui-category-icon>
          <ui-text slot="header" type="body-s" color="secondary">
            ${tracker.company &&
            tracker.company !== tracker.name &&
            tracker.company + ' •'}
            ${labels.categories[tracker.category]}
          </ui-text>
        </div>
        <div layout="column gap:2">
          <div layout="column items:center gap:0.5">
            <ui-text type="body-s">Protection status</ui-text>
            <div layout="row items:center gap:0.5">
              <ui-icon
                name="${exceptionStatus.trusted ? 'trust' : 'block'}-m"
                color="secondary"
                layout="size:2"
              ></ui-icon>
              <ui-text type="label-m">${exceptionLabel}</ui-text>
            </div>
          </div>
          <div layout="column margin:2:1.5:0">
            <ui-toggle
              value="${domainStatus}"
              disabled="${exceptionStatus.trusted && exceptionStatus.global}"
              onchange="${toggleDomain}"
              no-label
            >
              <div layout="grow">
                <ui-text type="label-m">Trust on this website</ui-text>
                <ui-text type="body-s" color="secondary">
                  <!-- Add domain as an exception -->
                  Add ${stats.hostname} as an exception
                </ui-text>
              </div>
            </ui-toggle>
          </div>
          <ui-line></ui-line>
          <panel-card layout="column gap">
            <ui-toggle
              value="${exceptionStatus.trusted && exceptionStatus.global}"
              onchange="${toggleGlobal}"
              no-label
            >
              <div layout="grow">
                <ui-text type="label-m">Trust on all websites</ui-text>
                <ui-text type="body-s" color="secondary">
                  Add exception
                </ui-text>
              </div>
            </ui-toggle>
          </panel-card>
        </div>
      </panel-dialog>
    </template>
  `,
};
