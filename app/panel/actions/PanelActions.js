/**
 * Panel Action creators
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
	GET_PANEL_DATA, GET_SUMMARY_DATA, GET_BLOCKING_DATA,
	UPDATE_PANEL_DATA,
	TOGGLE_CLIQZ_FEATURE,
	SHOW_NOTIFICATION,
	CLOSE_NOTIFICATION,
	TOGGLE_EXPERT,
	SET_THEME,
	CLEAR_THEME
} from '../constants/constants';
import { sendMessageInPromise } from '../utils/msg';

/**
 * Update Cliqz Features.
 * @return {Object}
 */
export function toggleCliqzFeature(featureName, isEnabled) {
	const data = {
		featureName,
		isEnabled,
	};
	return {
		type: TOGGLE_CLIQZ_FEATURE,
		data,
	};
}

/**
 * Init Panel data
 * @return {Object}
 */
export function getPanelData(data) {
	return {
		type: GET_PANEL_DATA,
		data
	};
}

/**
 * Update Panel data
 * @return {Object}
 */
export function updatePanelData(data) {
	return {
		type: UPDATE_PANEL_DATA,
		data,
	};
}

/**
 * Update Summary data
 * @return {Object}
 */
export function updateSummaryData(data) {
	return {
		type: GET_SUMMARY_DATA,
		data,
	};
}

/**
 * Update Blocking data
 * @return {Object}
 */
export function updateBlockingData(data) {
	return {
		type: GET_BLOCKING_DATA,
		data,
	};
}

/**
 * Display notification messages on Panel (status, needsReload). Also used to persist
 * the needsReload messages if the panel is closed before the page is refreshed.
 * @param  {Object} data
 * @return {Object}
 */
export function showNotification(data) {
	return {
		type: SHOW_NOTIFICATION,
		data,
	};
}

/**
 * Close notification alert
 * @param  {Object} data
 * @return {Object}
 */
export function closeNotification(data) {
	return {
		type: CLOSE_NOTIFICATION,
		data,
	};
}

/**
 * Called from Header and Summary's toggleExpert() and picked up by panel reducer
 * @return {Object}
 */
export function toggleExpert() {
	return {
		type: TOGGLE_EXPERT,
	};
}

export const getTheme = name => dispatch => (
	sendMessageInPromise('setPanelData', { current_theme: name })
		.then(() => sendMessageInPromise('account.getTheme'))
		.then((res) => {
			if (res) {
				dispatch({
					type: SET_THEME,
					data: res,
				});
			} else {
				dispatch({
					type: CLEAR_THEME,
				});
			}
		})
);
