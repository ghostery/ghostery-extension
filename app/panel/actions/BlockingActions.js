/**
 * Blocking Action creators
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

import {
	UPDATE_BLOCKING_DATA,
	UPDATE_BLOCK_ALL_TRACKERS,
	UPDATE_CATEGORIES,
	UPDATE_ANTI_TRACKING_HIDE,
	UPDATE_CATEGORY_BLOCKED,
	UPDATE_TRACKER_BLOCKED,
	UPDATE_TRACKER_TRUST_RESTRICT,
	UPDATE_ANTI_TRACKING_WHITELIST,
	TOGGLE_EXPAND_ALL
} from '../constants/constants';

/**
 * Update Blocking data
 * @return {Object}
 */
export function updateBlockingData(data) {
	return {
		type: UPDATE_BLOCKING_DATA,
		data,
	};
}

/**
 * Called from Tracker.clickHeaderCheckbox()
 * @param  {Object} data
 * @return {Object}
 */
export function updateBlockAllTrackers(data) {
	return {
		type: UPDATE_BLOCK_ALL_TRACKERS,
		data,
	};
}

/**
 * Called from Blocking setShow functions
 * @param  {Object} data
 * @return {Object}
 */
export function updateCategories(data) {
	return {
		type: UPDATE_CATEGORIES,
		data,
	};
}

/**
 * Called from Blocking setShow functions
 * Hits the Summary reducer, as that is where the AntiTracking data is stored
 * @param  {Object} data
 * @return {Object}
 */
export function updateAntiTrackingHide(data) {
	return {
		type: UPDATE_ANTI_TRACKING_HIDE,
		data,
	};
}

/**
 * Called from Category.clickCategoryStatus()
 * @param  {Object} data
 * @return {Object} dispatch
 */
export function updateCategoryBlocked(data) {
	return {
		type: UPDATE_CATEGORY_BLOCKED,
		data,
	};
}

/**
 * Called from Tracker.clickTrackerStatus()
 * @param  {Object} data
 * @return {Object} dispatch
 */
export function updateTrackerBlocked(data) {
	return function(dispatch, getState) {
		const { paused_blocking } = getState().summary;
		const { sitePolicy } = getState().summary;
		dispatch({
			type: UPDATE_TRACKER_BLOCKED,
			data,
			paused_blocking,
			sitePolicy,
		});
	};
}

/**
 * Called from Tracker.clickTrackerTrust() and Tracker.clickTrackerRestrict()
 * @param  {Object} data
 * @return {Object} dispatch
 */
export function updateTrackerTrustRestrict(data) {
	return function(dispatch, getState) {
		// use redux-thunk to get pageHost from summary
		const { pageHost } = getState().summary;
		dispatch({
			type: UPDATE_TRACKER_TRUST_RESTRICT,
			data,
			pageHost,
		});
	};
}

/**
 * Called from Tracker.handleAntiTrackingWhitelist()
 * @param  {Object} data
 * @return {Object} dispatch
 */
export function updateAntiTrackingWhitelist(unknownTracker) {
	return function(dispatch, getState) {
		// use redux-thunk to get pageHost from summary
		const { pageHost } = getState().summary;
		dispatch({
			type: UPDATE_ANTI_TRACKING_WHITELIST,
			data: { unknownTracker, pageHost },
		});
	};
}

/**
 * Called from BlockingHeader.clickExpandAll()
 * @param  {Object} data
 * @return {Object}
 */
export function toggleExpandAll(data) {
	return {
		type: TOGGLE_EXPAND_ALL,
		data,
	};
}
