/**
 * Summary Action creators
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
	GET_SUMMARY_DATA,
	UPDATE_TRACKER_COUNTS,
	UPDATE_GHOSTERY_PAUSED,
	UPDATE_SITE_POLICY,
	FILTER_TRACKERS
} from '../constants/constants';
import { sendMessageInPromise } from '../utils/msg';

/**
 * Fetch summary data from background
 * @deprecated  in favor or PanelActions.getPanelData()
 * @return {Object} dispatch
 */
export function getSummaryData(tabId) {
	return function (dispatch) {
		return sendMessageInPromise('getPanelData', {
			tabId,
			view: 'summary',
		}).then((data) => {
			dispatch({
				type: GET_SUMMARY_DATA,
				data,
			});
		});
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

	return function (dispatch) {
		return sendMessageInPromise('setPanelData', { paused_blocking: pauseValue }).then(() => {
			dispatch({
				type: UPDATE_GHOSTERY_PAUSED,
				data
			});
			if (data.time) {
				setTimeout(() => {
					data.ghosteryPaused = !data.ghosteryPaused;
					dispatch({
						type: UPDATE_GHOSTERY_PAUSED,
						data
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
