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
import {
  ACTION_DISABLE_AUTOCONSENT,
  ACTION_DISABLE_ANTITRACKING_MODIFICATION,
  ACTION_PAUSE_ASSISTANT,
  FLAGS,
} from '@ghostery/config';

import Options from '/store/options.js';
import Config from '/store/config.js';
import Notification from '/store/notification.js';
import Resources from '/store/resources.js';
import * as telemetry from '/utils/telemetry.js';

import { longDateFormatter } from '/ui/labels.js';

import { asyncAction } from '../utils/actions.js';

const VERSION = chrome.runtime.getManifest().version;

function clearStorage(host, event) {
  asyncAction(event, chrome.runtime.sendMessage({ action: 'clearStorage' }));
}

async function setConfig(values) {
  await chrome.runtime.sendMessage({ action: 'devtools:config', values });
}

async function forceConfigSync(host, event) {
  await asyncAction(event, setConfig({ updatedAt: 0 }));
}

async function testConfigDomain() {
  const domain = window.prompt('Enter domain to test:', 'example.com');
  if (!domain) return;

  const actions = window.prompt(
    'Enter actions to test:',
    [
      ACTION_DISABLE_AUTOCONSENT,
      ACTION_DISABLE_ANTITRACKING_MODIFICATION,
      ACTION_PAUSE_ASSISTANT,
    ].join(', '),
  );

  if (!actions) return;

  await setConfig({
    domains: {
      [domain]: { actions: actions.split(',').map((a) => a.trim()) },
    },
  });
}

function toggleFlag(name) {
  return async (host, event) => {
    await setConfig({
      flags: {
        [name]: event.target.checked ? { percentage: 0, enabled: event.target.checked } : null,
      },
    });
  };
}

function createClearConfigDomain(name) {
  return async () => {
    setConfig({ domains: { [name]: null } });
  };
}

function refresh(host) {
  host.counter += 1;

  if (host.counter > 5) {
    host.visible = true;
    dispatch(host, 'shown');
  }
}

