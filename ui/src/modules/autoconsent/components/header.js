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

import { define, html } from 'hybrids';

export default define({
  tag: 'ui-autoconsent-header',
  render: () => html`
    <template layout="row center">
      <ui-text
        type="display-2xs"
        color="primary-500"
        layout="row gap items:center margin"
      >
        <ui-icon name="ghosty" layout="block width:16px height:16px"></ui-icon>
        Never-Consent
      </ui-text>
    </template>
  `.css`
    :host {
      background: rgba(0, 174, 240, 0.15);
    }
    
    ui-text {
      background: white;
      border-radius: 16px;
      padding: 4px 10px;
    }
  `,
});
