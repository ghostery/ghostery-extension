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
import { SIGNON_PAGE_URL } from '/utils/api.js';
import { openTabWithUrl } from '/utils/tabs.js';

const MENU = [
  {},
  {
    icon: 'alert',
    label: msg`Report a broken page`,
    href: 'https://www.ghostery.com/support?utm_source=gbe',
  },
  {
    icon: 'send',
    label: msg`Submit a new tracker`,
    href: 'https://www.ghostery.com/submit-a-tracker?utm_source=gbe',
  },
  {
    icon: 'help',
    label: msg`Contact support`,
    href: 'https://www.ghostery.com/support?utm_source=gbe',
  },
  {},
  {
    icon: 'settings',
    label: msg`Ghostery settings`,
    href: chrome.runtime.getURL('/pages/settings/index.html'),
  },
  {
    icon: 'info-menu',
    label: msg`About`,
    href: 'https://www.ghostery.com/?utm_source=gbe',
  },
];

if (__PLATFORM__ !== 'safari') {
  MENU.unshift({
    icon: 'heart',
    label: msg`Become a Contributor`,
    href: 'https://www.ghostery.com/become-a-contributor?utm_source=gbe',
  });
}

export default {
  session: store(Session),
  content: ({ session }) => html`
    <template layout="grid">
      <ui-panel-header layout="fixed top left width:full">
        Menu
        <ui-action slot="actions">
          <a href="${router.backUrl()}">
            <ui-icon name="close" color="gray-900" layout="size:3"></ui-icon>
          </a>
        </ui-action>
      </ui-panel-header>
      <div layout="column gap padding:bottom margin:top:8">
        ${store.ready(session) &&
        html`
          <ui-text>
            <a
              href="${session.user
                ? chrome.runtime.getURL('/pages/settings/index.html#account')
                : SIGNON_PAGE_URL}"
              target="_blank"
              layout="block padding margin:0:1"
              onclick="${openTabWithUrl}"
            >
              <gh-panel-menu-item icon="user">
                ${session.user
                  ? html`
                      <div>${session.name}</div>
                      <ui-text color="gray-600">${session.email}</ui-text>
                    `
                  : html`Sign in`}
              </gh-panel-menu-item>
            </a>
          </ui-text>
          ${MENU.filter(
            // Hide the "Become a Contributor" menu item if the user is already a contributor
            (_, i) => i !== 0 || (i === 0 && !session.contributor),
          ).map(({ icon, label, href }) =>
            label
              ? html`
                  <ui-text>
                    <a
                      href="${href}"
                      layout="block padding margin:0:1"
                      onclick="${openTabWithUrl}"
                    >
                      <gh-panel-menu-item icon="${icon}">
                        ${label}
                      </gh-panel-menu-item>
                    </a>
                  </ui-text>
                `
              : html`<ui-line></ui-line>`,
          )}
        `}
      </div>
    </template>
  `,
};
