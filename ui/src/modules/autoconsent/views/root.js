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
import Confirm from './confirm.js';

export default define({
  tag: 'ui-autoconsent',
  stack: router([Home, Confirm]),
  categories: {
    get: (host, value = []) => value,
    set: (host, value) => value || [],
  },
  content: ({ stack, categories }) => html`
    <template layout="grid::min|1|min">
      <ui-autoconsent-card>
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
              <ui-text type="label-s" color="gray-700">
                ${msg.html`Trackers detected by Ghostery on this
                website:&nbsp;${categories.length}`}
              </ui-text>
              <ui-text type="body-xs" color="gray-600">
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
