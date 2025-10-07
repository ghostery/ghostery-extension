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
import TabStats from '/store/tab-stats.js';

import { openTabWithUrl } from '/utils/tabs.js';
import { BECOME_A_CONTRIBUTOR_PAGE_URL } from '/utils/urls.js';

import ReportCategory from './report-category.js';

export default {
  options: store(Options),
  stats: store(TabStats),
  render: ({ options, stats }) => html`
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
        ${store.ready(options) &&
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
              icon="user"
            >
              My Ghostery
            </panel-menu-item>

            <ui-button type="outline-primary" layout="margin:1:1.5">
              <a
                href="${BECOME_A_CONTRIBUTOR_PAGE_URL}?utm_source=gbe&utm_campaign=menu-becomeacontributor"
                onclick="${openTabWithUrl}"
              >
                <ui-icon name="heart"></ui-icon>
                Become a Contributor
              </a>
            </ui-button>

            <ui-line></ui-line>

            <ui-text
              type="label-s"
              color="secondary"
              uppercase
              layout="padding:1:1:0 margin:0:1"
            >
              Support
            </ui-text>

            ${store.ready(stats) &&
            html`
              <panel-menu-item
                href="${router.url(ReportCategory)}"
                icon="report"
                internal
              >
                Report an issue
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
