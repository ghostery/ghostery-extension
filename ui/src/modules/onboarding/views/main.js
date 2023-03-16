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
              <ui-text type="display-m" layout="margin:bottom:5">
                Enable Ghostery to get started
              </ui-text>
            </section>
          </div>
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
            <div
              layout="column-reverse gap"
              layout@480px="row content:space-between"
            >
              <ui-button type="outline">
                <a href="${router.url(Skip)}">Cancel</a>
              </ui-button>
              <ui-button type="error" disabled="${!form.terms}">
                <button type="submit">
                  <ui-icon name="ghosty"></ui-icon>
                  Enable Ghostery
                </button>
              </ui-button>
            </div>
          </div>
        </ui-card>
      </form>
    </template>
  `,
});
