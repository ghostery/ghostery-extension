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

import { html, msg, dispatch } from 'hybrids';

function closeIframe(host) {
  dispatch(host, 'closeiframe', {
    bubbles: true,
    detail: { reload: host.enabled },
  });
}

export default {
  enabled: false,
  content: ({ enabled }) => html`
    <template layout="block">
      <ui-autoconsent-card layout="row padding:2 padding:right:4 gap:2">
        <ui-icon name="ghosty" color="primary-500" layout="size:4"></ui-icon>
        <div layout="column gap:1.5">
          <div layout="column gap">
            <ui-text type="display-s">
              ${enabled
                ? msg`Never-Consent is Enabled`
                : msg`Never-Consent is Disabled`}
            </ui-text>
            <ui-text>
              ${msg.html`You can always change these settings in the&nbsp;<strong>Ghostery control panel</strong>.`}
            </ui-text>
          </div>
          <ui-button type="outline" size="small">
            <button onclick="${closeIframe}">OK</button>
          </ui-button>
        </div>
      </ui-autoconsent-card>
    </template>
  `,
};
