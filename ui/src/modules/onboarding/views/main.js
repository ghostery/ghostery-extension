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

import { define, html, msg, router, store } from 'hybrids';

import Whotracksme from './whotracksme.js';
import Privacy from './privacy.js';
import Skip from './skip.js';
import OutroSuccess from './outro-success.js';

const Form = {
  protection: true,
  terms: store.value(true, (val, _, { protection }) => val || !protection),
};

export async function submit(host, event) {
  router.resolve(event, store.submit(host.form));
}

export default define({
  [router.connect]: { stack: [Skip, Whotracksme, Privacy] },
  tag: 'ui-onboarding-main-view',
  form: store(Form, { draft: true }),
  scroll: {
    get: ({ form, content }) => {
      if (form.terms) {
        return content().querySelector('button[type="submit"]');
      } else if (form.protection) {
        return content().querySelector('#terms-card');
      }
      return null;
    },
    observe(host, value) {
      if (value) {
        requestAnimationFrame(() => {
          value.scrollIntoView({ behavior: 'smooth', block: 'end' });
        });
      }
    },
  },
  content: ({ form }) => html`
    <template layout="row grow">
      <form
        onsubmit="${submit}"
        action="${router.url(OutroSuccess)}"
        layout="grow column gap"
      >
        <ui-card id="form">
          <div layout="column gap:5">
            <section layout="block:center">
              <ui-text type="body-xl" layout="margin:bottom:2">
                Welcome to Ghostery
              </ui-text>
              <ui-text type="display-l">
                Enable Ghostery to get started
              </ui-text>
            </section>

            <ui-onboarding-protection
              id="info"
              class="${{ protection: form.protection }}"
            >
              <label slot="header">
                <section
                  layout="row items:center gap:2 margin:2"
                  layout@768px="margin:3"
                >
                  <ui-text type="display-s" layout="grow">
                    ${form.protection
                      ? html`Ghostery enabled`
                      : html`Ghostery disabled`}
                  </ui-text>
                  <ui-onboarding-toggle>
                    <input
                      type="checkbox"
                      checked="${form.protection}"
                      onchange="${html.set(form, 'protection')}"
                    />
                  </ui-onboarding-toggle>
                </section>
              </label>
              <div
                layout="grid:max|1|max gap:2 items:center:start margin:2"
                layout@768px="margin:3"
              >
                <ui-icon name="tracking" layout="size:3"></ui-icon>
                <ui-text type="headline-xs">Trackers</ui-text>
                <ui-onboarding-badge enabled="${form.protection}">
                  ${form.protection ? html`Blocked` : html`Unblocked`}
                </ui-onboarding-badge>
              </div>
              <div
                layout="grid:max|1|max gap:2 items:center:start margin:2"
                layout@768px="margin:3"
              >
                <ui-icon name="ads" layout="size:3"></ui-icon>
                <ui-text type="headline-xs"><!-- | onboarding -->Ads</ui-text>
                <ui-onboarding-badge enabled="${form.protection}">
                  ${form.protection ? html`Blocked` : html`Unblocked`}
                </ui-onboarding-badge>
              </div>
              <div
                layout="grid:max|1|max gap:2 items:center:start margin:2"
                layout@768px="margin:3"
              >
                <ui-icon name="autoconsent" layout="size:3"></ui-icon>
                <ui-text type="headline-xs">All Popups</ui-text>
                <ui-onboarding-badge enabled="${form.protection}">
                  ${form.protection ? html`Blocked` : html`Unblocked`}
                </ui-onboarding-badge>
              </div>
            </ui-onboarding-protection>
          </div>
        </ui-card>
        <ui-card type="narrow" id="terms-card" hidden="${!form.protection}">
          <div layout="column gap:3">
            <label layout="grid:min|1:min|min gap:2:0.5 items:start">
              <ui-onboarding-checkbox layout="area::2">
                <input
                  type="checkbox"
                  checked="${form.terms}"
                  onchange="${html.set(form, 'terms')}"
                />
              </ui-onboarding-checkbox>

              <ui-text type="display-s">Accept terms</ui-text>

              <ui-text>
                <ui-onboarding-terms>
                  ${msg.html`I agree to send non-personal information to <a href="${router.url(
                    Whotracksme,
                  )}">Ghostery’s WhoTracks.Me</a>, and I accept the <a href="${router.url(
                    Privacy,
                  )}">Ghostery Privacy Policy</a>`}
                </ui-onboarding-terms>
              </ui-text>
            </label>
            ${form.terms &&
            html`
              <ui-button layout@768px="self:end">
                <button type="submit">
                  <ui-icon name="ghosty"></ui-icon>
                  Done! Go with Ghosty!
                </button>
              </ui-button>
            `}
          </div>
        </ui-card>
        <ui-card type="transparent" layout="grow row items:end content:end">
          <ui-button type="outline">
            <a href="${router.url(Skip)}">Skip</a>
          </ui-button>
        </ui-card>
      </form>
    </template>
  `,
});
