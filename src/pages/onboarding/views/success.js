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

import { html, msg, store } from 'hybrids';

import { lang } from '/ui/labels.js';

import Options, { MODE_DEFAULT, MODE_ZAP } from '/store/options.js';
import { getBrowser, isMobile } from '/utils/browser-info.js';

import modeZapScreenshotUrl from '/ui/assets/lottie-mode-zap.json?url';
import browserBraveIcon from '/ui/assets/browser-brave.svg';
import browserChromeIcon from '/ui/assets/browser-chrome.svg';
import browserEdgeIcon from '/ui/assets/browser-edge.svg';
import browserFirefoxIcon from '/ui/assets/browser-firefox.svg';
import browserOperaIcon from '/ui/assets/browser-opera.svg';
import browserSafariIcon from '/ui/assets/browser-safari.svg';

import installedImage from '../assets/installed.svg';
import qrCodeImage from '../assets/qr-code.svg';

import pinExtensionChrome from '../assets/pin-extension-chrome.jpg';
import pinExtensionEdge from '../assets/pin-extension-edge.jpg';
import pinExtensionOpera from '../assets/pin-extension-opera.jpg';

// The logo is placed over the 48px slot at (72, 9) of the 320x144 installed illustration
const BROWSER_ICONS = {
  brave: browserBraveIcon,
  edge: browserEdgeIcon,
  firefox: browserFirefoxIcon,
  opera: browserOperaIcon,
  safari: browserSafariIcon,
};

const browserIcon = BROWSER_ICONS[getBrowser().name] || browserChromeIcon;

async function startBrowsing() {
  const tab = await chrome.tabs.getCurrent();

  // On desktop, open the browser's new tab page, so the user can start browsing right away.
  // On mobile, closing the tab brings the user back to the previous tab or the tab overview.
  if (!isMobile()) await chrome.tabs.create({});

  chrome.tabs.remove(tab.id);
}

async function getPinExtension() {
  if (!chrome.action.getUserSettings) return null;

  // Some browsers (e.g. Chrome 157+) pin the extension to the toolbar automatically
  const { isOnToolbar } = await chrome.action.getUserSettings();
  if (isOnToolbar) return null;

  const { name } = getBrowser();

  if (name === 'chrome' || name === 'yandex' || name === 'oculus') {
    return { url: pinExtensionChrome, type: 'chrome' };
  } else if (name === 'edge' && !isMobile()) {
    return { url: pinExtensionEdge, type: 'edge' };
  } else if (name === 'opera') {
    return { url: pinExtensionOpera, type: 'opera' };
  } else if (name === 'brave') {
    return { url: pinExtensionChrome, type: 'brave' };
  }

  return null;
}

export default {
  options: store(Options),
  render: {
    connect: () => {
      chrome.runtime.sendMessage({ action: 'telemetry:ping', event: 'install_complete' });
    },
    value: ({ options }) => html`
      <template layout="column gap:2 width:full::480px">
        <ui-card data-qa="view:success">
          <section layout="block:center column gap:2">
            ${
              options.mode === MODE_DEFAULT &&
              html`
                <div
                  layout="relative self:center width:267px"
                  layout@520px="width:320px margin:top:2"
                >
                  <img src="${installedImage}" layout="block width:full" />
                  <img src="${browserIcon}" layout="absolute top:6.25% left:22.5% width:15%" />
                </div>
                <div layout="column gap:0.5">
                  <ui-text type="display-s">Setup Successful</ui-text>
                  <ui-text color="secondary" layout="self:center width:::336px">
                    Ghostery is all set to stop trackers in their tracks and protect your privacy
                    while browsing!
                  </ui-text>
                </div>
              `
            }
            ${
              options.mode === MODE_ZAP &&
              html`
                <ui-text type="display-s">You’re ready to block ads</ui-text>
                <div
                  layout="block:left column gap padding:1:5 relative"
                  layout@520px="block:center grid:3 padding:1:0"
                >
                  <div
                    layout="hidden"
                    layout@520px="block absolute top:28px left:100px right:100px height:4px"
                    style="
                    border-top:3px dashed var(--background-primary);
                    background:
                      linear-gradient(var(--background-primary) 0 0) padding-box,
                      linear-gradient(to right, var(--background-brand-primary), var(--background-danger-primary), var(--background-success-primary));
                  "
                  ></div>
                  <div layout="row items:center gap" layout@520px="column">
                    <onboarding-step number="1" icon="websites" type="brand"></onboarding-step>
                    <ui-text type="label-m">Open a site</ui-text>
                  </div>
                  <div layout="row items:center gap" layout@520px="column">
                    <onboarding-step number="2" icon="block-m" type="danger"></onboarding-step>
                    ${
                      lang === 'en'
                        ? html`<ui-text type="label-m" translate="no"> Zap ads once </ui-text>`
                        : html`<ui-text type="label-m">Block ads once</ui-text>`
                    }
                  </div>
                  <div layout="row items:center gap" layout@520px="column">
                    <onboarding-step number="3" icon="trust-m" type="success"></onboarding-step>
                    <ui-text type="label-m">Site stays ad-free every time you visit</ui-text>
                  </div>
                </div>
                <div layout="row center">
                  <ui-lottie
                    src="${modeZapScreenshotUrl}"
                    autoplay
                    style="border-radius:8px"
                    layout="ratio:83/45 width:100%::400px overflow"
                  ></ui-lottie>
                </div>
              `
            }
            <ui-button type="primary" layout="self:center" data-qa="button:start-browsing">
              <button onclick="${startBrowsing}">Start browsing</button>
            </ui-button>
          </section>
        </ui-card>
        ${
          __CHROMIUM__ &&
          getPinExtension().then(
            (pinExtension) =>
              pinExtension &&
              html`
                <ui-card>
                  <section layout="column center gap:3">
                    <div layout="block:center column gap" layout@520px="padding:1:2:0">
                      <ui-text type="display-s">Pin extension for easy access</ui-text>
                      <ui-text layout="padding:0:2">
                        ${msg.html`Click the puzzle icon next to the search bar and <strong>pin Ghostery</strong> to your toolbar.`}
                      </ui-text>
                    </div>
                    <img
                      src="${pinExtension.url}"
                      layout="width:full::400px"
                      style="border-radius:8px; overflow:hidden;"
                    />
                  </section>
                </ui-card>
                <onboarding-pin-it browser="${pinExtension.type}">Pin it here</onboarding-pin-it>
              `,
          )
        }
        ${
          options.mode === MODE_DEFAULT &&
          html`
            <ui-card>
              <section layout="column items:center gap:3" layout@520px="padding:2:0">
                <div layout="block:center column gap">
                  <ui-text type="display-s">
                    ${isMobile() ? msg`Seeing ads on other device?` : msg`Seeing ads on your phone?`}
                  </ui-text>
                  <ui-text color="secondary">
                    ${
                      isMobile()
                        ? msg`Scan to block ads on another phone or tablet, or visit ghostery.com to block ads on your computer. Free.`
                        : msg`Scan to block them on your phone or tablet. Free.`
                    }
                  </ui-text>
                </div>
                <img
                  src="${qrCodeImage}"
                  layout="size:20"
                  style="border-radius:8px; overflow:hidden;"
                />
              </section>
            </ui-card>
          `
        }
      </template>
    `,
  },
};
