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
import Preview from './views/preview.js';

const ACCOUNT_URL = 'https://account.ghostery.com/';
const SIGNON_URL = 'https://signon.ghostery.com/';

export default {
  stack: router([Privacy, Websites, Whotracksme, Preview]),
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
        html`
          <a
            class="bottom"
            href="${session.user ? ACCOUNT_URL : SIGNON_URL}"
            target="_blank"
            slot="nav"
          >
            ${session.user
              ? html`
                  <ui-icon name="user" color="nav"></ui-icon>
                  <span layout@992px="hidden">My Account</span>
                  <div
                    layout="hidden"
                    layout@992px="column margin:left:2px width::0"
                  >
                    <div>${session.name}</div>
                    <ui-text type="body-m" color="gray-600" ellipsis>
                      ${session.email}
                    </ui-text>
                  </div>
                `
              : html`
                  <ui-icon name="user" color="nav"></ui-icon>
                  Sign in
                `}
          </a>
        `}
        ${stack}
      </ui-settings-layout>
    </template>
  `.css`
    html, body { height: 100%; }
  `,
};
