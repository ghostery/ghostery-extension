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

import { html, store, dispatch } from 'hybrids';

import Options from '/store/options.js';
import Config, {
  ACTION_ASSIST,
  ACTION_DISABLE_AUTOCONSENT,
} from '/store/config.js';

const VERSION = chrome.runtime.getManifest().version;

export async function asyncAction(event, promise) {
  const button = event.currentTarget;
  const el = button.children[0];
  const origText = el.textContent;

  button.disabled = true;
  el.textContent = '...';

  const response = await promise;

  if (response) {
    el.textContent = response;

    setTimeout(() => {
      button.disabled = false;
      el.textContent = origText;
    }, 2000);
  } else {
    button.disabled = false;
    el.textContent = origText;
  }
}

function clearStorage(host, event) {
  asyncAction(event, chrome.runtime.sendMessage({ action: 'clearStorage' }));
}

async function syncConfig(host, event) {
  asyncAction(event, chrome.runtime.sendMessage({ action: 'syncConfig' }));
}

async function testConfigDomain(host) {
  const domain = window.prompt('Enter domain to test:', 'example.com');
  if (!domain) return;

  const actions = window.prompt(
    'Enter actions to test:',
    `${ACTION_ASSIST}, ${ACTION_DISABLE_AUTOCONSENT}`,
  );

  if (!actions) return;

  await store.set(host.config, {
    domains: {
      [domain]: { actions: actions.split(',').map((a) => a.trim()) },
    },
  });
}

async function testConfigFlag(host) {
  const flag = window.prompt('Enter flag to test:');
  if (!flag) return;

  await store.set(host.config, {
    flags: {
      [flag]: { enabled: true },
    },
  });
}

function updateFilters(host) {
  if (host.updatedAt) {
    store.set(host.options, { filtersUpdatedAt: 0 });
  }
}

function refresh(host) {
  host.counter += 1;

  if (host.counter > 5) {
    host.visible = true;
    dispatch(host, 'shown');
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString(chrome.i18n.getUILanguage(), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function openLogger() {
  const url = chrome.runtime.getURL('/pages/logger/index.html');
  const features = 'toolbar=no,width=1000,height=500';

  window.open(url, 'Ghostery Logger', features);
}

export default {
  counter: 0,
  options: store(Options),
  config: store(Config),
  updatedAt: ({ options }) =>
    store.ready(options) &&
    options.filtersUpdatedAt &&
    formatDate(options.filtersUpdatedAt),
  visible: false,
  render: ({ visible, counter, updatedAt, config }) => html`
    <template layout="column gap:3">
      ${
        (visible || counter > 5) &&
        html`
          <section layout="column gap:3" translate="no">
            <ui-text type="headline-m">Developer tools</ui-text>

            ${store.ready(config) &&
            html`
              <div layout="column gap" translate="no">
                <ui-toggle
                  value="${config.enabled}"
                  onchange="${html.set(config, 'enabled')}"
                >
                  <div layout="column">
                    <ui-text type="headline-s">Remote Configuration</ui-text>
                    <ui-text type="body-xs" color="gray-400">
                      Updated at: ${formatDate(config.updatedAt)}
                    </ui-text>
                  </div>
                </ui-toggle>
                <div>
                  <ui-text type="label-m">Domains</ui-text>
                  <div layout="row:wrap gap">
                    ${Object.entries(config.domains)
                      .filter(([, d]) => d.actions.length)
                      .map(
                        ([name, d]) =>
                          html`<ui-text color="gray-600">
                            ${name} (${d.actions.join(', ')})
                          </ui-text>`,
                      ) || 'none'}
                  </div>
                </div>
                <div>
                  <ui-text type="label-m">Flags</ui-text>
                  <ui-text color="gray-600">
                    ${Object.entries(config.flags)
                      .filter(([, f]) => f.enabled)
                      .map(([name]) => name)
                      .join(' ') || 'none'}
                  </ui-text>
                </div>
                <div layout="row gap">
                  <ui-button
                    layout="shrink:0 self:start"
                    onclick="${testConfigDomain}"
                  >
                    <button>Test domain</button>
                  </ui-button>
                  <ui-button
                    layout="shrink:0 self:start"
                    onclick="${testConfigFlag}"
                  >
                    <button>Test flag</button>
                  </ui-button>
                  <ui-button
                    onclick="${syncConfig}"
                    layout="shrink:0 self:start"
                  >
                    <button>
                      <ui-icon name="refresh" layout="size:2"></ui-icon>
                      Force sync
                    </button>
                  </ui-button>
                </div>
              </div>
              <ui-line></ui-line>
            `}
            ${(__PLATFORM__ === 'chromium' || __PLATFORM__ === 'safari') &&
            html`
              <div layout="column gap items:start" translate="no">
                <ui-text type="headline-s">Enabled DNR rulesets</ui-text>
                <ui-text type="body-xs" color="gray-400">
                  The below list is not reactive to changes made in the
                  extension - use refresh button
                </ui-text>
                <div layout="row gap">
                  ${html.resolve(
                    chrome.declarativeNetRequest
                      .getEnabledRulesets()
                      .then(
                        (rules) => html`
                          ${rules.map((r) => html`<ui-text>${r}</ui-text>`)}
                          ${!rules.length &&
                          html`<ui-text translate="no">
                            No rulesets enabled...
                          </ui-text>`}
                        `,
                      ),
                  )}
                </div>
                <ui-button onclick="${refresh}" layout="shrink:0">
                  <button>Refresh</button>
                </ui-button>
              </div>
              <ui-line></ui-line>
            `}

            <div layout="column gap">
              <ui-text type="headline-s">Actions</ui-text>
              <div layout="row gap items:start">
                <ui-button onclick="${clearStorage}" layout="shrink:0">
                  <button>
                    <ui-icon name="trash" layout="size:2"></ui-icon>
                    Clear storage
                  </button>
                </ui-button>
                <ui-button>
                  <button onclick="${openLogger}">
                    <ui-icon name="play" layout="size:2"></ui-icon>
                    Logger
                  </button>
                </ui-button>
              </div>
            </div>
          </section>
        `
      }
      <div layout="column gap center">
        <div layout="row center gap:2">
          <div onclick="${refresh}">
            <ui-text
              type="label-s"
              color="gray-300"
              translate="no"
              style="user-select: none;"
            >
              v${VERSION}
            </ui-text>
          </div>
        </div>
        <ui-action>
          <ui-text type="label-xs" color="gray-300" onclick="${updateFilters}">
            Last update: ${updatedAt || html`updating...`}
          </ui-text>
        <ui-action>
      </div>
    </template>
  `,
};
