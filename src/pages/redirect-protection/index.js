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
import { themeToggle } from '/ui/theme.js';
import Options from '/store/options.js';

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

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'allowRedirect',
      url: host.targetUrl,
    });
    await chrome.runtime.sendMessage({ action: 'idle' });

    if (response?.success) {
      location.replace(host.targetUrl);
    }
  } catch (error) {
    console.error('[redirect-protection] Failed to allow redirect:', error);
  }
}

async function alwaysAllow(host) {
  if (!host.hostname) return;

  try {
    await store.set(Options, {
      redirectProtection: { disabled: { [host.hostname]: true } },
    });
    // needs to await twice as sendMessage arrives before chrome.storage.local listener fires
    await chrome.runtime.sendMessage({ action: 'idle' });
    await chrome.runtime.sendMessage({ action: 'idle' });
    location.replace(host.targetUrl);
  } catch (error) {
    console.error('[redirect-protection] Failed to disable protection:', error);
  }
}

const RedirectProtection = {
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
          const response = await chrome.runtime.sendMessage({
            action: 'getRedirectUrl',
          });

          if (response?.url) {
            host.targetUrl = response.url;
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
    } catch {
      return '';
    }
  },
  displayUrl: ({ targetUrl }) => {
    if (!targetUrl) return '';
    try {
      const url = new URL(targetUrl);
      // Return URL without scheme (e.g., "example.com/path" instead of "https://example.com/path")
      return url.host + url.pathname + url.search + url.hash;
    } catch {
      return '';
    }
  },
  render: ({ targetUrl, displayUrl }) =>
    html`
      <template layout="block overflow">
        <style>
          #bg {
            position: absolute;
            top: -250px;
            left: 50%;
            width: 1648px;
            height: 1525px;
            z-index: -1;
            transform: translateX(-50%);
          }

          #c-1 {
            position: absolute;
            left: 300px;
            top: 100px;
            width: 800px;
            height: 800px;
            background: radial-gradient(
              circle,
              #a1e4ff 0%,
              rgba(255, 255, 255, 0.1) 70%
            );
            opacity: 0.4;
          }

          #c-2 {
            position: absolute;
            left: 420px;
            top: 320px;
            width: 1200px;
            height: 1200px;
            background: radial-gradient(
              circle,
              #3751d5 0%,
              rgba(255, 255, 255, 0.1) 65%
            );
            opacity: 0.3;
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
            #bg {
              display: none;
            }
          }
        </style>

        <div id="bg">
          <div id="c-1"></div>
          <div id="c-2"></div>
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
                    tracking URL:
                  </ui-text>

                  <div layout="block:center margin:1:0">
                    <a class="link" href="${targetUrl}">${displayUrl}</a>
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

mount(document.body, RedirectProtection);
