/**
 * Settings Reducer
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

import moment from 'moment/min/moment-with-locales.min';
import {
	IMPORT_SETTINGS_DIALOG,
	IMPORT_SETTINGS_NATIVE,
	IMPORT_SETTINGS_FAILED,
	EXPORT_SETTINGS,
	SELECT_ITEM,
	TOGGLE_CHECKBOX,
	UPDATE_DATABASE,
	UPDATE_SETTINGS_BLOCK_ALL_TRACKERS,
	UPDATE_SETTINGS_CATEGORY_BLOCKED,
	UPDATE_SETTINGS_TRACKER_BLOCKED,
	SETTINGS_TOGGLE_EXPAND_ALL,
	SETTINGS_TOGGLE_EXPAND_CATEGORY,
	SETTINGS_UPDATE_SEARCH_VALUE,
	SETTINGS_FILTER,
	GET_SETTINGS_DATA
} from '../constants/constants';
import { updateTrackerBlocked, updateCategoryBlocked, updateBlockAllTrackers, toggleExpandAll, toggleExpandCategory } from '../utils/blocking';
import { removeFromObject, updateObject } from '../utils/utils';
import { sendMessage } from '../utils/msg';
import globals from '../../../src/classes/Globals';
import { objectEntries } from '../../../src/utils/common';

const initialState = {
	expand_all_trackers: false,
	filtered: false,
	actionSuccess: false,
	dbUpdateText: t('settings_update_now'),
	exportResultText: '',
	importResultText: '',
	site_specific_blocks: {},
	site_specific_unblocks: {},
	filterText: t('settings_filter_all_label')
};
/**
 * Default export for settings view reducer.
 * @memberOf  PanelReactReducers
 *
 * @param  {Object} state 		current state
 * @param  {Object} action 		action which provides data
 * @return {Object}        		updated state clone
 */
export default (state = initialState, action) => {
	switch (action.type) {
		case GET_SETTINGS_DATA: {
			return Object.assign({}, state, action.data);
		}
		case EXPORT_SETTINGS: {
			const updated = _exportSettings(state, action);
			return Object.assign({}, state, updated);
		}
		case IMPORT_SETTINGS_DIALOG: {
			const updated = _importSettingsDialog(state, action);
			return Object.assign({}, state, updated);
		}
		case IMPORT_SETTINGS_NATIVE: {
			const updated = _importSettingsNative(state, action);
			return Object.assign({}, state, updated);
		}
		case IMPORT_SETTINGS_FAILED: {
			return Object.assign({}, state, {
				importResultText: t('settings_import_file_error'),
				actionSuccess: false,
			});
		}
		case SELECT_ITEM: {
			const updated = _updateSelectValue(state, action);
			return Object.assign({}, state, updated);
		}
		case TOGGLE_CHECKBOX: {
			const updated = _updateSettingsCheckbox(state, action);
			return Object.assign({}, state, updated);
		}
		case UPDATE_DATABASE: {
			const updated = _updateTrackerDatabase(state, action);
			return Object.assign({}, state, updated);
		}

		case UPDATE_SETTINGS_BLOCK_ALL_TRACKERS: {
			const updated = updateBlockAllTrackers(state, action);
			return Object.assign({}, state, updated);
		}
		case UPDATE_SETTINGS_CATEGORY_BLOCKED: {
			const updated = updateCategoryBlocked(state, action);
			return Object.assign({}, state, updated);
		}
		case SETTINGS_TOGGLE_EXPAND_ALL: {
			const updated = toggleExpandAll(state, action);
			return Object.assign({}, state, updated);
		}
		case SETTINGS_TOGGLE_EXPAND_CATEGORY: {
			const updated = toggleExpandCategory(state, action);
			return Object.assign({}, state, updated);
		}
		case UPDATE_SETTINGS_TRACKER_BLOCKED: {
			const updated = updateTrackerBlocked(state, action);
			return Object.assign({}, state, updated);
		} case SETTINGS_UPDATE_SEARCH_VALUE: {
			const updated = _updateSearchValue(state, action);
			return Object.assign({}, state, updated);
		} case SETTINGS_FILTER: {
			const updated = _filter(state, action);
			return Object.assign({}, state, updated);
		}

		default: return state;
	}
};

