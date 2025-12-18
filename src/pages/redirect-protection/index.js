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

import { mount, html, store } from 'hybrids';

import '/ui/index.js';

import Options from '/store/options.js';
import Target from './store/target.js';

function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    chrome.tabs.getCurrent((tab) => {
      if (tab) chrome.tabs.remove(tab.id);
    });
  }
}

async function allow({ target }) {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'allowRedirect',
      url: target.url,
    });

    if (response?.success) {
      location.replace(target.url);
    }
  } catch (error) {
    console.error('[redirect-protection] Failed to allow redirect:', error);
  }
}

async function alwaysAllow({ target }) {
  await store.set(Options, {
    redirectProtection: { disabled: { [target.hostname]: true } },
  });
  // Wait for the background to process the change
  await chrome.runtime.sendMessage({ action: 'idle' });

  location.replace(target.url);
}

const RedirectProtection = {
  target: store(Target),
  render: ({ target }) => html`
    <template layout="grid height::100%">
      <ui-page-layout>
        <ui-card
          layout="block:center column gap width:::640px"
          layout@768px="padding:5"
        >
          <ui-text type="display-s" layout="margin:bottom:2">
            Tracking Redirect Alert
          </ui-text>

          <ui-text>
            This page was prevented from loading because it's a known tracking
            URL
          </ui-text>

          ${
            store.ready(target) &&
            target.url &&
            html`
              ${target.hostname &&
              html`
                <ui-text layout="margin:bottom">
                  <a
                    class="link"
                    href="${target.url}"
                    data-qa="link:redirect-protection:hostname"
                  >
                    ${target.hostname}
                  </a>
                </ui-text>
              `}

              <ui-text layout="margin:bottom:2">
                To visit this page anyway, you need to allow it.
              </ui-text>

              <div layout="column self:center gap:1">
                <ui-button
                  type="primary"
                  onclick="${allow}"
                  data-qa="button:redirect-protection:allow"
                >
                  <button>Allow</button>
                </ui-button>

                <div layout="row:wrap gap:1">
                  <ui-button
                    onclick="${goBack}"
                    data-qa="button:redirect-protection:back"
                    layout="grow"
                  >
                    <button>Back</button>
                  </ui-button>
                  ${target.hostname &&
                  html`
                    <ui-button
                      onclick="${alwaysAllow}"
                      data-qa="button:redirect-protection:always-allow"
                      layout="grow"
                    >
                      <button>Always allow from this domain</button>
                    </ui-button>
                  `}
                </div>
              </div>
            `
          }
          </div>
        </ui-card>
      </ui-page-layout>
    </template>
  `,
};

mount(document.body, RedirectProtection);
