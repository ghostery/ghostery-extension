/**
 * Ghostery Common Import Class
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
import { parseHtml } from 'ghostery-common/build/gbe/human-web/html-helpers';
import COMMON from 'ghostery-common';
import WTM from 'ghostery-common/build/gbe/human-web/human-web';
import { DOMParser } from 'linkedom';
import globals from './Globals';
import conf from './Conf';

if (!navigator.userAgent.includes('Firefox')) {
	parseHtml.domParser = new DOMParser();
}

const IS_ANDROID = globals.BROWSER_INFO.os === 'android';
export const HUMANWEB_MODULE = IS_ANDROID ? 'human-web-lite' : 'human-web';
export const HPN_MODULE = IS_ANDROID ? 'hpn-lite' : 'hpnv2';
COMMON.config.baseURL = '/common/';
// Override the default prefs based on the platform
COMMON.config.default_prefs = {
	...COMMON.config.default_prefs,
	cliqz_adb_mode: globals.DEFAULT_ADBLOCKER_MODE,
	// the following are enabled by default on non-android platforms
	'modules.human-web.enabled': !IS_ANDROID,
	'modules.hpnv2.enabled': !IS_ANDROID,
	// the following are enabled for android only
	'modules.human-web-lite.enabled': IS_ANDROID,
	'modules.hpn-lite.enabled': IS_ANDROID,
	'modules.anolysis.enabled': IS_ANDROID,
	'modules.insights.enabled': true,
};

const common = new (COMMON.App)({ debug: globals.DEBUG });
const start = common.start.bind(common);

common.start = async () => {
	let { HW_CHANNEL } = COMMON.config.settings;
	await globals.BROWSER_INFO_READY;
	if (IS_ANDROID) {
		HW_CHANNEL = 'android';
	} else if (globals.BROWSER_INFO.token === 'gd') {
		HW_CHANNEL = 'ghostery-browser';
	} else if (globals.BROWSER_INFO.token === 'ga') {
		HW_CHANNEL = 'ghostery-browser-android';
	}
	WTM.CHANNEL = HW_CHANNEL;
	COMMON.config.settings.HW_CHANNEL = HW_CHANNEL;

	COMMON.config.default_prefs['modules.adblocker.enabled'] = conf.enable_ad_block;
	COMMON.config.default_prefs['modules.antitracking.enabled'] = conf.enable_anti_tracking;
	COMMON.config.default_prefs['modules.human-web.enabled'] = conf.enable_human_web;
	return start();
};

export default common;
