/**
 * Settings Action creators
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
	IMPORT_SETTINGS_DIALOG,
	IMPORT_SETTINGS_NATIVE,
	IMPORT_SETTINGS_FAILED,
	EXPORT_SETTINGS,
	SELECT_ITEM,
	TOGGLE_CHECKBOX,
	UPDATE_DATABASE,
	UPDATE_NOTIFICATION_STATUS,
	UPDATE_SETTINGS_BLOCK_ALL_TRACKERS,
	UPDATE_SETTINGS_CATEGORY_BLOCKED,
	UPDATE_SETTINGS_TRACKER_BLOCKED,
	SETTINGS_TOGGLE_EXPAND_ALL,
	SETTINGS_TOGGLE_EXPAND_CATEGORY,
	SETTINGS_UPDATE_SEARCH_VALUE,
	SETTINGS_SEARCH_SUBMIT,
	SETTINGS_FILTER,
	GET_SETTINGS_DATA
} from '../constants/constants';
import { sendMessageInPromise } from '../utils/msg';
import { hashCode } from '../../../src/utils/common';
import globals from '../../../src/classes/Globals';

/**
 * Fetch settings data from background
 * The panel uses a dynamic UI port, but the hub does not
 * @return {Object} dispatch
 */
export function getSettingsData(portData) {
	if (portData) {
		return {
			type: GET_SETTINGS_DATA,
			data: portData
		};
	}

	return function (dispatch) {
		return sendMessageInPromise('getSettingsData', {})
			.then((promisedData) => {
				dispatch({
					type: GET_SETTINGS_DATA,
					data: promisedData,
				});
			});
	};
}

/**
 * Trigger a Ghostery dialog window to import user settings
 * @return {Object} dispatch
 */
export function importSettingsDialog(pageUrl) {
	const url = pageUrl || '';
	// Check if this is http(s) page
	return function (dispatch) {
		if (url.search('http') === -1) {
			dispatch({
				type: IMPORT_SETTINGS_DIALOG,
				data: 'false',
			});
			return Promise.resolve();
		}
		return sendMessageInPromise('showBrowseWindow').then((data) => {
			dispatch({
				type: IMPORT_SETTINGS_DIALOG,
				data,
			});
		});
	};
}

/**
 * Import user settings file using native browser window
 * @param  {Object} data
 * @return {Object} dispatch
 */
export function importSettingsNative(fileToLoad) {
	return function (dispatch) {
		const fileReader = new FileReader();
		fileReader.onload = (fileLoadedEvent) => {
			try {
				const backup = JSON.parse(fileLoadedEvent.target.result);
				if (backup.hash !== hashCode(JSON.stringify(backup.settings))) {
					throw new Error('Invalid hash');
				}
				const settings = (backup.settings || {}).conf || {};
				dispatch({
					type: IMPORT_SETTINGS_NATIVE,
					settings,
				});
			} catch (err) {
				dispatch({
					type: IMPORT_SETTINGS_FAILED,
				});
			}
		};
		fileReader.readAsText(fileToLoad, 'UTF-8');
	};
}

/**
 * Called from Account tab
 * @return {Object} dispatch
 */
export function exportSettings(pageUrl) {
	const url = pageUrl || '';
	// Check if this is http(s) page
	return function (dispatch) {
		if (url.search('http') === -1 ||
			(globals.BROWSER_INFO.name === 'edge' && url.search('www.msn.com/spartan') !== -1)) {
			dispatch({
				type: EXPORT_SETTINGS,
				data: 'RESERVED_PAGE',
			});
			return Promise.resolve();
		}
		return sendMessageInPromise('getSettingsForExport').then((data) => {
			dispatch({
				type: EXPORT_SETTINGS,
				data,
			});
		});
	};
}

/**
 * Called when a <select> field is updated in Settings
 * @param  {Object} data
 * @return {Object}
 */
export function selectItem(data) {
	return {
		type: SELECT_ITEM,
		data,
	};
}

/**
 * Called when a checkbox is clicked in Settings. For trackers_banner_status and
 * reload_banner_status, send to the panel reducer.
 * @param  {Object} data
 * @return {Object}
 */
export function toggleCheckbox(data) {
	let type = TOGGLE_CHECKBOX;

	if (data.event === 'trackers_banner_status' || data.event === 'reload_banner_status') {
		type = UPDATE_NOTIFICATION_STATUS;
	}

	return {
		type,
		data,
	};
}

/**
 * Called from GeneralSettings
 * @return {Object} dispatch
 */
export function updateDatabase() {
	return function (dispatch) {
		return sendMessageInPromise('update_database').then((result) => {
			let resultText;
			if (result && result.success === true) {
				if (result.updated === true) {
					resultText = t('settings_update_success');
				} else {
					resultText = t('settings_update_up_to_date');
				}
			} else {
				resultText = t('settings_update_failed');
			}

			dispatch({
				type: UPDATE_DATABASE,
				resultText,
			});
		});
	};
}

/**
 * Called from Tracker.clickHeaderCheckbox() in GlobalSettings
 * @param  {Object} data
 * @return {Object}
 */
export function updateBlockAllTrackers(data) {
	return {
		type: UPDATE_SETTINGS_BLOCK_ALL_TRACKERS,
		data,
	};
}

/**
 * Called from Category.clickCategoryStatus() in GlobalSettings
 * @param  {Object} data
 * @return {Object}
 */
export function updateCategoryBlocked(data) {
	return {
		type: UPDATE_SETTINGS_CATEGORY_BLOCKED,
		data,
	};
}

/**
 * Called from Tracker.clickTrackerStatus() in GlobalSettings
 * @param  {Object} data
 * @return {Object}
 */
export function updateTrackerBlocked(data) {
	return {
		type: UPDATE_SETTINGS_TRACKER_BLOCKED,
		data,
	};
}

/**
 * Overide PanelActions.showNotification to prevent reload banners on GlobalBlocking
 * @param  {Object} data
 * @return {Object}
 */
export function showNotification(data) {
	return {
		type: 'DO_NOTHING',
		data,
	};
}

/**
 * Called from BlockingHeader.clickExpandAll()
 * @param  {Object} data
 * @return {Object}
 */
export function toggleExpandAll(data) {
	return {
		type: SETTINGS_TOGGLE_EXPAND_ALL,
		data,
	};
}

/**
 * Called from Category.toggleCategoryTrackers()
 * @param  {Object} data
 * @return {Object}
 */
export function toggleExpandCategory(data) {
	return {
		type: SETTINGS_TOGGLE_EXPAND_CATEGORY,
		data,
	};
}

/**
 * Called from BlockingHeader
 * @param  {Object} data
 * @return {Object}
 */
export function updateSearchValue(data) {
	return {
		type: SETTINGS_UPDATE_SEARCH_VALUE,
		data,
	};
}

export function handleSearchSubmit(data) {
	return {
		type: SETTINGS_SEARCH_SUBMIT,
		data,
	};
}

export function filter(data) {
	return {
		type: SETTINGS_FILTER,
		data,
	};
}