export default {
  visible: false,
  counter: 0,
  options: store(Options),
  config: store(Config),
  notifications: store([Notification]),
  resources: store(Resources),
  render: ({ visible, counter, options, config, notifications, resources }) => html`
    <template layout="column gap:3 margin:top:2">
      ${(visible || counter > 5) &&
      html`
        <section layout="column gap:4" translate="no">
          <div layout="column gap:2">
            <ui-text type="headline-m">Experimental features</ui-text>
            <settings-option>
              Never-Consent Automatic Action Type
              <span slot="description">
                Chooses the default behavior for cookie consent notices.
              </span>
              <ui-input slot="action">
                <select
                  value="${options.autoconsent.autoAction}"
                  onchange="${html.set(options, 'autoconsent.autoAction')}"
                >
                  <option value="optOut">Opt out</option>
                  <option value="optIn">Opt in</option>
                  <option value="">None</option>
                </select>
              </ui-input>
            </settings-option>
          </div>
          <div layout="column gap:3" translate="no">
            <ui-text type="headline-m">Developer tools</ui-text>
            <div layout="column gap">
              <settings-toggle value="${config.enabled}" onchange="${html.set(config, 'enabled')}">
                Remote Configuration
                <span slot="description">
                  Updated at: ${longDateFormatter.format(new Date(config.updatedAt))}
                </span>
                ${config.enabled &&
                html`
                  <div layout="column gap:3" slot="card-footer" translate="no">
                    <div layout="column gap">
                      <ui-text type="label-m">Flags</ui-text>
                      <div layout="row:wrap gap:2:1">
                        ${FLAGS.map(
                          (name) => html`
                            <label layout="row items:center gap">
                              <ui-input>
                                <input
                                  type="checkbox"
                                  checked="${config.hasFlag(name)}"
                                  onchange="${toggleFlag(name)}"
                                />
                              </ui-input>
                              <ui-text type="body-xs" color="tertiary"> ${name} </ui-text>
                            </label>
                          `,
                        )}
                      </div>
                    </div>
                    <div layout="column gap">
                      <ui-text type="label-m">Domains</ui-text>
                      <div layout="row:wrap gap">
                        ${Object.entries(config.domains)
                          .filter(([, d]) => d.actions.length)
                          .map(
                            ([name, d]) =>
                              html`<ui-text
                                color="secondary"
                                onclick="${createClearConfigDomain(name)}"
                                style="cursor: pointer;"
                              >
                                ${name} (${d.actions.join(', ')})
                              </ui-text>`,
                          ) || 'none'}
                      </div>
                    </div>
                    <div layout="row gap">
                      <ui-button
                        onclick="${forceConfigSync}"
                        layout="shrink:0 self:start"
                        size="s"
                        slot="footer"
                      >
                        <button>
                          <ui-icon name="refresh" layout="size:2"></ui-icon>
                          Force sync
                        </button>
                      </ui-button>
                      <ui-button
                        layout="shrink:0 self:start"
                        onclick="${testConfigDomain}"
                        size="s"
                      >
                        <button>Add domain</button>
                      </ui-button>
                    </div>
                  </div>
                `}
              </settings-toggle>
              <settings-toggle
                value="${options.fixesFilters}"
                onchange="${html.set(options, 'fixesFilters')}"
                data-qa="toggle:fixes-filters"
              >
                Ghostery specific fixes
                <span slot="description">
                  Controls whether Ghostery applies specific fixes for certain websites to improve
                  compatibility.
                </span>
              </settings-toggle>
            </div>
            <settings-card static layout="column gap:2">
              ${store.ready(notifications) &&
              html`
                <div layout="column gap items:start" translate="no">
                  <ui-text type="headline-s">Notifications</ui-text>
                  <div layout="row:wrap gap">
                    ${notifications.length === 0 &&
                    html`
                      <ui-text type="body-m" color="secondary" translate="no">
                        No notifications shown yet
                      </ui-text>
                    `}
                    ${notifications.map(
                      ({ id, shown, lastShownAt }) => html`
                        <ui-text type="body-m" color="secondary">
                          <ui-text type="label-m">${id}:</ui-text>
                          ${shown}
                          ${!!lastShownAt && `(${longDateFormatter.format(new Date(lastShownAt))})`}
                        </ui-text>
                      `,
                    )}
                  </div>
                </div>
              `}
              ${html.resolve(
                telemetry.getStorage().then(
                  (storage) => html`
                    <div layout="column gap items:start" translate="no">
                      <ui-text type="headline-s">Attribution</ui-text>
                      <div layout="column gap:0.5">
                        <ui-text type="body-m" color="secondary">
                          <ui-text type="label-m">Install date:</ui-text>
                          <span data-qa="text:install-date">${storage.installDate || 'N/A'}</span>
                        </ui-text>
                        <ui-text type="body-m" color="secondary">
                          <ui-text type="label-m">Source:</ui-text>
                          <span data-qa="text:utm-source">${storage.utm_source || 'N/A'}</span>
                        </ui-text>
                        <ui-text type="body-m" color="secondary">
                          <ui-text type="label-m">Campaign:</ui-text>
                          <span data-qa="text:utm-campaign">${storage.utm_campaign || 'N/A'}</span>
                        </ui-text>
                      </div>
                    </div>
                  `,
                ),
              )}
              ${__CHROMIUM__ &&
              html`
                <div layout="column gap items:start" translate="no">
                  <ui-text type="headline-s">Enabled DNR rulesets</ui-text>
                  <ui-text type="body-xs" color="tertiary">
                    The below list is not reactive to changes made in the extension - use refresh
                    button
                  </ui-text>
                  <div layout="row gap">
                    ${html.resolve(
                      chrome.declarativeNetRequest
                        .getEnabledRulesets()
                        .then(
                          (rules) => html`
                            ${rules.map((r) => html`<ui-text>${r}</ui-text>`)}
                            ${!rules.length &&
                            html`<ui-text translate="no"> No rulesets enabled... </ui-text>`}
                          `,
                        ),
                    )}
                  </div>
                  <ui-button onclick="${refresh}" layout="shrink:0" size="s">
                    <button>Refresh</button>
                  </ui-button>
                </div>
              `}
              ${store.ready(resources) &&
              html`
                <div layout="column gap" translate="no">
                  <ui-text type="headline-s">Resource Checksums</ui-text>
                  <div>
                    ${Object.entries(resources.checksums).map(
                      ([key, value]) => html`
                        <ui-text type="body-m" color="secondary"> ${key}: ${value} </ui-text>
                      `,
                    )}
                  </div>
                </div>
              `}
            </settings-card>
            <settings-card static layout="column gap:2">
              <ui-text type="headline-s">Actions</ui-text>
              <div layout="row gap items:start">
                <ui-button onclick="${clearStorage}" layout="shrink:0" size="s">
                  <button>
                    <ui-icon name="trash" layout="size:2"></ui-icon>
                    Clear storage
                  </button>
                </ui-button>
              </div>
            </settings-card>
          </div>
        </section>
      `}
      <div layout="column" translate="no">
        <div onclick="${refresh}">
          <ui-text type="body-m" color="tertiary" style="user-select: none;"> v${VERSION} </ui-text>
        </div>
      </div>
    </template>
  `,
};