/**
 * Update state to reflect success/failure of settings export.
 * Persist the time of the last successful export operation.
 * @memberOf  PanelReactReducers
 * @private
 *
 * @param  {Object} state 		current state
 * @param  {Object} action 		action with data
 * @return {Object}        		resulting export parameters
 */
const _exportSettings = (state, action) => {
	const result = action.data;
	let	updated_settings_last_exported = state.settings_last_exported;
	let updated_actionSuccess = state.actionSuccess;
	let updated_exportResultText = state.exportResultText;
	if (result && result !== 'RESERVED_PAGE') {
		updated_settings_last_exported = Number((new Date()).getTime());
		if (globals.BROWSER_INFO.name === 'edge') {
			window.close();
		}
		moment.locale(state.language).toLowerCase().replace('_', '-');
		updated_exportResultText = `${t('settings_export_success')} ${moment(updated_settings_last_exported).format('LLL')}`;
		updated_actionSuccess = true;

		// persist to background
		sendMessage('setPanelData', { settings_last_exported: updated_settings_last_exported });
	} else {
		updated_actionSuccess = false;
		updated_exportResultText = (result === 'RESERVED_PAGE') ? t('settings_export_reserved_page_error') : t('settings_export_error');
	}

	return {
		actionSuccess: updated_actionSuccess,
		exportResultText: updated_exportResultText,
		settings_last_exported: updated_settings_last_exported,
	};
};

/**
 * Handle result of settings import using Ghostery dialog window. Updated Conf properties
 * are handled via the background.
 * @memberOf  PanelReactReducers
 * @private
 *
 * @param  {Object} state 			current state
 * @param  {Object} action 			action with data
 * @return {Object}        			resulting import parameters
 */
const _importSettingsDialog = (state, action) => {
	const result = action.data;
	const updated_actionSuccess = state.actionSuccess;
	let updated_importResultText = state.importResultText;

	if (result === true) {
		// showBrowseWindow was successful
		window.close();
	} else {
		state.updated_actionSuccess = false;
		updated_importResultText = t('settings_import_dialog_error');
	}

	return {
		actionSuccess: updated_actionSuccess,
		importResultText: updated_importResultText,
	};
};

/**
 * Loop over settings loaded via a native browser window, and persist to background.
 * @memberOf  PanelReactReducers
 * @private
 *
 * @param  {Object} state 		current state
 * @param  {Object} action 		action with data
 * @return {Object}        		new state object
 */
const _importSettingsNative = (state, action) => {
	const { settings } = action;
	const updated_state = {};
	// eslint-disable-next-line prefer-const
	for (let [key, value] of objectEntries(settings)) {
		if (key === 'alert_bubble_timeout') {
			value = (value > 30) ? 30 : value;
		}
		updated_state[key] = value;
	}

	updated_state.settings_last_imported = Number((new Date()).getTime());
	updated_state.importResultText = `${t('settings_import_success')} ${moment(updated_state.settings_last_imported).format('LLL')}`;
	updated_state.actionSuccess = true;

	// persist to background
	sendMessage('setPanelData', updated_state);

	return updated_state;
};

/**
 * General handler for all <select> fields in Settings.
 * @memberOf  PanelReactReducers
 * @private
 *
 * @param  {Object} state 		current state
 * @param  {Object} action 		action with data
 * @return {Object}        		updated value
 */
const _updateSelectValue = (state, action) => {
	const msg = action.data;
	const { event, value } = msg;

	// persist to background
	sendMessage('setPanelData', { [event]: value });

	return {
		[event]: value,
	};
};

