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

import blockage from '../illustrations/blockage.js';

import Whotracksme from './whotracksme.js';
import Privacy from './privacy.js';
import Skip from './skip.js';
import OutroSuccess from './outro-success.js';

const Form = {
  protection: false,
  terms: store.value(false, (val, _, { protection }) => val || !protection),
};

export async function submit(host, event) {
  router.resolve(event, store.submit(host.form));
}

export default define({
  [router.connect]: { stack: [Skip, Whotracksme, Privacy] },
  tag: 'ui-onboarding-main-view',
  form: store(Form, { draft: true }),
  scroll: {
    get: ({ form, render }) => {
      if (form.terms) {
        return render().querySelector('#submit-button');
      } else if (form.protection) {
        return render().querySelector('#terms-input');
      }
      return null;
    },
    observe(host, value) {
      if (value) {
        requestAnimationFrame(() => {
          value.scrollIntoView({ behavior: 'smooth' });
        });
      }
    },
  },
  render: ({ form }) => html`
    <ui-onboarding-layout>
      <form onsubmit="${submit}" action="${router.url(OutroSuccess)}">
        <ui-onboarding-card type="full-desktop" id="form">
          <div slot="illustration">${blockage}</div>
          <div>
            <section id="protection">
              <ui-text type="display-xl"
                >Enable Ghostery to get started</ui-text
              >
              <label id="protection-input">
                <ui-text type="display-m">
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
              </label>
            </section>
            <section id="info" class="${{ protection: form.protection }}">
              <div>
                <ui-icon name="tracking"></ui-icon>
                <ui-text type="headline-s">Trackers</ui-text>
                <ui-text type="display-s" class="badge">
                  ${form.protection ? html`Blocked` : html`Unblocked`}
                </ui-text>
              </div>
              <div>
                <ui-icon name="ads"></ui-icon>
                <ui-text type="headline-s">Ads</ui-text>
                <ui-text type="display-s" class="badge">
                  ${form.protection ? html`Blocked` : html`Unblocked`}
                </ui-text>
              </div>
              <div>
                <ui-icon name="annoyances"></ui-icon>
                <ui-text type="headline-s">All Popups</ui-text>
                <ui-text type="display-s" class="badge">
                  ${form.protection ? html`Blocked` : html`Unblocked`}
                </ui-text>
              </div>
            </section>
          </div>
        </ui-onboarding-card>
        ${form.protection
          ? html`
              <ui-onboarding-card>
                <div id="accept-terms">
                  <label id="terms-input">
                    <ui-onboarding-checkbox>
                      <input
                        type="checkbox"
                        checked="${form.terms}"
                        onchange="${html.set(form, 'terms')}"
                      />
                    </ui-onboarding-checkbox>

                    <ui-text type="display-m">Accept terms</ui-text>

                    <ui-text type="body-m" color="gray-300">
                      ${msg.html`I agree to send non-personal information to <a href="${router.url(
                        Whotracksme,
                      )}">WhoTracks.Me</a> and I accept the Ghostery <a href="${router.url(
                        Privacy,
                      )}">Privacy Policy</a>`}
                    </ui-text>
                  </label>
                  ${form.terms &&
                  html`
                    <ui-onboarding-button id="submit-button">
                      <button type="submit">
                        <ui-icon name="ghosty"></ui-icon> All set! go with
                        ghosty!
                      </button>
                    </ui-onboarding-button>
                  `}
                </div>
              </ui-onboarding-card>
            `
          : html`
              <ui-onboarding-card id="skip" type="transparent">
                <ui-onboarding-button type="secondary">
                  <a href="${router.url(Skip)}">Skip</a>
                </ui-onboarding-button>
              </ui-onboarding-card>
            `}
      </form>
    </ui-onboarding-layout>
  `.css`
    :host {
      display: block;
      height: 100%;
    }

    form {
      display: flex;
      flex-flow: column;
      gap: 8px;
    }

    #form section {
      padding: 20px;
      border: 2px solid var(--ui-color-gray-800);
    }

    #protection {
      display: grid;
      gap: 16px;
      border-bottom: none;
      border-radius: 8px 8px 0 0;
    }

    #protection-input {
      display: grid;
      align-items: center;
      grid: 1fr / 1fr min-content;
    }

    #info {
      border-top: none;
      border-radius: 0 0 8px 8px;
      background: var(--ui-color-gray-800);
    }

    #info div {
      display: grid;
      gap: 0 16px;
      grid-template-columns: max-content 1fr min-content;
      align-items: center;
      border-bottom: 1px solid var(--ui-color-gray-700);
      padding: 12px 0;
    }

    #info div:first-child {
      padding-top: 0;
    }

    #info div:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    #info .badge {
      background: var(--ui-color-error-400);
      padding: 4px;
      border-radius: 4px;
      font-size: 16px;
      line-height: 16px;
    }

    #info.protection .badge {
      background: var(--ui-color-success-500);
    }

    #skip {
      display: flex;
      justify-content: end;
    }

    #accept-terms {
      display: grid;
      gap: 24px;
    }

    #terms-input {
      display: grid;
      gap: 4px 16px;
      align-items: start;
      grid: min-content min-content / min-content 1fr;
    }

    #terms-input ui-onboarding-checkbox {
      grid-row: 1 / 3;
    }

    @media screen and (min-width: 992px) {
      form {
        width: 100%;
        max-width: 640px;
        margin: 0 auto;
      }

      #illustration {
        display: flex;
        justify-content: center;
        margin-bottom: 24px;
      }

      #skip {
        flex: 1;
        align-items: flex-end;
        padding: var(--ui-onboarding-layout-padding) 0 0;
      }

      #accept-terms ui-onboarding-button {
        justify-self: flex-end;
      }

      #terms-input {
        column-gap: 24px;
      }
    }
  `,
});
