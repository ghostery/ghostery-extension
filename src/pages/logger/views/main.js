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
import { FilterType } from '@ghostery/adblocker';
import { stringify } from 'csv-stringify/browser/esm/sync';

import { download } from '/utils/files.js';
import DisabledFilters from '/store/disabled-filters.js';

import Log from '../store/log.js';
import Tab from '../store/tab.js';

import refreshImage from '../assets/refresh.svg';

function refreshSelectedTab(host) {
  chrome.tabs.reload(Number(host.tabId));
}

const REPORT_COLUMNS = [
  'Date',
  'Filter',
  'Type',
  'Blocked',
  'Modified',
  'URL',
  'Tracker',
  'Organization',
];

async function downloadReport(host) {
  const report = host.visibleLogs.map((log) => [
    new Date(log.timestamp).toISOString(),
    log.typeLabel,
    log.filter,
    log.blocked,
    log.modified,
    log.url,
    log.tracker,
    log.organization ?? '',
  ]);

  await download({
    data: stringify(report, {
      header: true,
      columns: REPORT_COLUMNS,
      escape_formulas: true,
    }),
    filename: `ghostery-logger-report.csv`,
    type: 'text/csv;charset=utf-8;',
  });
}

function disableEllipsis(host, event) {
  const textElements = event.currentTarget.querySelectorAll('ui-text');
  for (const el of textElements) {
    el.ellipsis = false;
  }
}

const APPLIED_VALUES = ['', 'applied', 'excepted', 'disabled'];

const sessionPref = (key, parse) => ({
  value: parse(sessionStorage.getItem(key)),
  observe: (_, value) => sessionStorage.setItem(key, String(value)),
});

function toggleState(log) {
  if (!log.filterId) return 'none';
  if (log.filterType === FilterType.COSMETIC) return 'toggleable';
  if (log.filterType === FilterType.NETWORK) return __CHROMIUM__ ? 'unsupported' : 'toggleable';
  return 'none';
}

async function toggleFilter(host, event, log) {
  event.stopPropagation();
  const resolved = await store.resolve(DisabledFilters);
  const ids = resolved.ids.includes(log.filterId)
    ? resolved.ids.filter((id) => id !== log.filterId)
    : [...resolved.ids, log.filterId];
  await store.set(DisabledFilters, { ids });
}

