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

import { define, html, msg, router } from 'hybrids';

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

export default define({
  tag: 'ui-autoconsent',
  stack: router([Home]),
  categories: {
    get: (host, value = []) => value,
    set: (host, value) => value || [],
  },
  content: ({ stack, categories }) => html`
    <template layout="grid::min|1|min">
      <ui-autoconsent-card oncloseiframe="${closeIframe}">
        <ui-autoconsent-header></ui-autoconsent-header>
        ${stack}
      </ui-autoconsent-card>
      ${router.active(Home) &&
      html`
        <ui-autoconsent-card layout="margin:top:0.5">
          <section layout="row margin:2 gap:2">
            <div layout="area:1:2">
              <ui-tracker-wheel
                size="64"
                categories="${categories}"
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
        </ui-autoconsent-card>
      `}
    </template>
  `,
});
