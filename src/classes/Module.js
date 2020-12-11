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

import Module from 'ghostery-common/build/gbe/core/app/module';
import baseBackground from 'ghostery-common/build/gbe/core/base/background';
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
	get _module() { // eslint-disable-line class-methods-use-this
		return background;
	}
}

export default GhosteryModule;
