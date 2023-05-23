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

export default {
  stack: router([Privacy, Websites, Whotracksme, Account, Preview]),
  session: store(Session),
  content: ({ stack }) => html`
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
        <a
          class="bottom"
          href="${router.url(Account, { scrollToTop: true })}"
          class="${{ active: router.active(Account) }}"
          slot="nav"
        >
          <ui-icon name="user" color="nav" layout="size:3"></ui-icon>
          My Account
        </a>
        ${stack}
      </ui-settings-layout>
    </template>
  `.css`
    html, body { height: 100%; }
  `,
};
