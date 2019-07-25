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
export function getCliqzAntiTrackingData(tabId, tabHostUrl) {
	let totalUnsafeCount = 0;
	let totalUnknownCount = 0;
	let unknownTrackerCount = 0;
	const unknownTrackers = [];
	const whitelistedUrls = conf.anti_tracking_whitelist;
	if (!conf.enable_anti_tracking || !antitracking.background) {
		return {
			totalUnsafeCount,
			totalUnknownCount,
			unknownTrackerCount,
			unknownTrackers,
			whitelistedUrls,
		};
	}

	// Count up number of fingerprints and cookies found
	const { bugs, others } = antitracking.background.actions.getGhosteryStats(tabId);
	const bugsValues = Object.values(bugs);
	const othersValues = Object.values(others);

	for (const bug of bugsValues) {
		totalUnsafeCount += bug.cookies + bug.fingerprints;
	}

	for (const other of othersValues) {
		let whitelisted = false;
		const scrubbed = other.cookies || other.fingerprints;

		other.domains.some((domain) => {
			if (conf.anti_tracking_whitelist[domain]
			&& conf.anti_tracking_whitelist[domain].hosts.includes(tabHostUrl)) {
				whitelisted = true;
				return true;
			}
			return false;
		});

		if (scrubbed) {
			totalUnsafeCount += other.cookies + other.fingerprints;
			totalUnknownCount += other.cookies + other.fingerprints;
			unknownTrackerCount += 1;
		}

		if (scrubbed || whitelisted) {
			const {
				name, domains, ads, cookies, fingerprints
			} = other;

			unknownTrackers.push({
				name, domains, ads, cookies, fingerprints, whitelisted
			});
		}
	}

	return {
		totalUnsafeCount,
		totalUnknownCount,
		unknownTrackerCount,
		unknownTrackers,
		whitelistedUrls,
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
export function sendCliqzModuleCounts(tabId, tabHostUrl, callback) {
	const modules = { adblock: {}, antitracking: {} };

	modules.adblock = getCliqzAdBlockingCount(tabId);
	modules.antiTracking = getCliqzAntiTrackingData(tabId, tabHostUrl);
	callback(modules);
}