export default {
  logs: store([Log], {
    id: ({ tabId, query, filterType }) => ({ tabId, query, filterType }),
  }),
  tabs: store([Tab]),
  disabledFilters: store(DisabledFilters),
  disabledIds: ({ disabledFilters }) =>
    store.ready(disabledFilters) ? new Set(disabledFilters.ids) : new Set(),
  visibleLogs: ({ logs, applied, disabledIds }) => {
    if (!store.ready(logs)) return [];
    if (!applied) return logs;
    return logs.filter((log) => {
      const isDisabled = log.filterId && disabledIds.has(log.filterId);
      if (applied === 'applied') {
        if (isDisabled) return false;
        return (
          log.blocked || log.modified || (log.filterType === FilterType.COSMETIC && !log.exception)
        );
      }
      if (applied === 'excepted') {
        return log.exception;
      }
      if (applied === 'disabled') {
        return isDisabled;
      }
      return true;
    });
  },
  tabId: ({ tabs }, value) => {
    if (value !== undefined) return value;
    // Fallback to current active tab (default value)
    return store.ready(tabs) ? tabs.find((tab) => tab.active).id : '';
  },
  query: '',
  filterType: sessionPref('logger:filterType', (v) => Number(v) || 0),
  applied: sessionPref('logger:applied', (v) => (APPLIED_VALUES.includes(v) ? v : '')),
  render: ({ logs, visibleLogs, tabs, tabId, filterType, applied, disabledIds }) => html`
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
            <input type="search" placeholder="Search..." oninput="${html.set('query')}" />
          </ui-input>
          <ui-input>
            <select onchange="${html.set('filterType')}" value="${filterType}">
              <option value="0">All filters</option>
              <option value="${FilterType.NETWORK}">Network</option>
              <option value="${FilterType.COSMETIC}">Cosmetic</option>
            </select>
          </ui-input>
          <ui-input>
            <select onchange="${html.set('applied')}" value="${applied}">
              <option value="">Any status</option>
              <option value="applied">Applied</option>
              <option value="excepted">Exceptions</option>
              <option value="disabled">Disabled</option>
            </select>
          </ui-input>
          <ui-button
            onclick="${downloadReport}"
            layout="width:5"
            disabled="${!store.ready(logs) || visibleLogs.length === 0}"
          >
            <button title="Download report">
              <ui-icon name="download" layout="size:2"></ui-icon>
            </button>
          </ui-button>
          <ui-button onclick="${refreshSelectedTab}" layout="width:5" disabled="${!tabId}">
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
        <div layout="grid:80px|120px|1fr|40px|240px|140px|40px gap padding:1:2">
          <ui-text type="body-s" color="tertiary">Date</ui-text>
          <ui-text type="body-s" color="tertiary">Type</ui-text>
          <ui-text type="body-s" color="tertiary">Filter</ui-text>
          <ui-text type="body-s" color="tertiary"></ui-text>
          <ui-text type="body-s" color="tertiary">URL</ui-text>
          <ui-text type="body-s" color="tertiary">Tracker</ui-text>
          <ui-text type="body-s" color="tertiary"></ui-text>
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
                This is an experimental feature - if you encounter any issues, please contact our
                support team.
              </ui-text>
            </div>
          `}
          <div layout="column-reverse padding" style="word-break:break-all">
            ${store.ready(logs) &&
            visibleLogs.map((log) => {
              const state = toggleState(log);
              const isDisabled = state === 'toggleable' && disabledIds.has(log.filterId);
              return html`
                <div
                  layout="grid:80px|120px|1fr|40px|240px|140px|40px gap padding:0.5:1"
                  layout:hover="::background:secondary"
                  onclick="${disableEllipsis}"
                >
                  <ui-text type="body-s" color="tertiary"> ${log.time} </ui-text>
                  <ui-text type="body-s" color="secondary"> ${log.typeLabel} </ui-text>
                  <ui-text ellipsis>${log.filter}</ui-text>
                  <div layout="row gap:0.5">
                    ${log.blocked &&
                    html`<ui-icon name="block-s" color="danger-primary" layout="size:2"></ui-icon>`}
                    ${log.modified &&
                    html`<ui-icon name="eye" color="brand-primary" layout="size:2"></ui-icon>`}
                  </div>
                  <ui-text type="body-s" color="tertiary" ellipsis> ${log.url} </ui-text>
                  <ui-text type="body-s" color="tertiary" ellipsis>
                    ${log.tracker} ${log.organization && html`(${log.organization})`}
                  </ui-text>
                  ${state === 'toggleable'
                    ? html`
                        <ui-button layout="width:4">
                          <button
                            title="${isDisabled
                              ? 'Filter is currently disabled — click to re-enable'
                              : 'Disable this filter at runtime'}"
                            onclick="${(host, event) => toggleFilter(host, event, log)}"
                          >
                            <ui-icon
                              name="${isDisabled ? 'check' : 'stop'}"
                              color="${isDisabled ? 'success-primary' : ''}"
                              layout="size:2"
                            ></ui-icon>
                          </button>
                        </ui-button>
                      `
                    : state === 'unsupported'
                      ? html`
                          <ui-button layout="width:4" disabled>
                            <button
                              disabled
                              title="Network filters cannot be disabled at runtime in this browser (handled by the browser's DNR layer)"
                            >
                              <ui-icon name="stop" color="tertiary" layout="size:2"></ui-icon>
                            </button>
                          </ui-button>
                        `
                      : ''}
                </div>
              `.key(log.id);
            })}
          </div>
        </div>
      </main>
    </template>
  `,
};
