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

import { mount, html } from 'hybrids';
import '/ui/index.js';

async function loadUrl(host) {
  const params = new URLSearchParams(window.location.search);
  const encodedUrl = params.get('url');

  if (encodedUrl) {
    // MV2: URL passed as base64-encoded query parameter
    try {
      const url = atob(encodedUrl);
      host.targetUrl = url;
      host.hostname = new URL(url).hostname;
    } catch (e) {
      console.error('[redirect-protection] Failed to decode URL:', e);
    }
  } else if (__PLATFORM__ !== 'firefox') {
    try {
      const tab = await chrome.tabs.getCurrent();
      console.info('[redirect-protection] Current tab ID:', tab?.id);

      if (tab && tab.id) {
        // Retry up to 5 times with 50ms delay to handle race condition
        for (let i = 0; i < 5; i++) {
          const result = await chrome.storage.session.get(`redirectUrl_${tab.id}`);
          const url = result[`redirectUrl_${tab.id}`];

          if (url) {
            host.targetUrl = url;
            host.hostname = new URL(url).hostname;
            console.info('[redirect-protection] Loaded URL:', url);
            return;
          }

          await new Promise(resolve => setTimeout(resolve, 50));
        }

        console.warn('[redirect-protection] No URL found in session storage for tab', tab.id);
      }
    } catch (e) {
      console.error('[redirect-protection] Failed to get URL:', e);
    }
  }
}

function goBack(host) {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    chrome.tabs.getCurrent((tab) => {
      if (tab) {
        chrome.tabs.remove(tab.id);
      }
    });
  }
}

async function continueAnyway(host) {
  if (!host.targetUrl) return;

  await chrome.runtime.sendMessage({
    action: 'allowRedirect',
    url: host.targetUrl,
  });

  location.replace(host.targetUrl);
}

async function trustSite(host) {
  if (!host.hostname) return;

  await chrome.runtime.sendMessage({
    action: 'disableRedirectProtection',
    hostname: host.hostname,
  });

  location.replace(host.targetUrl);
}

const App = {
  targetUrl: '',
  hostname: '',

  connect: loadUrl,

  render: ({ targetUrl, hostname }) => html`
    <template layout="block overflow">
      <div
        layout="column center gap:4"
        style="min-height: 100vh; padding: 2rem; background: var(--ui-color-layout);"
      >
        <div
          layout="column gap:2"
          style="max-width: 600px; background: var(--ui-color-white); border-radius: 16px; padding: 3rem; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);"
        >
          <div layout="column center gap:2">
            <ui-icon
              name="shield-alert"
              color="danger"
              layout="size:4"
            ></ui-icon>
            <ui-text type="headline-l" layout="block:center">
              Redirect Protection
            </ui-text>
          </div>

          <ui-text type="body-l" layout="block:center" color="gray-600">
            Ghostery blocked a redirect through a known tracking domain.
          </ui-text>

          ${targetUrl
            ? html`
                <div
                  layout="column gap"
                  style="background: var(--ui-color-gray-100); border-radius: 8px; padding: 1rem; margin: 1rem 0;"
                >
                  <ui-text type="label-s" color="gray-600">
                    Destination:
                  </ui-text>
                  <ui-text
                    type="body-s"
                    style="word-break: break-all; font-family: monospace;"
                  >
                    ${targetUrl}
                  </ui-text>
                </div>
              `
            : html`
                <div
                  layout="column gap"
                  style="background: var(--ui-color-gray-100); border-radius: 8px; padding: 1rem; margin: 1rem 0;"
                >
                  <ui-text type="body-s" color="gray-600">
                    Loading destination URL...
                  </ui-text>
                </div>
              `}

          <ui-text type="body-m" color="gray-700">
            Tracking redirects can expose your browsing activity to third
            parties. You can go back to safety or continue to the destination.
          </ui-text>

          <div layout="column gap:1.5" style="margin-top: 1rem;">
            <ui-button type="success" onclick="${goBack}">
              <button layout="width:::100%">
                <ui-icon name="arrow-left"></ui-icon>
                Go Back
              </button>
            </ui-button>

            <ui-button onclick="${continueAnyway}">
              <button layout="width:::100%">Continue Anyway</button>
            </ui-button>

            ${hostname
              ? html`
                  <ui-button type="transparent" onclick="${trustSite}">
                    <button layout="width:::100%">
                      <ui-text type="label-s" color="gray-600">
                        Trust ${hostname}
                      </ui-text>
                    </button>
                  </ui-button>
                `
              : ''}
          </div>

          <ui-text
            type="body-xs"
            color="gray-500"
            layout="block:center"
            style="margin-top: 1.5rem;"
          >
            You can manage redirect protection settings in Ghostery options.
          </ui-text>
        </div>
      </div>
    </template>
  `,
};

mount(document.body, App);
