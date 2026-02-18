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

import { mount, html, store } from 'hybrids';

import '/ui/index.js';

import Options from '/store/options.js';
import Target from './store/target.js';
import { WTM_PAGE_URL } from '/utils/urls.js';

function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    chrome.tabs.getCurrent((tab) => {
      if (tab) chrome.tabs.remove(tab.id);
    });
  }
}

async function proceed(host) {
  const { exception, target } = host;

  if (exception) {
    await store.set(Options, {
      redirectProtection: { exceptions: { [target.hostname]: true } },
    });
    // Wait for the background to process the change
    await chrome.runtime.sendMessage({ action: 'idle' });

    location.replace(target.url);
  } else {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'allowRedirect',
        url: target.url,
      });

      if (response?.success) {
        location.replace(target.url);
      }
    } catch (error) {
      console.error('[redirect-protection] Failed to allow redirect:', error);
    }
  }
}

const RedirectProtection = {
  target: store(Target),
  exception: false,
  render: ({ target, exception }) => html`
    <template layout="grid height::100%">
      <ui-page-layout>
        ${store.ready(target) &&
        html`
          <ui-card layout="block:center column gap width:::640px" layout@768px="padding:5">
            ${target.tracker &&
            html`
              <ui-text type="display-s" layout="margin:bottom:2"> Redirect Alert </ui-text>

              <ui-text>
                This page was prevented from loading due to a known tracking redirect to:
              </ui-text>

              <div layout="row center gap:0.5 margin:1:0">
                <ui-text
                  layout="width:::50"
                  type="label-m"
                  color="brand-primary"
                  ellipsis
                  data-qa="text:redirect-protection:url"
                >
                  ${target.url}
                </ui-text>

                <ui-tooltip autohide="5" delay="0">
                  <div slot="content" layout="block:left padding:1:0.5">
                    <ui-text type="label-s">
                      Learn more about ${target.tracker.name} on WhoTracks.Me
                    </ui-text>
                  </div>
                  <a href="${WTM_PAGE_URL}/trackers/${target.tracker.id}" target="_blank">
                    <ui-icon name="info" color="brand-primary"></ui-icon>
                  </a>
                </ui-tooltip>
              </div>

              <ui-text> To visit the intended page, you need to allow this redirect. </ui-text>
            `}
            ${!target.tracker &&
            html`
              <ui-text type="display-s" layout="margin:bottom:2"> Security Alert </ui-text>

              <ui-text>
                This page was prevented from loading because it may be malicious. The redirect
                destination is unknown and could pose a security or privacy risk:
              </ui-text>

              <ui-text
                layout="self:center margin:1:0 width:::50"
                type="label-m"
                color="brand-primary"
                ellipsis
                data-qa="text:redirect-protection:url"
              >
                ${target.url}
              </ui-text>

              <ui-text> For your safety, Ghostery blocked this page automatically. </ui-text>
            `}

            <div layout="column gap:2 margin:top:3">
              <label layout="block:left self:center row gap">
                <ui-input>
                  <input
                    type="checkbox"
                    checked="${exception}"
                    onchange="${html.set('exception')}"
                    data-qa="checkbox:redirect-protection:exception"
                  />
                </ui-input>
                <ui-text type="body-s" color="tertiary">
                  I understand the risk, don't warn me again about this site
                </ui-text>
              </label>
              <div layout="row:wrap gap:2 center">
                <ui-button
                  layout="width::16"
                  onclick="${goBack}"
                  data-qa="button:redirect-protection:back"
                >
                  <button>Back</button>
                </ui-button>
                ${target.url &&
                html`
                  <ui-button
                    type="primary"
                    layout="width::16"
                    onclick="${proceed}"
                    data-qa="button:redirect-protection:proceed"
                  >
                    <button>Proceed</button>
                  </ui-button>
                `}
              </div>
            </div>
          </ui-card>
        `}
      </ui-page-layout>
    </template>
  `,
};

mount(document.body, RedirectProtection);
