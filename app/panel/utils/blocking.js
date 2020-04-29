/**
 * Blocking Utilities
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
/**
 * @namespace  PanelUtils
 */
import { sendMessage } from './msg';

/**
 * Dispatch action to SummaryActions to update trackerCounts.
 * @memberOf PanelUtils
 * @param {array}	 categories        		array of categories
 * @param {object} smartBlock 	blocked and unblocked of Smart Blocking
 * @param {function} updateTrackerCounts 	from SummaryActions
 */
export function updateSummaryBlockingCount(categories = [], smartBlock, updateTrackerCounts) {
	let numTotal = 0;
	let numTotalBlocked = 0;
	let numTotalSsBlocked = 0;
	let numTotalSsUnblocked = 0;
	let numTotalSbBlocked = 0;
	let numTotalSbUnblocked = 0;

	categories.forEach((categoryEl) => {
		categoryEl.trackers.forEach((trackerEl) => {
			numTotal++;
			const sbBlocked = smartBlock.blocked.hasOwnProperty(trackerEl.id);
			const sbUnblocked = smartBlock.unblocked.hasOwnProperty(trackerEl.id);

			if (trackerEl.ss_blocked || sbBlocked || (trackerEl.blocked && !trackerEl.ss_allowed && !sbUnblocked)) {
				numTotalBlocked++;
			}
			if (trackerEl.ss_blocked) {
				numTotalSsBlocked++;
			}
			if (trackerEl.ss_allowed) {
				numTotalSsUnblocked++;
			}
			if (sbBlocked) {
				numTotalSbBlocked++;
			}
			if (sbUnblocked) {
				numTotalSbUnblocked++;
			}
		});
	});

	updateTrackerCounts({
		num_total: numTotal,
		num_blocked: numTotalBlocked,
		num_ss_blocked: numTotalSsBlocked,
		num_ss_allowed: numTotalSsUnblocked,
		num_sb_blocked: numTotalSbBlocked,
		num_sb_allowed: numTotalSbUnblocked,
	});
}

/**
 * Called when clicking 'block all' trackers. Persist changed data.
 * @memberOf PanelUtils
 * @param  {Object} state 				current state
 * @param  {Object} action 				current action which provides data
 * @return {Object} 					updated categories and selected app ids
 */
export function updateBlockAllTrackers(state, action) {
	const blocked = !action.data.allBlocked;
	const updated_app_ids = JSON.parse(JSON.stringify(state.selected_app_ids)) || {};
	const updated_categories = JSON.parse(JSON.stringify(state.categories)) || [];
	const { smartBlockActive } = action.data;
	const smartBlock = smartBlockActive && action.data.smartBlock || { blocked: {}, unblocked: {} };

	updated_categories.forEach((categoryEl) => {
		categoryEl.num_blocked = 0;
		categoryEl.trackers.forEach((trackerEl) => {
			const sbBlocked = smartBlock.blocked.hasOwnProperty(trackerEl.id);
			const sbUnblocked = smartBlock.unblocked.hasOwnProperty(trackerEl.id);

			if (trackerEl.shouldShow) {
				trackerEl.blocked = blocked;
				const key = trackerEl.id;
				if (sbBlocked || (blocked && !sbUnblocked)) {
					categoryEl.num_blocked++;
				}
				if (blocked) {
					updated_app_ids[key] = 1;
				} else {
					delete updated_app_ids[key];
				}
			}
		});
	});

	// persist to background
	sendMessage('setPanelData', { selected_app_ids: updated_app_ids });
	return {
		selected_app_ids: updated_app_ids,
		categories: updated_categories
	};
}

/**
 * Update category blocked / allowed status. Persist changed data.
 * @memberOf PanelUtils
 * @param  {Object} state 		current state
 * @param  {Object} action 		current action which provides data
 *
 * @return {Object} 		    updated categories and selected app ids
 */
