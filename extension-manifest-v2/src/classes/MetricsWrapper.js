/**
 * Metrics
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2017 Ghostery GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

// eslint-disable-next-line import/no-unresolved
import { Metrics } from '@ghostery/libs';

import globals from './Globals';
import conf from './Conf';
import { log } from '../utils/common';

const metrics = new Metrics({
	getBrowserInfo: globals.getBrowserInfo,
	METRICS_BASE_URL: globals.METRICS_BASE_URL,
	EXTENSION_VERSION: globals.EXTENSION_VERSION,
	conf,
	log,
});

export default metrics;
