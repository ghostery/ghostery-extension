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

import { openTabWithUrl } from '/utils/tabs.js';
import Options from '/store/options.js';

const VERSION = chrome.runtime.getManifest().version;

export async function asyncAction(event, promise) {
  const button = event.currentTarget;
  const el = button.children[0];
  const origText = el.textContent;

  button.disabled = true;
  el.innerHTML = '...';

  const response = await promise;

  if (response) {
    el.innerHTML = response;

    setTimeout(() => {
      button.disabled = false;
      el.innerHTML = origText;
    }, 2000);
  } else {
    button.disabled = false;
    el.innerHTML = origText;
  }
}

function clearStorage(host, event) {
  asyncAction(event, chrome.runtime.sendMessage({ action: 'clearStorage' }));
}

function updateEngines(host, event) {
  asyncAction(event, chrome.runtime.sendMessage({ action: 'updateEngines' }));
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
  visible: false,
  content: ({ visible, counter }) => html`
    <template layout="column gap:3">
      ${(visible || counter > 5) &&
      html`
        <section layout="column gap:3" translate="no">
          <ui-text type="headline-m">Developer tools</ui-text>
          <div layout="column gap">
            <ui-text type="headline-s">Storage actions</ui-text>
            <div layout="row gap items:start">
              <ui-button
                size="small"
                type="outline"
                onclick="${clearStorage}"
                layout="shrink:0"
              >
                <button>Clear local storage</button>
              </ui-button>
              <ui-button
                size="small"
                type="outline"
                onclick="${updateEngines}"
                layout="shrink:0"
              >
                <button>Update engines</button>
              </ui-button>
            </div>
          </div>
          <ui-line></ui-line>
          ${chrome.declarativeNetRequest &&
          html`
            <div layout="column gap items:start" translate="no">
              <ui-text type="headline-s">Enabled DNR rulesets</ui-text>
              <ui-text type="body-xs" color="gray-400">
                The below list is not reactive to changes made in the extension
                - use refresh button
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
              <ui-button
                size="small"
                type="outline"
                onclick="${refresh}"
                layout="shrink:0"
              >
                <button>Refresh</button>
              </ui-button>
            </div>
            <ui-line></ui-line>
          `}
          <div layout="column gap" translate="no">
            <ui-text type="headline-s">Custom filters</ui-text>
            <div layout="column gap:0.5">
              <ui-text type="body-xs">
                Create your own ad-blocking rules to customize your Ghostery
                experience.
              </ui-text>
              <ui-text type="body-xs" color="gray-600" underline>
                <a
                  href="https://adguard.com/kb/general/ad-filtering/create-own-filters/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Learn more on how to create them
                </a>
              </ui-text>
            </div>
            <gh-settings-custom-filters></gh-settings-custom-filters>
          </div>
        </section>
      `}
      <div layout="row center gap:2">
        <ui-text
          type="label-s"
          color="gray-300"
          onclick="${refresh}"
          translate="no"
        >
          v${VERSION}
        </ui-text>
        <ui-text type="label-s" color="gray-300">
          <a href="/licenses.html" onclick="${openTabWithUrl}">
            Software Licenses
          </a>
        </ui-text>
      </div>
    </template>
  `,
};
