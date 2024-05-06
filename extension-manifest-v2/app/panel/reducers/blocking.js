/**
 * Blocking Reducer
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

import { parse } from 'tldts-experimental';
import {
	UPDATE_BLOCKING_DATA,
	FILTER_TRACKERS,
	UPDATE_BLOCK_ALL_TRACKERS,
	UPDATE_CATEGORIES,
	UPDATE_UNIDENTIFIED_CATEGORY_HIDE,
	UPDATE_CATEGORY_BLOCKED,
	UPDATE_TRACKER_BLOCKED,
	UPDATE_TRACKER_TRUST_RESTRICT,
	UPDATE_COMMON_MODULE_WHITELIST,
	TOGGLE_EXPAND_ALL,
	UPDATE_COMMON_MODULE_DATA,
	UPDATE_SUMMARY_DATA
} from '../constants/constants';
import {
	updateTrackerBlocked, updateCategoryBlocked, updateBlockAllTrackers, toggleExpandAll
} from '../utils/blocking';
import { updateObject } from '../utils/utils';
import { sendMessage } from '../utils/msg';

const initialState = {
	setup_complete: false,
	categories: [],
	expand_all_trackers: true,
	filter: {
		type: '',
		name: '',
	},
	site_specific_unblocks: {},
	site_specific_blocks: {},
	unidentifiedCategory: {
		totalUnsafeCount: 0, // The amount of data points scrubbed by Anti-Tracking and Ad Block
		totalUnidentifiedCount: 0, // The amount of data points scrubbed by Anti-Tracking and Ad Block for Trackers not in the Ghostery DB
		trackerCount: 0, // The amount of trackers scrubbed by Anti-Tracking and Ad Block (which are each associated with 1 or more data points)
		unidentifiedTrackerCount: 0, // The amount of unidentified trackers scrubbed by Anti-Tracking and Ad Block
		unidentifiedTrackers: [], // An array of objects associated with each unidentified Tracker (includes both blocked and whitelisted trackers for this site)
		whitelistedUrls: {}, // An object of whitelisted url domains pointing to an object with the associated tracker name and an array of whitelisted host domains
		hide: false, // Whether or not to display the Unidentified category
	}
};

function mergeTrackers(adblockerTrackers, antiTrackingTrackers, whitelist, pageUrl) {
	const all = new Map();
	adblockerTrackers.forEach((tracker) => {
		all.set(tracker.name, tracker);
	});
	antiTrackingTrackers.forEach((tracker) => {
		const existing = all.get(tracker.name);
		if (!existing) {
			all.set(tracker.name, tracker);
		} else {
			existing.cookies = tracker.cookies;
			existing.fingerprints = tracker.fingerprints;
			existing.whitelisted = existing.whitelisted || tracker.whitelisted;
			existing.domains.concat(tracker.domains);
			all.set(tracker.name, existing);
		}
	});

	const findTrackerByWhitelistedDomain = (domain) => {
		for (const tracker of all.values()) {
			if (tracker.domains.some(whitelistedDomain => whitelistedDomain.endsWith(domain))) {
				return tracker;
			}
		}
		return null;
	};

	const pageTld = parse(pageUrl).domain;

	Object.keys(whitelist).forEach((domain) => {
		if (!whitelist[domain].hosts.some(host => host === pageTld)) {
			return;
		}
		const tld = parse(domain).domain;
		const existing = all.get(tld) || findTrackerByWhitelistedDomain(tld);
		if (existing) {
			existing.whitelisted = true;
			existing.domains = [...new Set([...existing.domains, domain])];
		} else {
			all.set(tld, {
				name: tld,
				ads: 0,
				cookies: 0,
				fingerprints: 0,
				domains: [domain],
				whitelisted: true,
				type: 'antiTracking',
			});
		}
	});
	return Array.from(all.values());
}

/**
 * Update site_specific_blocks/unblocks for tracker whitelist
 * and blacklist.  Also updates categories.
 * @memberOf  PanelReactReducers
 * @private
 * @param  {Object} state 		current state
 * @param  {Object} action 		action which provides data
 * @return {Object}        		updated categories and site-specific blocking counters
 */
