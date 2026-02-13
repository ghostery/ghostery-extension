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

import { html, router, store } from 'hybrids';

import modeGhosteryScreenshotUrl from '/ui/assets/lottie-mode-default.json?url';
import modeZapScreenshotUrl from '/ui/assets/lottie-mode-zap.json?url';

import Options, { MODE_DEFAULT, MODE_ZAP } from '/store/options.js';
import { TERMS_AND_CONDITIONS_URL } from '/utils/urls.js';

import Success from './success.js';
import { lang } from '/ui/labels.js';

function selectMode(mode) {
  return (host, event) => {
    router.resolve(event, store.set(Options, { mode }));
  };
}

export default {
  [router.connect]: { stack: [Success] },
  render: () => html`
    <template layout="column gap:2 width:full::800px">
      <ui-card
        layout="contents gap:2"
        layout@390px="gap:3"
        layout@768px="column"
        data-qa="view:filtering-mode"
      >
        <section layout="block:center column gap" layout@390px="margin:2:0:1">
          <ui-text type="display-m" mobile-type="display-xs">
            Select filtering mode
          </ui-text>
          <ui-text type="body-m" mobile-type="body-s">
            Because no two people surf alike, we're giving you the power to pick
            how you want to experience the web.
          </ui-text>
        </section>
        <div layout="column gap" layout@768px="grid:2">
          <ui-action>
            <a
              href="${router.url(Success)}"
              onclick="${selectMode(MODE_DEFAULT)}"
              layout="grid"
              data-qa="button:filtering-mode:ghostery"
            >
              <ui-mode-radio id="mode-option-default" checked>
                <input type="radio" name="filtering-mode" checked />
                <ui-lottie
                  src="${modeGhosteryScreenshotUrl}"
                  layout="ratio:83/45 width:220px"
                  layout@768px="width:100%"
                  play-on-hover="mode-option-default"
                ></ui-lottie>
                <ui-icon
                  name="logo-in-box"
                  layout="width:83px"
                  layout@768px="width:138px"
                ></ui-icon>
                <ui-text>
                  We block it all for you - ads, trackers, distractions. Always
                  on when you browse.
                </ui-text>
                <ui-text type="label-s" slot="footer">
                  Best for full coverage and privacy enthusiasts.
                </ui-text>
              </ui-mode-radio>
            </a>
          </ui-action>
          <ui-text
            type="display-2xs"
            uppercase
            layout="block:center margin:0.5:0"
            layout@768px="hidden"
          >
            <!-- Ghostery mode "or" ZAP mode -->
            or
          </ui-text>
          <ui-action>
            <a
              href="${router.url(Success)}"
              onclick="${selectMode(MODE_ZAP)}"
              layout="grid"
              data-qa="button:filtering-mode:zap"
            >
              <ui-mode-radio id="mode-option-zap">
                <ui-lottie
                  src="${modeZapScreenshotUrl}"
                  layout="ratio:83/45 width:220px"
                  layout@768px="width:100%"
                  play-on-hover="mode-option-zap"
                ></ui-lottie>
                <ui-icon
                  name="logo-zap"
                  layout="width:83px"
                  layout@768px="width:116px"
                ></ui-icon>
                ${lang === 'en'
                  ? html`<ui-text translate="no">
                      You zap ads away on the sites you use. Zap once. They stay
                      ad-free every time you visit.
                    </ui-text>`
                  : html`<ui-text>
                      You block ads on the sites you use. Block once. They stay
                      ad-free every time you visit.
                    </ui-text>`}
                <ui-text type="label-s" slot="footer">
                  Best for beginners or sharing with family.
                </ui-text>
              </ui-mode-radio>
            </a>
          </ui-action>
        </div>
      </ui-card>
      <ui-button type="transparent" layout="self:center">
        <a href="${TERMS_AND_CONDITIONS_URL}" target="_blank">
          Terms & Conditions
        </a>
      </ui-button>
    </template>
  `,
};
