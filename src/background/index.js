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

import './onboarding.js';

import './autoconsent.js';
import './adblocker.js';
import './custom-filters.js';
import './dnr.js';
import './exceptions.js';
import './paused.js';
import './session.js';
import './stats.js';
import './notifications.js';
import './serp.js';

import './helpers.js';
import './external.js';
import './sync.js';

import './reporting/index.js';
import './telemetry/index.js';

import './devtools.js';
import scriptlets from '../rule_resources/scriptlets.js';
globalThis.scriptlets = scriptlets;
