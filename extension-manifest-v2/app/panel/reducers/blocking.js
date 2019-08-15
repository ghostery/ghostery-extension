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

/* eslint no-use-before-define: 0 */
import {
	UPDATE_BLOCKING_DATA,
	FILTER_TRACKERS,
	UPDATE_BLOCK_ALL_TRACKERS,
	UPDATE_CATEGORIES,
	UPDATE_UNKNOWN_CATEGORY_HIDE,
	UPDATE_CATEGORY_BLOCKED,
	UPDATE_TRACKER_BLOCKED,
	UPDATE_TRACKER_TRUST_RESTRICT,
	UPDATE_CLIQZ_MODULE_WHITELIST,
	TOGGLE_EXPAND_ALL,
	UPDATE_CLIQZ_MODULE_DATA,
	UPDATE_SUMMARY_DATA
} from '../constants/constants';
import {
	updateTrackerBlocked, updateCategoryBlocked, updateBlockAllTrackers, toggleExpandAll
} from '../utils/blocking';
import { updateObject } from '../utils/utils';
import { sendMessage } from '../utils/msg';

const initialState = {
	categories: [],
	expand_all_trackers: true,
	filter: {
		type: '',
		name: '',
	},
	site_specific_unblocks: {},
	site_specific_blocks: {},
	unknownCategory: {
		totalUnsafeCount: 0, // The amount of data points scrubbed by Anti-Tracking and Ad Block
		totalUnknownCount: 0, // The amount of data points scrubbed by Anti-Tracking and Ad Block for Trackers not in the Ghostery DB
		trackerCount: 0, // The amount of trackers scrubbed by Anti-Tracking and Ad Block (which are each associated with 1 or more data points)
		unknownTrackerCount: 0, // The amount of unknown trackers scrubbed by Anti-Tracking and Ad Block
		unknownTrackers: [], // An array of objects associated with each unknown Tracker (includes both blocked and whitelisted trackers for this site)
		whitelistedUrls: {}, // An object of whitelisted url domains pointing to an object with the associated tracker name and an array of whitelisted host domains
		hide: false, // Whether or not to display the Unknown category
	}
};

/**
 * Default export for blocking view reducer.
 * Process specified blocking action and return updated state.
 * @memberOf  PanelReactReducers
 * @param  {Object} state 		current state
 * @param  {Object} action 		action which provides data
 * @return {Object}        		updated state clone
 */
