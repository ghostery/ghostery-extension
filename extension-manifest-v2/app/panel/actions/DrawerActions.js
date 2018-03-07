/**
 * Drawer Action creators
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

import { GET_CLIQZ_MODULE_DATA,
	OPEN_DRAWER,
	CLOSE_DRAWER,
	TOGGLE_DRAWER_SETTING } from '../constants/constants';
import { sendMessageInPromise } from '../utils/msg';

/**
 * Get data for Cliqz adblock and antitracking modules
 * @return {Object} dispatch
 */
export function getCliqzModuleData() {
	return function (dispatch) {
		return sendMessageInPromise('getCliqzModuleData').then((data) => {
			dispatch({
				type: GET_CLIQZ_MODULE_DATA,
				data,
			});
		});
	};
}

/**
 * Open drawer
 * @param  {Object} data
 * @return {Object}
 */
export function openDrawer(data) {
	return {
		type: OPEN_DRAWER,
		data,
	};
}

/**
 * Close drawer
 * @return {Object}
 */
export function closeDrawer() {
	return {
		type: CLOSE_DRAWER,
	};
}

/**
 * Update checkboxes in Drawer. Picked up by Panel reducer.
 * @return {Object}
 */
export function toggleDrawerSetting(settingName, isEnabled) {
	const data = {
		settingName,
		isEnabled,
	};
	return {
		type: TOGGLE_DRAWER_SETTING,
		data,
	};
}
