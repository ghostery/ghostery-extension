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

import { openTabWithUrl } from '/utils/tabs.js';
import { HOME_PAGE_URL } from '/utils/urls.js';

import Session from '/store/session.js';

import Privacy from './views/privacy.js';
import Websites from './views/websites.js';
import Whotracksme from './views/whotracksme.js';
import MyGhostery from './views/my-ghostery.js';
import Trackers from './views/trackers.js';

import assets from './assets/index.js';

export default {
  stack: router([Privacy, Websites, Whotracksme, MyGhostery, Trackers], {
    transition: true,
  }),
  session: store(Session),
  render: ({ stack, session }) =>
    html`
      <template layout="contents">
        <settings-layout data-qa="page:settings">
          <a
            href="${router.url(Privacy)}"
            class="${{ active: router.active(Privacy, { stack: true }) }}"
            slot="nav"
          >
            <ui-icon name="shield-menu" color="nav" layout="size:3"></ui-icon>
            Privacy protection
          </a>
          <a
            href="${router.url(Websites)}"
            class="${{
              active:
                router.active(Websites, { stack: true }) &&
                !router.active(Trackers, { stack: true }),
            }}"
            slot="nav"
          >
            <ui-icon name="websites" color="nav" layout="size:3"></ui-icon>
            Websites
          </a>
          <a
            href="${router.url(Trackers)}"
            class="${{
              active: router.active(Trackers, { stack: true }),
            }}"
            slot="nav"
          >
            <ui-icon name="block-m" color="nav" layout="size:3"></ui-icon>
            Trackers
          </a>
          <a
            href="${router.url(Whotracksme)}"
            class="${{ active: router.active(Whotracksme), wrap: true }}"
            slot="nav"
            translate="no"
            data-qa="button:whotracksme"
          >
            <ui-icon name="wtm" color="nav" layout="size:3"></ui-icon>
            WhoTracks.Me
          </a>

          <a
            href="${router.url(MyGhostery)}"
            class="${{ active: router.active(MyGhostery), bottom: true }}"
            slot="nav"
          >
            ${store.ready(session) && session.user
              ? html`
                  ${session.contributor
                    ? html`<ui-icon name="contributor"></ui-icon>`
                    : html`<ui-icon name="user" color="nav"></ui-icon>`}
                  <span layout@992px="hidden">My Ghostery</span>
                  <div
                    layout="hidden"
                    layout@992px="column margin:left:2px width::0"
                  >
                    <div>My Ghostery</div>
                    <ui-text type="body-m" ellipsis>${session.email}</ui-text>
                  </div>
                `
              : html`<ui-icon name="user" color="nav"></ui-icon> My Ghostery`}
          </a>
          ${__PLATFORM__ !== 'safari' &&
          store.ready(session) &&
          session.enabled &&
          html`
            <settings-card
              layout="hidden"
              layout@992px="
              area::6/7 self:end:stretch
              margin:top:2 padding:2 gap content:center
              column
            "
              slot="nav"
            >
              ${session.contributor
                ? html`
                    <img
                      src="${assets.contributor_badge}"
                      layout="size:12"
                      alt="Contribution"
                      slot="picture"
                    />
                    <div layout="column gap:0.5">
                      <ui-text type="label-l" layout="block:center">
                        You are awesome!
                      </ui-text>
                      <ui-text
                        type="body-s"
                        color="secondary"
                        layout="block:center"
                      >
                        Thank you for your support in Ghostery's fight for a web
                        where privacy is a basic human right!
                      </ui-text>
                    </div>
                  `
                : html`
                    <img
                      src="${assets.hands}"
                      layout="size:12"
                      alt="Contribution"
                      slot="picture"
                    />
                    <div layout="column gap:0.5">
                      <ui-text type="label-l" layout="block:center">
                        Become a Contributor
                      </ui-text>
                      <ui-text
                        type="body-s"
                        color="secondary"
                        layout="block:center"
                      >
                        Help Ghostery fight for a web where privacy is a basic
                        human right.
                      </ui-text>
                      <ui-button type="primary" layout="margin:top">
                        <a
                          href="${HOME_PAGE_URL}/become-a-contributor?utm_source=gbe&utm_campaign=settings-becomeacontributor"
                          onclick="${openTabWithUrl}"
                        >
                          Become a Contributor
                        </a>
                      </ui-button>
                    </div>
                  `}
            </settings-card>
          `}
          <div layout="column grow height::0 view:main">${stack}</div>
        </settings-layout>
      </template>
    `.use(html.transition),
};
