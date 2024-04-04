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

// Styles
import './styles.css';

// Global components
import '../global/index.js';

// Root
import './onboarding.js';

// Iframes
import './iframe.js';
import './renew.js';
import './opera-serp.js';

// Components
define.from(
  import.meta.glob('./components/*.js', { eager: true, import: 'default' }),
  {
    prefix: 'ui-onboarding',
    root: 'components',
  },
);
