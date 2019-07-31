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
	let trackerCount = 0;
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
		if (bug.cookies || bug.fingerprints) {
			totalUnsafeCount += bug.cookies + bug.fingerprints;
			trackerCount++;
		}
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
			trackerCount++;
			unknownTrackerCount++;
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
		trackerCount,
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
			totalCount: 0,
			trackerCount: 0,
		};
	}

	const adBlockInfo = adblocker.background.actions.getAdBlockInfoForTab(tabId);
	const { bugs, others } = adblocker.background.actions.getGhosteryStats(tabId);
	const bugCount = bugs ? Object.keys(bugs).length : 0;
	const otherCount = others ? Object.keys(others).length : 0;

	return {
		totalCount: adBlockInfo ? adBlockInfo.totalCount : 0,
		trackerCount: bugCount + otherCount,
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
	const modules = { adBlock: {}, antiTracking: {} };

	modules.adBlock = getCliqzAdBlockingCount(tabId);
	modules.antiTracking = getCliqzAntiTrackingData(tabId, tabHostUrl);
	callback(modules);
}
