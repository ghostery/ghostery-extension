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

import { html, define } from '/hybrids.js';
import { t } from '../../common/i18n.js';

define({
  tag: 'panel-footer',
  content: () => html`
    <footer>
      <a href="https://www.ghostery.com/support" target="_blank">
        ${t('panel_menu_report_broken_site')}
      </a>
      <a
        href="https://www.ghostery.com/submit-a-tracker"
        target="_blank"
        class="subscribe"
        >${t('panel_menu_submit_tracker')}</a
      >
    </footer>
  `,
});
