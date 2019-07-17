/**
 * Methods for retrieving antitracking and adblocking data from Cliqz modules
 * Used by BrowserButton and PanelData
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2019  Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

// @namespace BackgroundUtils

import { extend } from 'underscore';
import conf from '../classes/Conf';
import cliqz from '../classes/Cliqz';

const { adblocker, antitracking } = cliqz.modules;

/**
 * Get the totalUnsafeCount of trackers found by Anti-Tracking on this tabId
 * @memberOf BackgroundUtils
 * @param  {int} 	tabId
 * @return {object}	totalUnsafeCount
 */
export function getCliqzAntiTrackingCount(tabId) {
	let count = 0;
	if (!conf.enable_anti_tracking || !antitracking.background) {
		return {
			totalUnsafeCount: count
		};
	}

	// Count up number of fingerprints and cookies found
	const { bugs, others } = antitracking.background.actions.getGhosteryStats(tabId);
	const allStats = Object.assign({}, bugs, others);
	const values = Object.values(allStats);

	for (const val of values) {
		count += val.cookies + val.fingerprints;
	}

	return {
		totalUnsafeCount: count
	};
}

/**
 * Get the totalCount of ads found by the Ad Blocker on this tabId
 * @memberOf BackgroundUtils
 * @param  {int} 	tabId
 * @return {object}
 */
export function getCliqzAdBlockingCount(tabId) {
	if (!conf.enable_ad_block || !adblocker.background) {
		return {
			totalCount: 0
		};
	}

	const adBlockInfo = adblocker.background.actions.getAdBlockInfoForTab(tabId);
	return {
		totalCount: adBlockInfo.totalCount || 0,
	};
}

/**
 * Get list of matched bug_ids from Anti-Tracking and Ad-Blocking for this
 * tab, along with list of 'other' trackers found that do not match known bug_ids.
 * @memberOf BackgroundUtils
 * @param  {int} 	tabId
 * @return {object}
 */
export function getCliqzGhosteryBugs(tabId) {
	// Merge Ad-Block stats into Anti-Track Stats
	const antiTrackingStats = (conf.enable_anti_tracking) ? antitracking.background.actions.getGhosteryStats(tabId) : { bugs: {}, others: {} };
	const adBlockingStats = (conf.enable_ad_block) ? adblocker.background.actions.getGhosteryStats(tabId) : { bugs: {}, others: {} };

	return {
		bugs: extend({}, antiTrackingStats.bugs, adBlockingStats.bugs),
		others: extend({}, antiTrackingStats.others, adBlockingStats.others),
	};
}

/**
 * Send `totalCount` of ads found by Ad Blocker and `totalUnsafeCount`
 * found by Anti-Tracking
 * @memberOf BackgroundUtils
 * @param  {int}   		tabId
 * @param  {Function} 	callback
 */
export function sendCliqzModuleCounts(tabId, callback) {
	const modules = { adblock: {}, antitracking: {} };

	modules.adblock = getCliqzAdBlockingCount(tabId);
	modules.antitracking = getCliqzAntiTrackingCount(tabId);
	callback(modules);
}