export function updateCategoryBlocked(state, action) {
	const { blocked, smartBlockActive } = action.data;
	const smartBlock = smartBlockActive && action.data.smartBlock || { blocked: {}, unblocked: {} };
	const updated_app_ids = JSON.parse(JSON.stringify(state.selected_app_ids)) || {};
	const updated_categories = JSON.parse(JSON.stringify(state.categories)); // deep clone
	const catIndex = updated_categories.findIndex(item => item.id === action.data.category);
	const updated_category = updated_categories[catIndex];
	updated_category.num_blocked = 0;
	updated_category.trackers.forEach((trackerEl) => {
		const sbBlocked = smartBlock.blocked.hasOwnProperty(trackerEl.id);
		const sbUnblocked = smartBlock.unblocked.hasOwnProperty(trackerEl.id);

		if (trackerEl.shouldShow) {
			trackerEl.blocked = blocked;
			const key = trackerEl.id;
			if (sbBlocked || (blocked && !sbUnblocked)) {
				updated_category.num_blocked++;
			}
			if (blocked) {
				updated_app_ids[key] = 1;
			} else {
				delete updated_app_ids[key];
			}
		}
	});

	// persist to background
	sendMessage('setPanelData', { selected_app_ids: updated_app_ids });

	return {
		categories: updated_categories,
		selected_app_ids: updated_app_ids,
	};
}

/**
 * Set property for expanding all categories. Persist the change.
 * @memberOf PanelUtils
 * @param  {Object} state 		current state
 * @param  {Object} action 		action which provides data
 * @return {Object} 			updated categories and expanded state
 */
export function toggleExpandAll(state, action) {
	sendMessage('setPanelData', { expand_all_trackers: action.data });
	const updated_categories = JSON.parse(JSON.stringify(state.categories)); // deep clone
	updated_categories.forEach((categoryEl) => {
		categoryEl.expanded = action.data;
	});
	return {
		categories: updated_categories,
		expand_all_trackers: action.data
	};
}

/**
 * Update tracker blocked / allowed status. Persist the change.
 * @memberOf PanelUtils
 * @param  {Object} state 			current state
 * @param  {Object} action 			action which provides data
 * @return {Object}                 updated categories and selected app ids
 */
export function updateTrackerBlocked(state, action) {
	const sitePolicy = action.sitePolicy || false;
	const ghosteryPaused = action.paused_blocking || false;

	// don't update if we're whitelisted or paused
	if (sitePolicy || ghosteryPaused) {
		return {};
	}

	const { blocked, smartBlockActive } = action.data;
	const smartBlock = smartBlockActive && action.data.smartBlock || { blocked: {}, unblocked: {} };
	const updated_app_ids = JSON.parse(JSON.stringify(state.selected_app_ids)) || {};
	const updated_categories = JSON.parse(JSON.stringify(state.categories)) || []; // deep clone
	const catIndex = updated_categories.findIndex(item => item.id === action.data.cat_id);
	const updated_category = updated_categories[catIndex];

	updated_category.num_blocked = 0;
	updated_category.trackers.forEach((trackerEl) => {
		const sbBlocked = smartBlock.blocked.hasOwnProperty(trackerEl.id);
		const sbUnblocked = smartBlock.unblocked.hasOwnProperty(trackerEl.id);

		if (trackerEl.shouldShow) {
			if (trackerEl.id === action.data.app_id) {
				trackerEl.blocked = blocked;
				const key = trackerEl.id;
				if (blocked) {
					updated_app_ids[key] = 1;
				} else {
					delete updated_app_ids[key];
				}
			}
			if (sbBlocked || (trackerEl.blocked && !sbUnblocked)) {
				updated_category.num_blocked++;
			}
		}
	});

	// persist to background
	sendMessage('setPanelData', {
		selected_app_ids: updated_app_ids,
		brokenPageMetricsTrackerTrustOrUnblock: !blocked
	});

	return {
		categories: updated_categories,
		selected_app_ids: updated_app_ids,
	};
}
