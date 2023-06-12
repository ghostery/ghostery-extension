/**
 * Methods for retrieving antitracking and adblocking data from Common modules
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

import conf from '../classes/Conf';
import common from '../classes/Common';

const { adblocker, antitracking } = common.modules;

/**
 * Get the totalUnsafeCount of trackers found by Anti-Tracking on this tabId
 * @memberOf BackgroundUtils
 * @param  {number} tabId
 * @param  {string} tabHostUrl
 * @param  {boolean} antiTracking 	Fetch data from the anti-tracking module
 * @return {object}
 */
export function getCommonData(tabId, tabHostUrl, antiTracking) {
	let totalUnsafeCount = 0;
	let totalUnidentifiedCount = 0;
	let trackerCount = 0;
	let unidentifiedTrackerCount = 0;
	const unidentifiedTrackers = [];
	const whitelistedUrls = conf.common_whitelist;
	const commonModule = antiTracking ? antitracking : adblocker;
	const commonModuleEnabled = antiTracking ? conf.enable_anti_tracking : conf.enable_ad_block;

	if (!commonModuleEnabled || !commonModule.background) {
		return {
			totalUnsafeCount,
			totalUnidentifiedCount,
			trackerCount,
			unidentifiedTrackerCount,
			unidentifiedTrackers,
			whitelistedUrls,
		};
	}

	// Count up number of fingerprints and cookies found
	const { bugs, others } = commonModule.background.actions.getGhosteryStats(tabId);
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
			totalUnidentifiedCount += dataPoints;
			trackerCount++;
			unidentifiedTrackerCount++;
		}

		if (dataPoints || whitelisted) {
			const type = antiTracking ? 'antiTracking' : 'adBlock';
			const {
				name, domains, ads, cookies, fingerprints, wtm
			} = other;

			unidentifiedTrackers.push({
				name, domains, ads, cookies, fingerprints, whitelisted, type, wtm
			});
		}
	});

	return {
		totalUnsafeCount,
		totalUnidentifiedCount,
		trackerCount,
		unidentifiedTrackerCount,
		unidentifiedTrackers,
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
export function getCommonGhosteryBugs(tabId) {
	// Merge Ad-Block stats into Anti-Track Stats
	const antiTrackingStats = (conf.enable_anti_tracking) ? antitracking.background.actions.getGhosteryStats(tabId) : { bugs: {}, others: {} };
	const adBlockingStats = (conf.enable_ad_block) ? adblocker.background.actions.getGhosteryStats(tabId) : { bugs: {}, others: {} };

	// { 1: { cookies: 0, fingerprints: 0, ads: 0 } }
	const bugs = {};
	Object.keys(antiTrackingStats.bugs).forEach((tracker) => {
		bugs[tracker] = { ...antiTrackingStats.bugs[tracker] };
	});
	Object.keys(adBlockingStats.bugs).forEach((tracker) => {
		if (!bugs[tracker]) {
			bugs[tracker] = { ...adBlockingStats.bugs[tracker] };
		} else {
			bugs[tracker].cookies += adBlockingStats.bugs[tracker].cookies || 0;
			bugs[tracker].fingerprints += adBlockingStats.bugs[tracker].fingerprints || 0;
			bugs[tracker].ads += adBlockingStats.bugs[tracker].ads || 0;
			bugs[tracker].firstPartyAds += adBlockingStats.bugs[tracker].firstPartyAds || 0;
		}
	});

	// { "test.com": { cookies: 0, fingerprints: 0, ads: 0, name: "test.com", domains: ["test.com"], cat: "unindentified" } }
	const others = {};
	Object.keys(antiTrackingStats.others).forEach((tracker) => {
		others[tracker] = { ...antiTrackingStats.others[tracker] };
	});
	Object.keys(adBlockingStats.others).forEach((tracker) => {
		if (!others[tracker]) {
			others[tracker] = { ...adBlockingStats.others[tracker] };
		} else {
			others[tracker].cookies += adBlockingStats.others[tracker].cookies || 0;
			others[tracker].fingerprints += adBlockingStats.others[tracker].fingerprints || 0;
			others[tracker].ads += adBlockingStats.others[tracker].ads || 0;
			if (adBlockingStats.others[tracker].name) {
				others[tracker].name = adBlockingStats.others[tracker].name;
			}
			if (adBlockingStats.others[tracker].cat) {
				others[tracker].cat = adBlockingStats.others[tracker].cat;
			}
			if (adBlockingStats.others[tracker].domains?.length > 0) {
				others[tracker].domains.push(...adBlockingStats.others[tracker].domains);
			}
		}
	});

	return {
		bugs,
		others,
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
export function sendCommonModuleCounts(tabId, tabHostUrl, callback) {
	const modules = { adBlock: {}, antiTracking: {} };

	modules.adBlock = getCommonData(tabId, tabHostUrl);
	modules.antiTracking = getCommonData(tabId, tabHostUrl, true);
	callback(modules);
}
