/**
 * Module
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2019 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

/* eslint max-classes-per-file: 0 */

import Module from 'browser-core/build/core/app/module';
import baseBackground from 'browser-core/build/core/base/background';
import globals from './Globals';
import conf from './Conf';

const background = baseBackground({
	init() { },
	unload() { },
	getState() {
		return {
			paused: globals.SESSION.paused_blocking,
			whitelisted: conf.site_whitelist,
		};
	}
});

class GhosteryModule extends Module {
	static get _module() {
		return background;
	}
}

export default GhosteryModule;