export default (state = initialState, action) => {
	switch (action.type) {
		case UPDATE_BLOCKING_DATA: {
			return Object.assign({}, state, action.data);
		}
		case FILTER_TRACKERS: {
			if (state.filter.type === action.data.type && state.filter.name === action.data.name) {
				// prevent re-render if filter hasn't changed
				return state;
			}
			return Object.assign({}, state, { filter: action.data });
		}
		case UPDATE_BLOCK_ALL_TRACKERS: {
			const updated = updateBlockAllTrackers(state, action);
			return Object.assign({}, state, updated);
		}
		case UPDATE_CATEGORIES: {
			return Object.assign({}, state, { categories: action.data });
		}
		case UPDATE_UNKNOWN_CATEGORY_HIDE: {
			return Object.assign({}, state, { unknownCategory: action.data });
		}
		case UPDATE_CATEGORY_BLOCKED: {
			const updated = updateCategoryBlocked(state, action);
			return Object.assign({}, state, updated);
		}
		case UPDATE_TRACKER_BLOCKED: {
			const updated = updateTrackerBlocked(state, action);
			return Object.assign({}, state, updated);
		}
		case TOGGLE_EXPAND_ALL: {
			const updated = toggleExpandAll(state, action);
			return Object.assign({}, state, updated);
		}
		case UPDATE_TRACKER_TRUST_RESTRICT: {
			const updated = _updateTrackerTrustRestrict(state, action);
			return Object.assign({}, state, updated);
		}
		case UPDATE_CLIQZ_MODULE_WHITELIST: {
			const unknownCategory = _updateCliqzModuleWhitelist(state, action);
			return Object.assign({}, state, { unknownCategory });
		}
		case UPDATE_CLIQZ_MODULE_DATA:
		case UPDATE_SUMMARY_DATA: {
			if (action.data.antiTracking) {
				const { antiTracking, adBlock } = action.data;
				let adBlockUnknownTrackers = adBlock.unknownTrackers;
				antiTracking.unknownTrackers.forEach((tracker) => {
					if (tracker.whitelisted) {
						adBlockUnknownTrackers = adBlockUnknownTrackers.filter(adBlockTracker => (
							adBlockTracker.name !== tracker.name
						));
					}
				});

				const unknownCategory = {
					totalUnsafeCount: antiTracking.totalUnsafeCount + adBlock.totalUnsafeCount,
					totalUnknownCount: antiTracking.totalUnknownCount + adBlock.totalUnknownCount,
					trackerCount: antiTracking.trackerCount + adBlock.trackerCount,
					unknownTrackerCount: antiTracking.unknownTrackerCount + adBlock.unknownTrackerCount,
					unknownTrackers: Array.from(new Set(antiTracking.unknownTrackers.concat(adBlockUnknownTrackers))),
					whitelistedUrls: Object.assign({}, antiTracking.whitelistedUrls, adBlock.whitelistedUrls),
					hide: state.unknownCategory.hide,
				};
				return Object.assign({}, state, { unknownCategory });
			}
			return state;
		}

		default: return state;
	}
};

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
	const app_id = +msg.app_id;
	const { pageHost } = action;
	const siteSpecificUnblocks = state.site_specific_unblocks;
	const siteSpecificBlocks = state.site_specific_blocks;
	const pageUnblocks = siteSpecificUnblocks[pageHost] && siteSpecificUnblocks[pageHost].slice(0) || []; // clone
	const pageBlocks = siteSpecificBlocks[pageHost] && siteSpecificBlocks[pageHost].slice(0) || []; // clone

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

	updated_category.trackers.forEach((tracker) => {
		if (tracker.shouldShow) {
			if (tracker.id === app_id) {
				tracker.ss_allowed = msg.trust;
				tracker.ss_blocked = msg.restrict;
			}
		}
	});

	// persist to background - note that categories are not included
	sendMessage('setPanelData', {
		site_specific_unblocks: updated_site_specific_unblocks,
		site_specific_blocks: updated_site_specific_blocks,
		brokenPageMetricsTrackerTrustOrUnblock: msg.trust || (!msg.trust && !msg.restrict),
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
const _updateCliqzModuleWhitelist = (state, action) => {
	const updatedUnknownCategory = JSON.parse(JSON.stringify(state.unknownCategory));
	const { whitelistedUrls } = updatedUnknownCategory;
	const { unknownTracker, pageHost } = action.data;

	const addToWhitelist = () => {
		unknownTracker.domains.forEach((domain) => {
			if (whitelistedUrls.hasOwnProperty(domain)) {
				whitelistedUrls[domain].name = unknownTracker.name;
				whitelistedUrls[domain].hosts.push(pageHost);
			} else {
				whitelistedUrls[domain] = {
					name: unknownTracker.name,
					hosts: [pageHost],
				};
			}
		});
	};

	const removeFromWhitelist = (domain) => {
		if (!whitelistedUrls[domain]) { return; }

		whitelistedUrls[domain].hosts = whitelistedUrls[domain].hosts.filter(hostUrl => (
			hostUrl !== pageHost
		));

		if (whitelistedUrls[domain].hosts.length === 0) {
			delete whitelistedUrls[domain];
		}
	};

	if (unknownTracker.whitelisted) {
		unknownTracker.domains.forEach(removeFromWhitelist);

		Object.keys(whitelistedUrls).forEach((domain) => {
			if (whitelistedUrls[domain].name === unknownTracker.name) {
				removeFromWhitelist(domain);
			}
		});
	} else {
		addToWhitelist();
	}

	updatedUnknownCategory.unknownTrackers.forEach((tracker) => {
		if (tracker.name === unknownTracker.name) {
			tracker.whitelisted = !tracker.whitelisted;
		}
	});

	sendMessage('setPanelData', { cliqz_module_whitelist: whitelistedUrls });

	return updatedUnknownCategory;
};
