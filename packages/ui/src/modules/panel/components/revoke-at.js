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

import { html } from 'hybrids';
import '@github/relative-time-element';

export default {
  // add 1 minute to the revokeAt time to ensure the relative-time element displays the correct duration
  revokeAt: (host, value) => value && new Date(value),
  render: ({ revokeAt }) =>
    revokeAt
      ? html`${html`<relative-time
          date="${new Date(revokeAt)}"
          format="duration"
          format-style="narrow"
          precision="minute"
          lang="${chrome.i18n.getUILanguage()}"
        ></relative-time>`}
        left`
      : html`Always`,
};
