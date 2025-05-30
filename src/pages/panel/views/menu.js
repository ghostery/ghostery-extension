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
import TabStats from '/store/tab-stats.js';

import { openTabWithUrl } from '/utils/tabs.js';

import ReportForm from './report-form.js';

export default {
  options: store(Options),
  session: store(Session),
  stats: store(TabStats),
  render: ({ options, session, stats }) => html`
    <template layout="grid grow">
      <ui-header>
        <ui-text type="label-m">Menu</ui-text>
        <ui-action slot="actions">
          <a href="${router.backUrl()}">
            <ui-icon name="close" color="primary" layout="size:3"></ui-icon>
          </a>
        </ui-action>
      </ui-header>
      <panel-container>
        ${store.ready(options, stats) &&
        html`
          <div layout="column gap:0.5 padding:1:0">
            <ui-text
              type="label-s"
              color="secondary"
              uppercase
              layout="padding:1:1:0 margin:0:1"
            >
              Ghostery settings
            </ui-text>

            <panel-menu-item
              href="${chrome.runtime.getURL(
                '/pages/settings/index.html#@settings-privacy',
              )}"
              icon="shield-menu"
            >
              Privacy protection
            </panel-menu-item>
            <panel-menu-item
              href="${chrome.runtime.getURL(
                '/pages/settings/index.html#@settings-websites',
              )}"
              icon="websites"
            >
              Websites
            </panel-menu-item>
            <panel-menu-item
              href="${chrome.runtime.getURL(
                '/pages/settings/index.html#@settings-trackers',
              )}"
              icon="block-m"
            >
              Trackers
            </panel-menu-item>
            <panel-menu-item
              href="${chrome.runtime.getURL(
                '/pages/settings/index.html#@settings-whotracksme',
              )}"
              icon="wtm"
              translate="no"
            >
              WhoTracks.Me
            </panel-menu-item>
            <panel-menu-item
              href="${chrome.runtime.getURL(
                '/pages/settings/index.html#@settings-my-ghostery',
              )}"
              icon="${(store.ready(session) &&
                session.contributor &&
                'contributor') ||
              'user'}"
            >
              <div layout="column">
                <span>My Ghostery</span>
                ${store.ready(session) &&
                (session.name || session.email) &&
                html`
                  <ui-text type="body-xs" color="inherit">
                    ${session.name || session.email}
                  </ui-text>
                `}
              </div>
            </panel-menu-item>

            ${__PLATFORM__ !== 'safari' &&
            store.ready(session) &&
            session.enabled &&
            !session.contributor &&
            html`
              <ui-button type="outline-primary" layout="margin:1:1.5">
                <a
                  href="https://www.ghostery.com/become-a-contributor?utm_source=gbe&utm_campaign=menu-becomeacontributor"
                  onclick="${openTabWithUrl}"
                >
                  <ui-icon name="heart"></ui-icon>
                  Become a Contributor
                </a>
              </ui-button>
            `}

            <ui-line></ui-line>

            <ui-text
              type="label-s"
              color="secondary"
              uppercase
              layout="padding:1:1:0 margin:0:1"
            >
              Support
            </ui-text>

            ${stats.hostname &&
            html`
              <panel-menu-item
                href="${router.url(ReportForm)}"
                icon="report"
                internal
              >
                Report a broken page
              </panel-menu-item>
            `}

            <panel-menu-item
              href="https://www.ghostery.com/submit-a-tracker?utm_source=gbe&utm_campaign=menu-submittracker"
              icon="send"
              suffix-icon="link-external-m"
            >
              Submit a new tracker
            </panel-menu-item>

            <panel-menu-item
              href="https://www.ghostery.com/support?utm_source=gbe&utm_campaign=menu-contact"
              icon="help"
              suffix-icon="link-external-m"
            >
              Contact support
            </panel-menu-item>

            <ui-line></ui-line>

            <ui-text
              type="label-s"
              color="secondary"
              uppercase
              layout="padding:1:1:0 margin:0:1"
            >
              About
            </ui-text>

            <panel-menu-item
              href="https://www.ghostery.com/?utm_source=gbe&utm_campaign=menu-website"
              icon="ghosty-m"
              suffix-icon="link-external-m"
            >
              Website
            </panel-menu-item>

            <panel-menu-item
              href="${__PLATFORM__ === 'firefox'
                ? 'https://addons.mozilla.org/firefox/addon/ghostery/privacy/'
                : 'https://www.ghostery.com/privacy-policy?utm_source=gbe&utm_campaign=menu-privacypolicy'}"
              icon="privacy-m"
              suffix-icon="link-external-m"
            >
              Privacy Policy
            </panel-menu-item>

            <panel-menu-item
              href="https://www.ghostery.com/privacy/ghostery-terms-and-conditions/?utm_source=gbe&utm_campaign=menu-terms"
              icon="doc-m"
              suffix-icon="link-external-m"
            >
              Terms & Conditions
            </panel-menu-item>

            <panel-menu-item
              href="https://www.ghostery.com/privacy/imprint?utm_source=gbe&utm_campaign=menu-imprint"
              icon="imprint-m"
              suffix-icon="link-external-m"
              translate="no"
            >
              Imprint
            </panel-menu-item>

            <panel-menu-item
              href="${chrome.runtime.getURL('/static_pages/licenses.html')}"
              icon="license-m"
              suffix-icon="link-external-m"
              data-qa="button:licenses"
            >
              Software Licenses
            </panel-menu-item>
          </div>
        `}
      </panel-container>
    </template>
  `,
};
