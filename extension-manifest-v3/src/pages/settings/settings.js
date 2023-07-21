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

import Options from '/store/options.js';
import Session from '/store/session.js';

import Privacy from './views/privacy.js';
import Websites from './views/websites.js';
import Whotracksme from './views/whotracksme.js';
import Account from './views/account.js';
import Preview from './views/preview.js';

import assets from './assets/index.js';

export default {
  stack: router([Privacy, Websites, Whotracksme, Account, Preview]),
  session: store(Session),
  content: ({ stack, session }) => html`
    <template layout="contents">
      <ui-settings-layout>
        <a
          href="${router.url(Privacy, { scrollToTop: true })}"
          class="${{ active: router.active(Privacy) }}"
          slot="nav"
        >
          <ui-icon name="shield-menu" color="nav" layout="size:3"></ui-icon>
          Privacy protection
        </a>
        ${!!Options.paused &&
        html`<a
          href="${router.url(Websites, { scrollToTop: true })}"
          class="${{ active: router.active(Websites) }}"
          slot="nav"
        >
          <ui-icon name="settings" color="nav" layout="size:3"></ui-icon>
          Websites
        </a>`}
        <a
          href="${router.url(Whotracksme, { scrollToTop: true })}"
          class="${{ active: router.active(Whotracksme) }}"
          slot="nav"
          translate="no"
        >
          <ui-icon name="wtm" color="nav" layout="size:3"></ui-icon>
          WhoTracks.Me
        </a>
        ${store.ready(session) &&
        !session.contributor &&
        html`
          <ui-settings-card
            layout="hidden"
            layout@992px="
              area::5/6 self:end:stretch
              margin:top:2 padding:2 gap content:center
              column
            "
            slot="nav"
          >
            <img
              src="${assets['hands']}"
              layout="size:12"
              alt="Contribution"
              slot="picture"
            />
            <div layout="column gap:0.5">
              <ui-text type="label-l" layout="block:center">
                Become a Contributor
              </ui-text>
              <ui-text type="body-s" color="gray-600" layout="block:center">
                Help Ghostery fight for a web where privacy is a basic human
                right.
              </ui-text>
              <ui-button layout="margin:top">
                <a
                  href="https://www.ghostery.com/become-a-contributor?utm_source=gbe"
                  target="_blank"
                >
                  Become a Contributor
                </a>
              </ui-button>
            </div>
          </ui-settings-card>
        `}
        <a
          href="${router.url(Account, { scrollToTop: true })}"
          class="${{ active: router.active(Account), bottom: true }}"
          slot="nav"
        >
          <ui-icon name="user" color="nav"></ui-icon>
          ${store.ready(session) && session.user
            ? html`
                <span layout@992px="hidden">My Account</span>
                <div
                  layout="hidden"
                  layout@992px="column margin:left:2px width::0"
                >
                  <div>My Account</div>
                  <ui-text type="body-m" ellipsis>${session.email}</ui-text>
                </div>
              `
            : html`My Account`}
        </a>
        ${stack}
        ${store.ready(session) &&
        !session.contributor &&
        html`
          <section
            layout="grid:1/1 grow items:end:stretch padding:0"
            layout@992px="hidden"
          >
            <ui-settings-card
              in-content
              layout="column items:center gap"
              layout@768px="row gap:5"
            >
              <img
                src="${assets['hands']}"
                layout="size:12"
                alt="Contribution"
                slot="picture"
              />
              <div
                layout="block:center column gap:0.5"
                layout@768px="block:left row grow gap:5 content:space-between"
              >
                <div layout="column gap:0.5">
                  <ui-text type="label-l" layout="">
                    Become a Contributor
                  </ui-text>
                  <ui-text type="body-s" color="gray-600">
                    Help Ghostery fight for a web where privacy is a basic human
                    right.
                  </ui-text>
                </div>
                <ui-button layout="grow margin:top">
                  <a
                    href="https://www.ghostery.com/become-a-contributor?utm_source=gbe"
                    target="_blank"
                  >
                    Become a Contributor
                  </a>
                </ui-button>
              </div>
            </ui-settings-card>
          </section>
        `}
      </ui-settings-layout>
    </template>
  `.css`
    html, body { height: 100%; }
  `,
};
