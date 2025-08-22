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

import { html, store } from 'hybrids';
import { saveAs } from 'file-saver';

import Log from '../store/log.js';
import Tab from '../store/tab.js';

import refreshImage from '../assets/refresh.svg';

function refreshSelectedTab(host) {
  chrome.tabs.reload(Number(host.tabId));
}

function downloadReport(host) {
  const report =
    `Date,URL,Type,Blocked,Modified,Filter,Tracker,Organization\n` +
    host.logs
      .map((log) =>
        [
          new Date(log.timestamp).toISOString(),
          log.url,
          log.type,
          log.blocked,
          log.modified,
          log.filter,
          log.tracker,
          log.organization,
        ].join(','),
      )
      .join('\n');

  saveAs(new Blob([report], { type: 'text/csv' }), 'report.csv');
}

export default {
  logs: store([Log], {
    id: ({ tabId, query, status }) => ({ tabId, query, status }),
  }),
  tabs: store([Tab]),
  tabId: ({ tabs }, value) => {
    if (value !== undefined) return value;
    return store.ready(tabs) ? tabs.find((tab) => tab.active).id : '';
  },
  query: '',
  status: '',
  render: ({ logs, tabs, tabId, status }) => html`
    <template layout="height:full width::960px">
      <main layout="column height:full" translate="no">
        <div layout="row items:center gap padding:2:2:1">
          <ui-text type="label-l">Logger</ui-text>
          <ui-input layout="width:30">
            <select onchange="${html.set('tabId')}" value="${tabId}">
              <option value="">All tabs</option>
              ${store.ready(tabs) &&
              tabs.map(
                (tab) => html`
                  <option value="${tab.id}" selected=${tab.id === tabId}>
                    ${tab.title} ${tab.hostname}
                  </option>
                `,
              )}
            </select>
          </ui-input>
          <ui-input layout="grow">
            <input
              type="search"
              placeholder="Search..."
              oninput="${html.set('query')}"
            />
          </ui-input>
          <ui-input>
            <select onchange="${html.set('status')}" value="${status}">
              <option value="">All requests</option>
              <option value="touched">Blocked / Modified</option>
              <option value="warning">Warnings</option>
            </select>
          </ui-input>
          <ui-button
            onclick="${downloadReport}"
            layout="width:5"
            disabled="${!store.ready(logs) || logs.length === 0}"
          >
            <button title="Download report">
              <ui-icon name="download" layout="size:2"></ui-icon>
            </button>
          </ui-button>
          <ui-button
            onclick="${refreshSelectedTab}"
            layout="width:5"
            disabled="${!tabId}"
          >
            <button title="Refresh current tab">
              <ui-icon name="refresh" layout="size:2"></ui-icon>
            </button>
          </ui-button>

          <ui-button onclick="${() => location.reload()}" layout="width:5">
            <button title="Clear logs and reload">
              <ui-icon name="trash" layout="size:2"></ui-icon>
            </button>
          </ui-button>
        </div>
        <ui-line></ui-line>
        <div layout="grid:80px|1fr|60px|60px|240px|140px|100px gap padding:1:2">
          <ui-text type="body-s" color="tertiary">Date</ui-text>
          <ui-text type="body-s" color="tertiary">URL</ui-text>
          <ui-text type="body-s" color="tertiary">Type</ui-text>
          <ui-text type="body-s" color="tertiary">Status</ui-text>
          <ui-text type="body-s" color="tertiary">Filter</ui-text>
          <ui-text type="body-s" color="tertiary">Tracker</ui-text>
          <ui-text type="body-s" color="tertiary">Organization</ui-text>
        </div>
        <ui-line></ui-line>
        <div layout="column overflow:scroll grow">
          ${store.ready(logs) &&
          logs.length === 0 &&
          html`
            <div
              layout="block:center column grow center self:center gap width:::350px"
              translate="no"
            >
              <img src="${refreshImage}" layout="size:221px" />
              <ui-text type="headline-s">
                To view the request log, press refresh on the toolbar
              </ui-text>
              <ui-text type="body-s" color="secondary">
                This is an experimental feature - if you encounter any issues,
                please contact our support team.
              </ui-text>
            </div>
          `}
          <div layout="column-reverse gap padding:2">
            ${store.ready(logs) &&
            logs.map((log) =>
              html`
                <div layout="grid:80px|1fr|60px|60px|240px|140px|100px gap">
                  <ui-text type="body-s" color="tertiary">
                    ${log.time}
                  </ui-text>
                  <ui-text ellipsis>${log.url}</ui-text>
                  <ui-text type="body-s" color="secondary">${log.type}</ui-text>
                  <div layout="row gap:0.5">
                    ${log.blocked &&
                    html`<ui-icon
                      name="block-s"
                      color="danger-primary"
                      layout="size:2"
                    ></ui-icon>`}
                    ${log.modified &&
                    html`<ui-icon
                      name="eye"
                      color="brand-primary"
                      layout="size:2"
                    ></ui-icon>`}
                    ${((log.filter && !log.blocked && !log.modified) ||
                      (!log.filter && (log.blocked || log.modified))) &&
                    html`<ui-icon
                      name="warning"
                      color="warning-secondary"
                      layout="size:2"
                    ></ui-icon>`}
                  </div>
                  <ui-text type="body-s" color="tertiary" ellipsis>
                    ${log.filter}
                  </ui-text>
                  <ui-text type="body-s" color="tertiary" ellipsis>
                    ${log.tracker}
                  </ui-text>
                  <ui-text type="body-s" color="tertiary" ellipsis>
                    ${log.organization}
                  </ui-text>
                </div>
              `.key(log.id),
            )}
          </div>
        </div>
      </main>
    </template>
  `,
};
