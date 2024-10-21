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

export default {
  counter: 0,
  options: store(Options),
  updatedAt: ({ options }) =>
    store.ready(options) &&
    options.filtersUpdatedAt &&
    new Date(options.filtersUpdatedAt).toLocaleDateString(
      chrome.i18n.getUILanguage(),
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
    ),
  visible: false,
  render: ({ visible, counter, updatedAt }) => html`
    <template layout="column gap:3">
      ${
        (visible || counter > 5) &&
        html`
          <section layout="column gap:3" translate="no">
            <ui-text type="headline-m">Developer tools</ui-text>
            <div layout="column gap">
              <ui-text type="headline-s">Storage actions</ui-text>
              <div layout="row gap items:start">
                <ui-button onclick="${clearStorage}" layout="shrink:0">
                  <button>Clear local storage</button>
                </ui-button>
              </div>
            </div>
            <ui-line></ui-line>
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
          </section>
        `
      }
      <div layout="column gap center">
        <div layout="row center gap:2">
          <ui-text
            type="label-s"
            color="gray-300"
            onclick="${refresh}"
            translate="no"
          >
            v${VERSION}
          </ui-text>
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
