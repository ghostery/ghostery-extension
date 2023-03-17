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

import { html, msg, store, router } from 'hybrids';

const Form = {
  protection: true,
  terms: store.value(true, (val, _, { protection }) => val || !protection),
};

function closeIframe(host, event) {
  // Disconnect host from the DOM to clean up the router
  host.parentElement.removeChild(host);

  window.parent.postMessage(
    {
      type: 'ghostery-contextual-onboarding-close-iframe',
      reload: event.detail.reload,
    },
    '*',
  );
}

(function updateIframeHeight() {
  const resizeObserver = new ResizeObserver(() => {
    window.parent.postMessage(
      {
        type: 'ghostery-contextual-onboarding-resize-iframe',
        height: document.body.clientHeight,
      },
      '*',
    );
  });
  resizeObserver.observe(document.body, {
    box: 'border-box',
  });
})();

export default {
  tag: 'ui-onboarding-iframe',
  form: store(Form, { draft: true }),
  categories: {
    get: (host, value = []) => value,
    set: (host, value) => value || [],
  },
  content: ({ form, categories }) => html`
    <template layout="grid::min|1|min">
      <ui-iframe-card
        header="${msg`Enable Ghostery to get started`}"
        oncloseiframe="${closeIframe}"
      >
        <section layout="row margin:2 gap:2">
          <div layout="area:1:2">
            <ui-tracker-wheel
              categories="${categories}"
              layout="size:8"
            ></ui-tracker-wheel>
          </div>
          <div layout="column grow shrink gap">
            <ui-text type="label-m">
              ${msg.html`Trackers detected by Ghostery on this
              website:&nbsp;${categories.length}`}
            </ui-text>
          </div>
        </section>

        <section layout="padding:2">
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
                    'Whotracksme',
                  )}">Ghostery’s WhoTracks.Me</a>, and I accept the <a href="${router.url(
                    'Privacy',
                  )}">Ghostery Privacy Policy</a>`}
                </ui-onboarding-terms>
              </ui-text>
            </label>
            <div
              layout="row content:space-between"
              layout@480px="row content:space-between"
            >
              <ui-button type="outline">
                <a href="${router.url('Skip')}">Cancel</a>
              </ui-button>
              <ui-button type="error" disabled="${!form.terms}">
                <button type="submit">
                  <ui-icon name="ghosty"></ui-icon>
                  Enable Ghostery
                </button>
              </ui-button>
            </div>
          </div>
        </section>
      </ui-iframe-card>
    </template>
  `,
};
