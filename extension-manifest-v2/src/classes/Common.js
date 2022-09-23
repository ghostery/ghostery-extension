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
import GhosteryModule from './Module';

if (!navigator.userAgent.includes('Firefox')) {
	parseHtml.domParser = new DOMParser();
}

const DEFAULT_ADBLOCKER_MODE = 2; // 2 == Ads + Trackers + Annoyances
const IS_ANDROID = globals.BROWSER_INFO.os === 'android';

COMMON.config.baseURL = '/common/';
// Override the default prefs based on the platform
COMMON.config.default_prefs = {
	...COMMON.config.default_prefs,
	cliqz_adb_mode: DEFAULT_ADBLOCKER_MODE,
	'modules.human-web.enabled': false,
	'modules.hpnv2.enabled': false,
	'modules.human-web-lite.enabled': false,
	'modules.hpn-lite.enabled': false,
	'modules.anolysis.enabled': !IS_ANDROID,
	'modules.insights.enabled': true,
};

const common = new (COMMON.App)({ debug: globals.DEBUG });

// add ghostery module to expose ghostery state to common
common.modules.ghostery = new GhosteryModule();

const setPref = (pref, value) => {
	COMMON.config.default_prefs[pref] = value;
	common.prefs.set(pref, value);
};

export const syncTrustedSites = () => {
	setPref('adb-trusted-sites', conf.site_whitelist || []);
};

const start = common.start.bind(common);
common.start = async () => {
	// ensures that prefs.set is present
	common.injectHelpers();

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

	setPref('modules.anolysis.enabled', !IS_ANDROID);
	
	if (!IS_ANDROID) {
		setPref('modules.human-web.enabled', conf.enable_human_web);
		setPref('modules.hpnv2.enabled', conf.enable_human_web);
	} else {
		setPref('modules.human-web-lite.enabled', conf.enable_human_web);
		setPref('modules.hpn-lite.enabled', conf.enable_human_web);
	}

	setPref('cliqz_adb_mode', DEFAULT_ADBLOCKER_MODE);
	syncTrustedSites();

	setPref('modules.adblocker.enabled', conf.enable_ad_block);
	setPref('modules.antitracking.enabled', conf.enable_anti_tracking);

	const startPromise = await start();
	// force prefs saving after startup
	setPref('timestamp', Date.now());
	return startPromise;
};

const setModuleState = (moduleName, enabled) => {
	if (enabled) {
		return common.enableModule(moduleName);
	}
	common.disableModule(moduleName);
	return Promise.resolve();
};

export const setAdblockerState = async enabled => setModuleState('adblocker', enabled);

export const setAntitrackingState = async enabled => setModuleState('antitracking', enabled);

export const setWhotracksmeState = async (enabled) => {
	if (!IS_ANDROID) {
		await setModuleState('hpnv2', enabled);
		await setModuleState('human-web', enabled);
	} else {
		await setModuleState('hpn-lite', enabled);
		await setModuleState('human-web-lite', enabled);
	}
};

export default common;