const _updateTrackerTrustRestrict = (state, action) => {
	let updated_site_specific_unblocks = {};
	let updated_site_specific_blocks = {};
	const updated_categories = JSON.parse(JSON.stringify(state.categories)); // deep clone
	const msg = action.data;
	const { app_id } = msg;
	const { pageHost } = action;
	const siteSpecificUnblocks = state.site_specific_unblocks;
	const siteSpecificBlocks = state.site_specific_blocks;
	const pageUnblocks = (siteSpecificUnblocks[pageHost] && siteSpecificUnblocks[pageHost].slice(0)) || []; // clone
	const pageBlocks = (siteSpecificBlocks[pageHost] && siteSpecificBlocks[pageHost].slice(0)) || []; // clone

	// Site specific un-blocking
	if (msg.trust) {
		if (!pageUnblocks.includes(app_id)) {
			pageUnblocks.push(app_id);
		}
	} else if (pageUnblocks.includes(app_id)) {
		pageUnblocks.splice(pageUnblocks.indexOf(app_id), 1);
	}
	updated_site_specific_unblocks = updateObject(siteSpecificUnblocks, pageHost, pageUnblocks);

	// Site specific blocking
	if (msg.restrict) {
		if (!pageBlocks.includes(app_id)) {
			pageBlocks.push(app_id);
		}
	} else if (pageBlocks.includes(app_id)) {
		pageBlocks.splice(pageBlocks.indexOf(app_id), 1);
	}
	updated_site_specific_blocks = updateObject(siteSpecificBlocks, pageHost, pageBlocks);

	// update tracker category for site-specific blocking
	const updated_category = updated_categories[updated_categories.findIndex(item => item.id === msg.cat_id)];

	updated_category.trackers.forEach((trackerEl) => {
		if (trackerEl.shouldShow) {
			if (trackerEl.id === app_id) {
				trackerEl.ss_allowed = msg.trust;
				trackerEl.ss_blocked = msg.restrict;
			}
		}
	});

	// persist to background - note that categories are not included
	sendMessage('setPanelData', {
		site_specific_unblocks: updated_site_specific_unblocks,
		site_specific_blocks: updated_site_specific_blocks,
	});

	return {
		categories: updated_categories,
		site_specific_unblocks: updated_site_specific_unblocks,
		site_specific_blocks: updated_site_specific_blocks,
	};
};

/**
 * Update site_specific_blocks/unblocks for anit-tracking whitelist
 * @memberOf  PanelReactReducers
 * @private
 * @param  {Object} state 		current state
 * @param  {Object} action 		action which provides data
 * @return {Object}        		updated categories and site-specific blocking counters
 */
const _updateCommonModuleWhitelist = (state, action) => {
	const updatedUnidentifiedCategory = JSON.parse(JSON.stringify(state.unidentifiedCategory));
	const { whitelistedUrls } = updatedUnidentifiedCategory;
	const { unidentifiedTracker, pageHost } = action.data;
	const pageTld = parse(pageHost).domain;

	const addToWhitelist = () => {
		unidentifiedTracker.domains.forEach((domain) => {
			const tld = parse(domain).domain;
			if (whitelistedUrls.hasOwnProperty(tld)) {
				whitelistedUrls[tld].name = unidentifiedTracker.name;
				whitelistedUrls[tld].hosts = [...new Set([...whitelistedUrls[tld].hosts, pageTld])];
			} else {
				whitelistedUrls[tld] = {
					name: unidentifiedTracker.name,
					hosts: [pageTld],
				};
			}
		});
	};

	const removeFromWhitelist = (domain) => {
		const tld = parse(domain).domain;

		if (!whitelistedUrls[tld]) { return; }

		whitelistedUrls[tld].hosts = whitelistedUrls[tld].hosts.filter(hostUrl => (
			hostUrl !== pageTld
		));

		if (whitelistedUrls[tld].hosts.length === 0) {
			delete whitelistedUrls[tld];
		}
	};

	if (unidentifiedTracker.whitelisted) {
		unidentifiedTracker.domains.forEach(removeFromWhitelist);

		Object.keys(whitelistedUrls).forEach((domain) => {
			if (whitelistedUrls[domain].name === unidentifiedTracker.name) {
				removeFromWhitelist(domain);
			}
		});
	} else {
		addToWhitelist();
	}

	updatedUnidentifiedCategory.unidentifiedTrackers.forEach((trackerEl) => {
		if (trackerEl.name === unidentifiedTracker.name) {
			trackerEl.whitelisted = !trackerEl.whitelisted;
		}
	});

	sendMessage('setPanelData', { common_whitelist: whitelistedUrls });

	return updatedUnidentifiedCategory;
};

