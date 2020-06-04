/**
 * Summary Action creators
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
	UPDATE_CLIQZ_MODULE_DATA,
	UPDATE_SUMMARY_DATA,
	UPDATE_TRACKER_COUNTS,
	UPDATE_GHOSTERY_PAUSED,
	UPDATE_SITE_POLICY,
	FILTER_TRACKERS
} from '../constants/constants';
import { sendMessageInPromise } from '../utils/msg';


/**
 * Fetch Cliqz Modules data from background
 * @return {Object}
 */
export function updateCliqzModuleData(data) {
	return {
		type: UPDATE_CLIQZ_MODULE_DATA,
		data
	};
}

/**
 * Update Summary data
 * @return {Object}
 */
export function updateSummaryData(data) {
	return {
		type: UPDATE_SUMMARY_DATA,
		data,
	};
}

/**
 * Called from utils.blocking.updateSummaryBlockingCount()
 * @param  {Object} data
 * @return {Object}
 */
export function updateTrackerCounts(data) {
	return {
		type: UPDATE_TRACKER_COUNTS,
		data,
	};
}

/**
 * Called from Summary.clickGhosteryPause()
 * @param  {Object} data
 * @return {Object}
 */
export function updateGhosteryPaused(data) {
	const pauseValue = (data.time || data.ghosteryPaused);

	return function(dispatch) {
		return sendMessageInPromise('setPanelData', { paused_blocking: pauseValue }).then(() => {
			dispatch({
				type: UPDATE_GHOSTERY_PAUSED,
				data
			});
			if (data.time) {
				setTimeout(() => {
					dispatch({
						type: UPDATE_GHOSTERY_PAUSED,
						data: { ...data, ghosteryPaused: !data.ghosteryPaused }
					});
				}, data.time);
			}
		});
	};
}

/**
 * Called from Summary.clickSitePolicy()
 * @param  {Object} data
 * @return {Object}
 */
export function updateSitePolicy(data) {
	return {
		type: UPDATE_SITE_POLICY,
		data,
	};
}

/**
 * Called from Summary.clickTrackersBlocked() and picked up by
 * blocking reducer
 * @param  {Object} data
 * @return {Object}
*/
export function filterTrackers(data) {
	return {
		type: FILTER_TRACKERS,
		data,
	};
}
