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

async function getTarget() {
  const params = new URLSearchParams(window.location.search);
  const encodedUrl = params.get('url');

  let targetUrl = '';

  if (encodedUrl) {
    try {
      targetUrl = atob(encodedUrl);
    } catch (e) {
      console.error('[redirect-protection] Failed to decode URL:', e);
    }
  } else if (__PLATFORM__ !== 'firefox') {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'getRedirectUrl',
      });
      if (response?.url) {
        targetUrl = response.url;
      }
    } catch (e) {
      console.error('[redirect-protection] Failed to get URL:', e);
    }
  }

  if (!targetUrl) {
    return { targetUrl: '', hostname: '' };
  }

  try {
    const url = new URL(targetUrl);
    return {
      targetUrl,
      hostname: url.hostname,
    };
  } catch {
    return { targetUrl, hostname: '' };
  }
}

async function allow(host) {
  const { targetUrl } = await host.target;
  if (!targetUrl) return;

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'allowRedirect',
      url: targetUrl,
    });
    await chrome.runtime.sendMessage({ action: 'idle' });

    if (response?.success) {
      location.replace(targetUrl);
    }
  } catch (error) {
    console.error('[redirect-protection] Failed to allow redirect:', error);
  }
}

async function alwaysAllow(host) {
  const { targetUrl, hostname } = await host.target;
  if (!hostname) return;

  const response = await chrome.runtime.sendMessage({
    action: 'alwaysAllowRedirect',
    hostname,
  });
  await chrome.runtime.sendMessage({ action: 'idle' });

  if (response?.success) {
    location.replace(targetUrl);
  } else {
    console.error(
      '[redirect-protection] Failed to disable protection:',
      response?.error,
    );
  }
}

const RedirectProtection = {
  target: getTarget,
  render: ({ target }) =>
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

            ${html.resolve(
              target.then(({ targetUrl, hostname }) =>
                targetUrl
                  ? html`
                      <ui-text type="body-m" layout="block:center">
                        This page was prevented from loading because it's a
                        known tracking URL:
                      </ui-text>

                      <div layout="block:center margin:1:0">
                        <a
                          class="link"
                          href="${targetUrl}"
                          data-qa="link:redirect-protection:hostname"
                        >
                          ${hostname}
                        </a>
                      </div>

                      <ui-text type="body-m" layout="block:center">
                        To visit this page anyway, you need to allow it.
                      </ui-text>

                      <div layout="column items:center margin:top:2">
                        <div layout="column gap:1">
                          <ui-button type="primary" onclick="${allow}">
                            <button
                              layout="width:::100%"
                              data-qa="button:redirect-protection:allow"
                            >
                              Allow
                            </button>
                          </ui-button>

                          <div layout="row gap:1">
                            <ui-button onclick="${goBack}">
                              <button
                                style="min-width: 80px;"
                                data-qa="button:redirect-protection:back"
                              >
                                Back
                              </button>
                            </ui-button>
                            <ui-button onclick="${alwaysAllow}">
                              <button
                                layout="grow"
                                data-qa="button:redirect-protection:always-allow"
                              >
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
                    `,
              ),
            )}
          </div>
        </div>
      </template>
    `.use(themeToggle),
};

mount(document.body, RedirectProtection);
