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

import { openTabWithUrl } from '/utils/tabs.js';
import Options from '/store/options.js';

const VERSION = chrome.runtime.getManifest().version;

async function asyncAction(event, promise, complete = '') {
  const button = event.currentTarget;
  const el = button.children[0];
  const origText = el.textContent;

  button.disabled = true;
  await promise;

  if (complete) {
    el.innerHTML = complete;

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
  asyncAction(
    event,
    chrome.runtime.sendMessage({ action: 'clearStorage' }),
    'Storage cleared',
  );
}

function refresh(host) {
  host.counter += 1;
}

export default {
  counter: 0,
  options: store(Options),
  content: ({ counter }) => html`
    <template layout="column gap:3">
      ${counter >= 5 &&
      html`
        <section layout="column gap:3" translate="no">
          <ui-text type="headline-m">Developer tools</ui-text>
          <div layout="column gap">
            <div layout="column gap items:start">
              <ui-text type="headline-s">Clear extension storage</ui-text>
              <ui-button
                size="small"
                type="outline"
                onclick="${clearStorage}"
                layout="shrink:0"
              >
                <button>Clear storage</button>
              </ui-button>
            </div>
          </div>
          ${chrome.declarativeNetRequest &&
          html`
            <div layout="column gap items:start">
              <ui-text type="headline-s">Enabled DNR rulesets</ui-text>
              <ui-text type="body-xs" color="gray-400">
                The below list is not reactive to changes made in the extension,
                use refresh button
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
          `}
        </section>
      `}
      <div layout="row center gap:2">
        <ui-text
          type="label-s"
          color="gray-300"
          onclick="${html.set('counter', counter + 1)}"
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
