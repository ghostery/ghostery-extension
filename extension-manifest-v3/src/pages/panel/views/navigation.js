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

import { html, msg, router, store } from 'hybrids';

import Session from '/store/session.js';
import { openTabWithUrl } from '/utils/tabs.js';

const MENU = [
  { header: msg`Ghostery settings` },
  {
    icon: () => 'shield-menu',
    label: msg`Privacy protection`,
    href: chrome.runtime.getURL(
      '/pages/settings/index.html#@gh-settings-privacy',
    ),
  },
  {
    icon: () => 'websites',
    label: msg`Websites`,
    href: chrome.runtime.getURL(
      '/pages/settings/index.html#@gh-settings-websites',
    ),
  },
  {
    icon: () => 'block-m',
    label: msg`Trackers`,
    href: chrome.runtime.getURL(
      '/pages/settings/index.html#@gh-settings-trackers',
    ),
  },
  {
    icon: () => 'wtm',
    label: 'WhoTracks.Me',
    href: chrome.runtime.getURL(
      '/pages/settings/index.html#@gh-settings-whotracksme',
    ),
  },
  {
    icon: (session) => (session.contributor ? 'contributor' : 'user'),
    label: msg`My Account`,
    href: chrome.runtime.getURL(
      '/pages/settings/index.html#@gh-settings-account',
    ),
  },
  {},
  {
    icon: () => 'report',
    label: msg`Report a broken page`,
    href: 'https://www.ghostery.com/support?utm_source=gbe',
  },
  {
    icon: () => 'send',
    label: msg`Submit a new tracker`,
    href: 'https://www.ghostery.com/submit-a-tracker?utm_source=gbe',
  },
  {
    icon: () => 'thumb-up',
    label: msg`Send feedback`,
    href: 'https://www.ghostery.com/feedback?utm_source=gbe',
  },
  {
    icon: () => 'help',
    label: msg`Contact support`,
    href: 'https://www.ghostery.com/support?utm_source=gbe',
  },
  {},
  {
    icon: () => 'info-menu',
    label: msg`About`,
    href: 'https://www.ghostery.com/?utm_source=gbe',
  },
];

if (__PLATFORM__ !== 'safari') {
  MENU.splice(7, 0, {
    icon: () => 'heart',
    label: msg`Become a Contributor`,
    href: 'https://www.ghostery.com/become-a-contributor?utm_source=gbe',
  });
}

export default {
  session: store(Session),
  render: ({ session }) => html`
    <template layout="grid grow">
      <ui-panel-header>
        Menu
        <ui-action slot="actions">
          <a href="${router.backUrl()}">
            <ui-icon name="close" color="gray-900" layout="size:3"></ui-icon>
          </a>
        </ui-action>
      </ui-panel-header>
      <gh-panel-container>
        <div layout="column gap:0.5 padding:1:0">
          ${store.ready(session) &&
          html`
            ${MENU.filter(
              // Hide the "Become a Contributor" menu item if the user is already a contributor
              (_, i) =>
                __PLATFORM__ === 'safari' || i !== 7 || !session.contributor,
            ).map(({ icon, label, href, header }) =>
              label
                ? html`
                    <ui-text>
                      <a
                        href="${href}"
                        layout="block padding margin:0:1"
                        layout@390px="padding:1.5:1"
                        onclick="${openTabWithUrl}"
                      >
                        <gh-panel-menu-item icon="${icon(session)}">
                          ${label}
                        </gh-panel-menu-item>
                      </a>
                    </ui-text>
                  `
                : html`
                    ${header
                      ? html`<ui-text
                          type="label-s"
                          color="gray-500"
                          layout="padding:1:1:0 margin:0:1"
                        >
                          ${header.toUpperCase()}
                        </ui-text>`
                      : html`<ui-line></ui-line>`}
                  `,
            )}
          `}
        </div>
      </gh-panel-container>
    </template>
  `,
};
