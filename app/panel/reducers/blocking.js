/**
 * Blocking Reducer
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2018 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

/* eslint no-use-before-define: 0 */
import { GET_BLOCKING_DATA,
	FILTER_TRACKERS,
	UPDATE_BLOCK_ALL_TRACKERS,
	UPDATE_CATEGORIES,
	UPDATE_CATEGORY_BLOCKED,
	UPDATE_TRACKER_BLOCKED,
	UPDATE_TRACKER_TRUST_RESTRICT,
	TOGGLE_EXPAND_ALL,
	TOGGLE_EXPAND_CATEGORY } from '../constants/constants';
import { updateTrackerBlocked, updateCategoryBlocked, updateBlockAllTrackers, toggleExpandAll, toggleExpandCategory } from '../utils/blocking';
import { removeFromObject, updateObject } from '../utils/utils';
import { sendMessage } from '../utils/msg';
import { objectEntries } from '../../../src/utils/common';

const initialState = {
	categories: [],
	expand_all_trackers: true,
	filter: {
		type: '',
		name: '',
	},
	site_specific_unblocks: {},
	site_specific_blocks: {},
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
		case GET_BLOCKING_DATA: {
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
		case TOGGLE_EXPAND_CATEGORY: {
			const updated = toggleExpandCategory(state, action);
			return Object.assign({}, state, updated);
		}
		case UPDATE_TRACKER_TRUST_RESTRICT: {
			const updated = _updateTrackerTrustRestrict(state, action);
			return Object.assign({}, state, updated);
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
	});

	return {
		categories: updated_categories,
		site_specific_unblocks: updated_site_specific_unblocks,
		site_specific_blocks: updated_site_specific_blocks,
	};
};