/**
 * General handler for all checkboxes in Settings.
 * @memberOf  PanelReactReducers
 * @private
 *
 * @param  {Object} state 		current state
 * @param  {Object} action 		action with data
 * @return {Object}        		updated checkbox state
 */
const _updateSettingsCheckbox = (state, action) => {
	const msg = action.data;
	const { event, checked } = msg;

	// persist to background
	sendMessage('setPanelData', { [event]: checked });

	return {
		[event]: checked,
	};
};

/**
 * Check for new DB updates.
 * @memberOf  PanelReactReducers
 * @private
 *
 * @param  {Object} state 		current state
 * @param  {Object} action 		action with data
 * @return {Object}        		text with result of the operation
 */
const _updateTrackerDatabase = (state, action) => {
	const { resultText } = action;

	return {
		dbUpdateText: resultText,
	};
};

/**
 * Update tracker selection based on the search value.
 * @memberOf  PanelReactReducers
 * @private
 *
 * @param  {Object} state 			current state
 * @param  {Object} action 			action with data
 * @return {Object} 				updated categories, some other parameters
 */
const _updateSearchValue = (state, action) => {
	const query = action.data || '';
	const updated_categories = JSON.parse(JSON.stringify(state.categories)) || []; // deep clone
	updated_categories.forEach((category) => {
		category.num_total = 0;
		category.num_blocked = 0;
		category.trackers.forEach((tracker) => {
			if (query) {
				tracker.shouldShow = !!(tracker.name.toLowerCase().indexOf(query) !== -1);
			} else {
				tracker.shouldShow = true;
			}
			if (tracker.shouldShow) {
				category.num_total++;
				if (tracker.blocked) {
					category.num_blocked++;
				}
			}
		});
	});

	if (!query) {
		return { categories: updated_categories, filtered: false };
	}
	return { categories: updated_categories, filtered: true };
};

/**
 * Expands categories with trackers selected
 * according to the specified filter.
 * @memberOf  PanelReactReducers
 * @private
 *
 * @param  {Object} state 		current state
 * @param  {Object} action 		action with data
 * @return {Object}  			updated categories, some other parameters
 */
const _filter = (state, action) => {
	const updated_categories = JSON.parse(JSON.stringify(state.categories)) || []; // deep clone
	const new_app_ids = state.new_app_ids || [];
	updated_categories.forEach((category) => {
		category.num_total = 0;
		category.num_blocked = 0;
		if (action.data === 'all') {
			category.expanded = false;
		} else {
			category.expanded = true;
		}
		category.trackers.forEach((tracker) => {
			switch (action.data) {
				case 'all':
					tracker.shouldShow = true;
					category.num_total++;
					if (tracker.blocked) {
						category.num_blocked++;
					}
					break;
				case 'blocked':
					tracker.shouldShow = tracker.blocked;
					if (tracker.shouldShow) {
						category.num_total++;
					}
					break;
				case 'unblocked':
					tracker.shouldShow = !tracker.blocked;
					if (tracker.shouldShow) {
						category.num_total++;
					}
					break;
				case 'new':
					tracker.shouldShow = !!(new_app_ids.indexOf(+tracker.id) !== -1);
					if (tracker.shouldShow) {
						category.num_total++;
					}
					break;
				default:
					break;
			}
		});
	});
	let filterText = '';
	let expandAll = true;
	switch (action.data) {
		case 'all':
			filterText = t('settings_filter_all_label');
			expandAll = false;
			break;
		case 'blocked':
			filterText = t('settings_filter_blocked_label');
			break;
		case 'unblocked':
			filterText = t('settings_filter_unblocked_label');
			break;
		case 'new':
			filterText = t('settings_filter_new_label');
			break;
		default:
			break;
	}
	return {
		categories: updated_categories, filtered: true, filterText, expandAll
	};
};
