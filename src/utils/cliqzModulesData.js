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
 * @param  {number} tabId
 * @param  {string} tabHostUrl
 * @param  {boolean} antiTracking 	Fetch data from the anti-tracking module
 * @return {object}
 */
export function getCliqzData(tabId, tabHostUrl, antiTracking) {
	let totalUnsafeCount = 0;
	let totalUnknownCount = 0;
	let trackerCount = 0;
	let unknownTrackerCount = 0;
	const unknownTrackers = [];
	const whitelistedUrls = conf.cliqz_module_whitelist;
	const cliqzModule = antiTracking ? antitracking : adblocker;
	const cliqzModuleEnabled = antiTracking ? conf.enable_anti_tracking : conf.enable_ad_block;

	if (!cliqzModuleEnabled || !cliqzModule.background) {
		return {
			totalUnsafeCount,
			totalUnknownCount,
			trackerCount,
			unknownTrackerCount,
			unknownTrackers,
			whitelistedUrls,
		};
	}

	// Count up number of fingerprints and cookies found
	const { bugs, others } = cliqzModule.background.actions.getGhosteryStats(tabId);
	const bugsValues = Object.values(bugs);
	const othersValues = Object.values(others);
	const getDataPoints = (tracker) => {
		if (antiTracking) { return tracker.cookies + tracker.fingerprints; }
		return tracker.ads;
	};

	bugsValues.forEach((bug) => {
		const dataPoints = getDataPoints(bug);
		if (dataPoints) {
			totalUnsafeCount += dataPoints;
			trackerCount++;
		}
	});

	othersValues.forEach((other) => {
		let whitelisted = false;
		const dataPoints = getDataPoints(other);

		other.domains.some((domain) => {
			if (whitelistedUrls[domain]
			&& whitelistedUrls[domain].hosts.includes(tabHostUrl)) {
				whitelisted = true;
				return true;
			}
			return false;
		});

		if (dataPoints) {
			totalUnsafeCount += dataPoints;
			totalUnknownCount += dataPoints;
			trackerCount++;
			unknownTrackerCount++;
		}

		if (dataPoints || whitelisted) {
			const type = antiTracking ? 'antiTracking' : 'adBlock';
			const {
				name, domains, ads, cookies, fingerprints
			} = other;

			unknownTrackers.push({
				name, domains, ads, cookies, fingerprints, whitelisted, type
			});
		}
	});

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
 * Get list of matched bug_ids from Anti-Tracking and Ad-Blocking for this
 * tab, along with list of 'other' trackers found that do not match known bug_ids.
 * @memberOf BackgroundUtils
 * @param  {number} 	tabId
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
 * @param  {number}   	tabId
 * @param  {string} 	tabHostUrl
 * @param  {Function} 	callback
 */
export function sendCliqzModuleCounts(tabId, tabHostUrl, callback) {
	const modules = { adBlock: {}, antiTracking: {} };

	modules.adBlock = getCliqzData(tabId, tabHostUrl);
	modules.antiTracking = getCliqzData(tabId, tabHostUrl, true);
	callback(modules);
}
