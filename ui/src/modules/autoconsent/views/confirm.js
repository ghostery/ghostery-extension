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

function closeIframe(reload) {
  window.parent.postMessage(
    { type: 'ghostery-autoconsent-close-iframe', reload },
    '*',
  );
}

export default define({
  tag: 'ui-autoconsent-confirm-view',
  enabled: false,
  content: ({ enabled }) => html`
    <template layout="column margin:3 gap:4">
      <div layout="column items:center gap margin:0:7">
        <ui-text type="display-s" color="gray-800">
          ${enabled
            ? msg`Never-Consent is Enabled`
            : msg`Never-Consent is Disabled`}
        </ui-text>
        <ui-text type="body-s" color="gray-800" layout="block:center">
          ${msg.html`You can always change these settings in the&nbsp;<strong>Ghostery control panel</strong>.`}
        </ui-text>
      </div>
      <div layout="grid:2 gap:2">
        <ui-button type="outline-light" size="small">
          <a href="${router.url(Home)}">Back</a>
        </ui-button>
        <ui-button type="primary" size="small">
          <button onclick="${() => closeIframe(enabled)}">OK</button>
        </ui-button>
      </div>
    </template>
  `,
});
