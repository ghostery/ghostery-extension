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

import Account from '/store/account.js';

const MENU = [
  {
    icon: 'heart',
    label: msg`Become a contributor`,
    href: 'https://www.ghostery.com/become-a-contributor',
  },
  {},
  {
    icon: 'alert',
    label: msg`Report a broken page`,
    href: 'https://www.ghostery.com/support',
  },
  {
    icon: 'send',
    label: msg`Submit a new tracker`,
    href: 'https://www.ghostery.com/submit-a-tracker',
  },
  {
    icon: 'help',
    label: msg`Contact support`,
    href: 'https://www.ghostery.com/support',
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
    href: 'https://www.ghostery.com/',
  },
];

export default {
  account: store(Account),
  content: ({ account }) => html`
    <template layout="grid height:600px">
      <gh-panel-menu>
        <ui-panel-header slot="header">
          Menu
          <ui-action slot="actions">
            <a href="${router.backUrl({ scrollToTop: true })}">
              <ui-icon name="close" color="gray-900" layout="size:3"></ui-icon>
            </a>
          </ui-action>
        </ui-panel-header>
        <ui-text>
          <a
            href="${store.ready(account)
              ? 'https://account.ghostery.com/'
              : 'https://signon.ghostery.com/'}"
            target="_blank"
            layout="block margin:1:2"
          >
            <gh-panel-menu-item icon="user">
              ${store.ready(account) &&
              html`
                <div>${account.name}</div>
                <ui-text color="gray-600">${account.email}</ui-text>
              `}
              ${store.error(account) && html`Sign in`}
            </gh-panel-menu-item>
          </a>
        </ui-text>
        ${MENU.map(({ icon, label, href }) =>
          label
            ? html`
                <ui-text>
                  <a href="${href}" target="_blank" layout="block margin:1:2">
                    <gh-panel-menu-item icon="${icon}">
                      ${label}
                    </gh-panel-menu-item>
                  </a>
                </ui-text>
              `
            : html`<hr />`,
        )}
      </gh-panel-menu>
    </template>
  `,
};
