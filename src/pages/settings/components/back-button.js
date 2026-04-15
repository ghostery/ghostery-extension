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
import { html, router } from 'hybrids';

export default {
  render: () => html`
    <template layout="contents">
      <ui-action>
        <a href="${router.backUrl()}" data-qa="button:back" layout="row gap:0.5 items:center">
          <ui-icon name="chevron-left" color="primary"></ui-icon>
          <ui-text type="headline-s" layout="row gap items:center"> Back </ui-text>
        </a>
      </ui-action>
    </template>
  `.css`
    @media (hover: hover) {
      a:hover ui-text {
        text-decoration: underline;
      }

      ui-text {
        transition: margin-left 0.1s ease-out;
      }

      a:hover ui-text {
        margin-left: 4px;
      }
    }
  `,
};
