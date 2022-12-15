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

import { html, define, router } from 'hybrids';

import Privacy from './privacy.js';
import Website from './website.js';
import Whotracksme from './whotracksme.js';

export default define({
  tag: 'gh-settings',
  stack: router([Privacy, Website, Whotracksme]),
  content: ({ stack }) => html`
    <template layout="grid height:100%">
      <ui-settings-layout>
        <a
          href="${router.url(Privacy)}"
          class="${{ active: router.active(Privacy) }}"
          slot="nav"
        >
          <ui-icon name="shield"></ui-icon> Privacy Protection
        </a>
        <a
          href="${router.url(Website)}"
          class="${{ active: router.active(Website) }}"
          slot="nav"
        >
          <ui-icon name="settings"></ui-icon> Website Settings
        </a>
        <a
          href="${router.url(Whotracksme)}"
          class="${{ active: router.active(Whotracksme) }}"
          slot="nav"
        >
          <ui-icon name="wtm"></ui-icon> WhoTracks.Me
        </a>
        <a href="https://signon.ghostery.com/" target="_blank" slot="nav">
          <ui-icon name="user"></ui-icon> Sign in
        </a>
        ${stack}
      </ui-settings-layout>
    </template>
  `.css`
    html, body { height: 100%; }
  `,
});
