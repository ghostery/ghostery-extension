/**
 * Blocking Action creators
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

import {
	GET_BLOCKING_DATA,
	UPDATE_BLOCK_ALL_TRACKERS,
	UPDATE_CATEGORIES,
	UPDATE_CATEGORY_BLOCKED,
	UPDATE_TRACKER_BLOCKED,
	UPDATE_TRACKER_TRUST_RESTRICT,
	TOGGLE_EXPAND_ALL,
	TOGGLE_EXPAND_CATEGORY
} from '../constants/constants';
import { sendMessageInPromise } from '../utils/msg';

/**
* Fetch blocking data from background
* @return {Object} dispatch
*/
export function getBlockingData(tabId) {
	return function (dispatch) {
		return sendMessageInPromise('getPanelData', {
			tabId,
			view: 'blocking',
		}).then((data) => {
			dispatch({
				type: GET_BLOCKING_DATA,
				data,
			});
		});
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
	return function (dispatch, getState) {
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
	return function (dispatch, getState) {
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

/**
 * Called from Category.toggleCategoryTrackers
 * @param  {Object} data
 * @return {Object}
 */
export function toggleExpandCategory(data) {
	return {
		type: TOGGLE_EXPAND_CATEGORY,
		data,
	};
}
