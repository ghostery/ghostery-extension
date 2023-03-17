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

import { define } from 'hybrids';
// Global components
import '../pages/index.js';

// Components & Views
define.from(
  import.meta.glob(['./components/*.js', './views/*.js'], {
    eager: true,
    import: 'default',
  }),
  {
    prefix: 'ui-onboarding',
    root: ['components'],
  },
);

// Root
import './onboarding.js';
import './iframe.js';
