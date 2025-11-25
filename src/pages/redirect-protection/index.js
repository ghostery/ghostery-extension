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
import { themeToggle } from '/ui/theme.js';

function goBack() {
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

async function allow(host) {
  if (!host.targetUrl) return;

  await chrome.runtime.sendMessage({
    action: 'allowRedirect',
    url: host.targetUrl,
  });

  location.replace(host.targetUrl);
}

async function alwaysAllow(host) {
  if (!host.hostname) return;

  await chrome.runtime.sendMessage({
    action: 'disableRedirectProtection',
    hostname: host.hostname,
  });

  location.replace(host.targetUrl);
}

const App = {
  targetUrl: {
    value: '',
    connect: async (host) => {
      const params = new URLSearchParams(window.location.search);
      const encodedUrl = params.get('url');

      if (encodedUrl) {
        try {
          const url = atob(encodedUrl);
          host.targetUrl = url;
        } catch (e) {
          console.error('[redirect-protection] Failed to decode URL:', e);
        }
      } else if (__PLATFORM__ !== 'firefox') {
        try {
          const tab = await chrome.tabs.getCurrent();

          if (tab && tab.id) {
            for (let i = 0; i < 5; i++) {
              const result = await chrome.storage.session.get(
                `redirectUrl_${tab.id}`,
              );
              const url = result[`redirectUrl_${tab.id}`];

              if (url) {
                host.targetUrl = url;
                return;
              }

              await new Promise((resolve) => setTimeout(resolve, 50));
            }
          }
        } catch (e) {
          console.error('[redirect-protection] Failed to get URL:', e);
        }
      }
    },
  },
  hostname: ({ targetUrl }) => {
    if (!targetUrl) return '';
    try {
      return new URL(targetUrl).hostname;
    } catch (e) {
      return '';
    }
  },
  render: ({ targetUrl, hostname }) => html`
    <template layout="block overflow">
      <style>
        .background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #f0f0ff 0%, #e8e8ff 100%);
          z-index: -1;
        }

        .ellipse {
          position: absolute;
          border-radius: 50%;
          background: rgba(99, 102, 241, 0.1);
          filter: blur(60px);
        }

        .ellipse-1 {
          width: 335px;
          height: 287px;
          top: -50px;
          left: 192px;
        }

        .ellipse-2 {
          width: 450px;
          height: 352px;
          top: 252px;
          left: 728px;
        }

        .container {
          min-height: 100vh;
          padding: 2rem 1.5rem 0;
        }

        .header {
          color: var(--color-brand-secondary);
        }

        .modal {
          background: var(--background-primary);
          color: var(--color-primary);
          border-radius: 16px;
          padding: 32px 16px;
          box-shadow: 0 4px 24px var(--shadow-panel);
          max-width: 375px;
          width: 100%;
        }

        .link {
          color: var(--color-brand-secondary);
          text-decoration: none;
          word-break: break-all;
        }

        @media (min-width: 768px) {
          .container {
            padding: 2rem 2rem 0;
          }

          .modal {
            padding: 40px 24px;
            max-width: 600px;
          }
        }

        @media (min-width: 1024px) {
          .modal {
            padding: 40px;
            max-width: 720px;
          }
        }

        @media (prefers-color-scheme: dark) {
          .background {
            background: var(--background-secondary);
          }

          .ellipse {
            display: none;
          }
        }
      </style>

      <div class="background">
        <div class="ellipse ellipse-1"></div>
        <div class="ellipse ellipse-2"></div>
      </div>

      <div class="container" layout="column items:center">
        <div class="header" layout="margin:2:0">
          <ui-icon name="logo-with-slogan" layout="height:3"></ui-icon>
        </div>

        <div class="modal" layout="column gap:2">
          <ui-text type="headline-l" layout="block:center">
            Tracking Redirect Alert
          </ui-text>

          ${targetUrl
            ? html`
                <ui-text type="body-m" layout="block:center">
                  This page was prevented from loading because it's a known
                  tracking domain:
                </ui-text>

                <div layout="block:center margin:1:0">
                  <a class="link" href="${targetUrl}">${hostname}</a>
                </div>

                <ui-text type="body-m" layout="block:center">
                  To visit this page anyway, you need to allow it.
                </ui-text>

                <div layout="column items:center margin:top:2">
                  <div layout="column gap:1">
                    <ui-button type="primary" onclick="${allow}">
                      <button layout="width:::100%">Allow</button>
                    </ui-button>

                    <div layout="row gap:1">
                      <ui-button onclick="${goBack}">
                        <button style="min-width: 80px;">Back</button>
                      </ui-button>
                      <ui-button onclick="${alwaysAllow}">
                        <button layout="grow">
                          Always allow from this domain
                        </button>
                      </ui-button>
                    </div>
                  </div>
                </div>
              `
            : html`
                <ui-text type="body-m" layout="block:center">
                  Loading...
                </ui-text>
              `}
        </div>
      </div>
    </template>
  `.use(themeToggle),
};

mount(document.body, App);
