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

import { define, html, msg, router, dispatch } from 'hybrids';

function closeIframe(host) {
  dispatch(host, 'closeiframe', {
    bubbles: true,
    detail: { reload: host.enabled },
  });
}

export default define({
  tag: 'ui-autoconsent-confirm-view',
  enabled: false,
  content: ({ enabled }) => html`
    <template layout="column margin:3 gap:4">
      <div layout="column items:center gap margin:0:5">
        <ui-text type="display-s" layout="block:center">
          ${enabled
            ? msg`Never-Consent is Enabled`
            : msg`Never-Consent is Disabled`}
        </ui-text>
        <ui-text layout="block:center">
          ${msg.html`You can always change these settings in the&nbsp;<strong>Ghostery control panel</strong>.`}
        </ui-text>
      </div>
      <div layout="grid:2 gap:2">
        <ui-button type="outline" size="small">
          <a href="${router.backUrl()}">Back</a>
        </ui-button>
        <ui-button type="primary" size="small">
          <button onclick="${closeIframe}">OK</button>
        </ui-button>
      </div>
    </template>
  `,
});
