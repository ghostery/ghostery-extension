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

import { html, mount, store } from 'hybrids';

import Options, { WHATS_NEW_VERSION } from '/store/options.js';

store.set(Options, { whatsNewVersion: WHATS_NEW_VERSION });

mount(document.body, {
  render: () => html`<h1>What's New Page</h1>`,
});
