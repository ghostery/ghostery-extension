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

import { html, msg, router, store } from 'hybrids';

import TabStats from '/store/tab-stats.js';
import { SCOPE_ALL, SCOPE_WEBSITE } from '/utils/browsing-data.js';

import { showAlert } from '../components/alert.js';

async function clear(host) {
  // The dialog closes right away, so the options must be read upfront
  const options = {
    scope: host.scope,
    hostname: host.hostname,
    domain: host.domain,
    timeRange: host.timeRange,
    tabs: host.tabs,
    cache: host.cache,
    history: host.scope === SCOPE_ALL && host.history,
    cookies: host.cookies,
  };

  const granted = await chrome.permissions.request({
    permissions: ['browsingData'],
  });

  if (!granted) {
    showAlert(html`
      <panel-alert type="danger">
        Ghostery needs an additional permission to clear browsing data.
      </panel-alert>
    `);
    return;
  }

  try {
    const result = await chrome.runtime.sendMessage({
      action: 'browsingData:clear',
      options,
    });

    if (!result?.success) throw new Error(result?.error || 'No response from the background');

    showAlert(html`
      <panel-alert type="success">Your browsing data has been cleared.</panel-alert>
    `);
  } catch (e) {
    console.error('[clear-browsing-data] Failed to clear browsing data', e);

    showAlert(html` <panel-alert type="danger">Failed to clear browsing data.</panel-alert> `);
  }
}

export default {
  [router.connect]: { dialog: true },
  stats: store(TabStats),
  hostname: ({ stats }) => (store.ready(stats) && stats.hostname) || '',
  domain: ({ stats }) => (store.ready(stats) && stats.domain) || '',
  selectedScope: SCOPE_WEBSITE,
  scope: ({ hostname, selectedScope }) => (hostname ? selectedScope : SCOPE_ALL),
  timeRange: 'all',
  tabs: true,
  cache: true,
  history: true,
  cookies: true,
  render: ({ hostname, scope, timeRange, tabs, cache, history, cookies }) => html`
    <template layout="column">
      <panel-dialog>
        <ui-text slot="header" type="label-l">Clear browsing data</ui-text>
        <ui-text slot="header" type="body-s" color="secondary">
          ${
            scope === SCOPE_WEBSITE
              ? msg`The selected data of this website will be cleared.`
              : msg`The selected data of all websites will be cleared.`
          }
        </ui-text>
        <div layout="column gap:1.5">
          <ui-action-button-group>
            <ui-action-button
              grouped
              active="${scope === SCOPE_WEBSITE}"
              disabled="${!hostname}"
              layout="grow basis:0"
            >
              <button
                onclick="${html.set('selectedScope', SCOPE_WEBSITE)}"
                title="${hostname}"
                aria-pressed="${scope === SCOPE_WEBSITE ? 'true' : 'false'}"
                data-qa="button:scope:website"
              >
                <ui-text type="label-s" color="inherit">This website</ui-text>
              </button>
            </ui-action-button>
            <ui-action-button grouped active="${scope === SCOPE_ALL}" layout="grow basis:0">
              <button
                onclick="${html.set('selectedScope', SCOPE_ALL)}"
                aria-pressed="${scope === SCOPE_ALL ? 'true' : 'false'}"
                data-qa="button:scope:all"
              >
                <ui-text type="label-s" color="inherit">All websites</ui-text>
              </button>
            </ui-action-button>
          </ui-action-button-group>
          <div layout="column">
            <div layout="row items:center gap:3 height:5">
              <ui-text type="label-s" layout="grow">Time range</ui-text>
              <ui-input>
                <select
                  value="${timeRange}"
                  onchange="${html.set('timeRange')}"
                  layout="height:4"
                  data-qa="select:time-range"
                >
                  <option value="hour">Last hour</option>
                  <option value="day">Last 24 hours</option>
                  <option value="week">Last 7 days</option>
                  <option value="all">All time</option>
                </select>
              </ui-input>
            </div>
            <ui-toggle
              value="${tabs}"
              onchange="${html.set('tabs')}"
              type="success"
              align="center"
              no-label
              layout="height:5"
              data-qa="toggle:tabs"
            >
              <ui-text type="label-s">
                ${scope === SCOPE_WEBSITE ? msg`Close this tab` : msg`Close all tabs`}
              </ui-text>
            </ui-toggle>
            <ui-toggle
              value="${cache}"
              onchange="${html.set('cache')}"
              type="success"
              align="center"
              no-label
              layout="height:5"
              data-qa="toggle:cache"
            >
              <ui-text type="label-s">Clear cache</ui-text>
            </ui-toggle>
            <ui-toggle
              value="${cookies}"
              onchange="${html.set('cookies')}"
              type="success"
              align="center"
              no-label
              layout="padding:1:0"
              data-qa="toggle:cookies"
            >
              <div layout="column gap:0.25 grow">
                <ui-text type="label-s">Delete cookies and site data</ui-text>
                <ui-text type="body-s" color="tertiary">
                  It might sign you out of your accounts.
                </ui-text>
              </div>
            </ui-toggle>
            <ui-toggle
              value="${scope === SCOPE_ALL && history}"
              onchange="${html.set('history')}"
              disabled="${scope === SCOPE_WEBSITE}"
              type="success"
              align="center"
              no-label
              layout="height:5"
              data-qa="toggle:history"
            >
              <ui-text type="label-s">Clear history</ui-text>
            </ui-toggle>
          </div>
        </div>
        <div slot="footer" layout="grid:2 gap">
          <ui-button>
            <a href="${router.backUrl()}">Cancel</a>
          </ui-button>
          <ui-button type="danger" data-qa="button:confirm-clear-browsing-data">
            <a onclick="${clear}" href="${router.backUrl()}">Clear</a>
          </ui-button>
        </div>
      </panel-dialog>
    </template>
  `,
};
