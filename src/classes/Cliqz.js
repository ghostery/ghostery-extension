/**
 * Cliqz Import Class
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

/*  @memberOf  BackgroundClasses */
import CLIQZ from 'browser-core';
import globals from './Globals';

const IS_ANDROID = globals.BROWSER_INFO.os === 'android';
export const HUMANWEB_MODULE = IS_ANDROID ? 'human-web-lite' : 'human-web';
export const HPN_MODULE = IS_ANDROID ? 'hpn-lite' : 'hpnv2';
// override the default prefs based on the platform
CLIQZ.config.default_prefs = {
	...CLIQZ.config.default_prefs,
	// the following are enabled by default on non-android platforms
	'modules.human-web.enabled': !IS_ANDROID,
	'modules.hpnv2.enabled': !IS_ANDROID,
	'modules.offers-v2.enabled': !IS_ANDROID,
	'modules.offers-banner.enabled': !IS_ANDROID,
	// the following are enabled for android only
	'modules.human-web-lite.enabled': IS_ANDROID,
	'modules.hpn-lite.enabled': IS_ANDROID,
};
if (IS_ANDROID) {
	CLIQZ.config.settings.HW_CHANNEL = 'android';
}

export default new (CLIQZ.App)({ debug: globals.DEBUG });
