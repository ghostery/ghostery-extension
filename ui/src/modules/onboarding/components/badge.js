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
  tag: 'ui-onboarding-badge',
  enabled: false,
  render: () => html`
    <template layout="block">
      <ui-text type="display-s" color="white"><slot></slot></ui-text>
    </template>
  `.css`
    :host {
      background: var(--ui-color-error-400);
      padding: 4px;
      border-radius: 4px;
    }

    ui-text {
      font-size: 16px;
      line-height: 16px;
    }

    :host([enabled]) {
      background: var(--ui-color-success-500);
    }
  `,
});