/**
 * Default export for blocking view reducer.
 * Process specified blocking action and return updated state.
 * @memberOf  PanelReactReducers
 * @param  {Object} state 		current state
 * @param  {Object} action 		action which provides data
 * @return {Object}        		updated state clone
 */
export default (state = initialState, action = null) => {
	if (!action) {
		return state;
	}
	switch (action.type) {
		case UPDATE_BLOCKING_DATA: {
			return { ...state, ...action.data };
		}
		case FILTER_TRACKERS: {
			if (state.filter.type === action.data.type && state.filter.name === action.data.name) {
				// prevent re-render if filter hasn't changed
				return state;
			}
			return { ...state, filter: action.data };
		}
		case UPDATE_BLOCK_ALL_TRACKERS: {
			const updated = updateBlockAllTrackers(state, action);
			return { ...state, ...updated };
		}
		case UPDATE_CATEGORIES: {
			return { ...state, categories: action.data };
		}
		case UPDATE_UNIDENTIFIED_CATEGORY_HIDE: {
			return { ...state, unidentifiedCategory: action.data };
		}
		case UPDATE_CATEGORY_BLOCKED: {
			const updated = updateCategoryBlocked(state, action);
			return { ...state, ...updated };
		}
		case UPDATE_TRACKER_BLOCKED: {
			const updated = updateTrackerBlocked(state, action);
			return { ...state, ...updated };
		}
		case TOGGLE_EXPAND_ALL: {
			const updated = toggleExpandAll(state, action);
			return { ...state, ...updated };
		}
		case UPDATE_TRACKER_TRUST_RESTRICT: {
			const updated = _updateTrackerTrustRestrict(state, action);
			return { ...state, ...updated };
		}
		case UPDATE_COMMON_MODULE_WHITELIST: {
			const unidentifiedCategory = _updateCommonModuleWhitelist(state, action);
			return { ...state, unidentifiedCategory };
		}
		case UPDATE_COMMON_MODULE_DATA:
		case UPDATE_SUMMARY_DATA: {
			if (action.data.antiTracking && action.data.adBlock) {
				const { antiTracking, adBlock } = action.data;
				const { common_whitelist, pageUrl } = state;
				const trackers = mergeTrackers(adBlock.unidentifiedTrackers, antiTracking.unidentifiedTrackers, common_whitelist || action.data.common_whitelist, pageUrl);
				const unidentifiedCategory = {
					totalUnsafeCount: antiTracking.totalUnsafeCount + adBlock.totalUnsafeCount,
					totalUnidentifiedCount: antiTracking.totalUnidentifiedCount + adBlock.totalUnidentifiedCount,
					trackerCount: antiTracking.trackerCount + adBlock.trackerCount,
					unidentifiedTrackerCount: trackers.length,
					unidentifiedTrackers: trackers,
					whitelistedUrls: { ...antiTracking.whitelistedUrls, ...adBlock.whitelistedUrls },
					hide: state.unidentifiedCategory.hide,
				};
				return { ...state, unidentifiedCategory };
			}
			return state;
		}

		default: return state;
	}
};
