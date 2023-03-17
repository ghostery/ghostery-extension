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

import { html, msg, router } from 'hybrids';

import Home from './home.js';

function closeIframe(host, event) {
  // Disconnect host from the DOM to clean up the router
  host.parentElement.removeChild(host);

  window.parent.postMessage(
    { type: 'ghostery-autoconsent-close-iframe', reload: event.detail.reload },
    '*',
  );
}

(function updateIframeHeight() {
  const resizeObserver = new ResizeObserver(() => {
    window.parent.postMessage(
      {
        type: 'ghostery-autoconsent-resize-iframe',
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
  tag: 'ui-autoconsent',
  stack: router([Home]),
  categories: {
    get: (host, value = []) => value,
    set: (host, value) => value || [],
  },
  content: ({ stack, categories }) => html`
    <template layout="grid::min|1|min">
      <ui-iframe-card
        header="${msg`Never-Consent`}"
        oncloseiframe="${closeIframe}"
      >
        ${stack}
      </ui-iframe-card>
      ${router.active(Home) &&
      html`
        <ui-iframe-card layout="margin:top:0.5">
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
              <ui-text type="body-s">
                By using Never-Consent you let website owners know that you’re
                against tracking!
                <a
                  href="https://www.ghostery.com/blog/never-consent-by-ghostery-new-feature-removing-annoying-cookie-pop-ups-automates-interaction-with-consent-dialogs"
                  target="_blank"
                >
                  Learn more
                </a>
              </ui-text>
            </div>
          </section>
        </ui-iframe-card>
      `}
    </template>
  `,
};
