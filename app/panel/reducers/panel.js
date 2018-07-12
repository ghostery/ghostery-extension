/**
 * Panel Reducer
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

import {
	GET_PANEL_DATA,
	SHOW_NOTIFICATION,
	CLOSE_NOTIFICATION,
	LOGIN_SUCCESS,
	LOGIN_DATA_SUCCESS,
	LOGOUT,
	CREATE_ACCOUNT_SUCCESS,
	TOGGLE_EXPANDED,
	TOGGLE_EXPERT,
	TOGGLE_CLIQZ_FEATURE,
	UPDATE_NOTIFICATION_STATUS,
	TOGGLE_CHECKBOX,
	TOGGLE_OFFERS_ENABLED,
	REMOVE_OFFER,
	SET_OFFER_READ
} from '../constants/constants';
import { sendMessage, sendMessageInPromise } from '../utils/msg';

const initialState = {
	enable_ad_block: true,
	enable_anti_tracking: true,
	enable_smart_block: true,
	initialized: false, // prevent rendering subviews before GET_PANEL_DATA resolves
	is_expanded: false,
	is_expert: false,
	needsReload: {
		changes: {},
	},
	notificationClasses: '',
	notificationFilter: '', // compatibility/slow tracker/success message
	notificationText: '',
	notificationShown: false,
	reload_banner_status: true,
	trackers_banner_status: true,
};
/**
 * Default export for panel view reducer. Handles actions
 * which are common to many derived views.
 * @memberOf  PanelReactReducers
 *
 * @param  {Object} state 		current state
 * @param  {Object} action 		action which provides data
 * @return {Object}        		updated state clone
 */
export default (state = initialState, action) => {
	switch (action.type) {
		case GET_PANEL_DATA: {
			return Object.assign({}, state, action.data, { initialized: true });
		}
		case SHOW_NOTIFICATION: {
			const updated = _showNotification(state, action);
			return Object.assign({}, state, updated);
		}
		case CLOSE_NOTIFICATION: {
			const updated = _closeNotification(state, action);
			return Object.assign({}, state, updated);
		}
		case CREATE_ACCOUNT_SUCCESS:
			return Object.assign({}, state, {
				logged_in: true,
				email: action.data.email,
				is_validated: action.data.is_validated
			});
		case LOGIN_SUCCESS: {
			return Object.assign({}, state, {
				logged_in: true
			});
		}
		case LOGIN_DATA_SUCCESS: {
			return Object.assign({}, state, {
				email: action.data.email,
				is_validated: action.data.is_validated
			});
		}
		case LOGOUT: {
			return Object.assign({}, state, {
				logged_in: false,
				email: '',
				is_validated: false
			});
		}
		case TOGGLE_CLIQZ_FEATURE: {
			let pingName = '';
			switch (action.data.featureName) {
				case 'enable_anti_tracking':
					pingName = action.data.isEnabled ? 'antitrack_off' : 'antitrack_on';
					break;
				case 'enable_ad_block':
					pingName = action.data.isEnabled ? 'adblock_off' : 'adblock_on';
					break;
				case 'enable_smart_block':
					pingName = action.data.isEnabled ? 'smartblock_off' : 'smartblock_on';
					break;
				default:
					break;
			}
			sendMessageInPromise('setPanelData', { [action.data.featureName]: !action.data.isEnabled }).then(() => {
				if (pingName) {
					sendMessage('ping', pingName);
				}
			});
			return Object.assign({}, state, { [action.data.featureName]: !action.data.isEnabled });
		}
		case TOGGLE_EXPANDED: {
			sendMessage('setPanelData', { is_expanded: !state.is_expanded });
			sendMessage('ping', state.is_expanded ? 'viewchange_from_expanded' : 'viewchange_from_detailed');

			return Object.assign({}, state, { is_expanded: !state.is_expanded });
		}
		case TOGGLE_EXPERT: {
			sendMessage('setPanelData', { is_expert: !state.is_expert });
			let pingName = '';
			if (state.is_expert) {
				if (state.is_expanded) {
					pingName = 'viewchange_from_expanded';
				} else {
					pingName = 'viewchange_from_detailed';
				}
			} else {
				pingName = 'viewchange_from_simple';
			}
			sendMessage('ping', pingName);
			return Object.assign({}, state, { is_expert: !state.is_expert });
		}
		case UPDATE_NOTIFICATION_STATUS: {
			const updated = _updateNotificationStatus(state, action);
			return Object.assign({}, state, updated);
		}
		case TOGGLE_CHECKBOX: {
			if (action.data.event === 'enable_offers') {
				const enable_offers = action.data.checked;
				return Object.assign({}, state, { enable_offers });
			}
			return state;
		}
		case TOGGLE_OFFERS_ENABLED: {
			const enable_offers = action.data.enabled;
			return Object.assign({}, state, { enable_offers });
		}
		case REMOVE_OFFER:
		case SET_OFFER_READ: {
			const unread_offer_ids = state.unread_offer_ids.slice();
			const idx = unread_offer_ids.indexOf(action.data.id);
			if (idx !== -1) {
				unread_offer_ids.splice(idx, 1);
				return Object.assign({}, state, { unread_offer_ids });
			}
			return state;
		}
		default: return state;
	}
};

/**
 * Trigger notifcation and needsReload banners. Persist the change.
 * @memberOf  PanelReactReducers
 * @private
 * @param  {Object} state 		current state
 * @param  {Object} action 		action which contains data
 * @return {Object}        		notification parameters
 */
const _showNotification = (state, action) => {
	const msg = action.data;
	const { reload } = msg;

	let updated_notificationClasses = state.notificationClasses;
	let updated_notificationShown = state.notificationShown;
	let updated_needsReload = state.needsReload; // clone below if needed

	// Reload Banners
	if (reload) {
		// deep clone nested "changes" object
		updated_needsReload = { ...state.needsReload, changes: { ...state.needsReload.changes } };

		// handle case where user clicks 'whitelist' then 'blacklist', or inverse
		if (msg.updated === 'blacklist' && updated_needsReload.changes.hasOwnProperty('whitelist')) {
			delete updated_needsReload.changes.whitelist;
		} else if (msg.updated === 'whitelist' && updated_needsReload.changes.hasOwnProperty('blacklist')) {
			delete updated_needsReload.changes.blacklist;
		}

		// update the 'changes' object.  if the changed item already exists, remove it to signal a disable has occurred
		if (updated_needsReload.changes.hasOwnProperty(msg.updated)) {
			delete updated_needsReload.changes[msg.updated];
		} else if (msg.updated !== 'init') { // ignore the 'init' change, which comes from Panel.jsx to persist banners
			updated_needsReload.changes[msg.updated] = true;
		}

		// persist to background
		sendMessage('setPanelData', { needsReload: updated_needsReload });

		// if we have changes and the user wants to see banners, then show
		if ((msg.text || Object.keys(updated_needsReload.changes).length > 0) && state.reload_banner_status) {
			updated_notificationShown = true;
		} else {
			updated_notificationShown = false;
		}

		updated_notificationClasses = msg.classes || 'warning';
	} else {
		// Notification banners (success/warnings)
		if (state.trackers_banner_status) {
			updated_notificationShown = true;
		} else {
			updated_notificationShown = false;
		}

		updated_notificationClasses = msg.classes || '';
		if (msg.filter === 'tooltip') {
			updated_needsReload.changes = {};
		}
	}
	return {
		needsReload: updated_needsReload,
		notificationClasses: updated_notificationClasses,
		notificationFilter: msg.filter || '',
		notificationText: msg.text || '',
		notificationShown: updated_notificationShown,
	};
};

/**
 * Dismiss notification banners. Update notificationShown
 * @memberOf  PanelReactReducers
 * @private
 * @param  {Object} state 		current state
 * @param  {Object} action 		action which contains data
 * @return {Object}        		notification parameters
 */
const _closeNotification = (state, action) => ({
	notificationShown: false
});

/**
 * Update reload_banner_status and trackers_banner_status from
 * Settings > Notifications. Persist the change.
 * @memberOf  PanelReactReducers
 * @private
 *
 * @param  {Object} state 		current state
 * @param  {Object} action 		action which contains data
 * @return {Object}        		notification parameter
 */
const _updateNotificationStatus = (state, action) => {
	const banner_status = action.data.checked;
	const banner_status_name = action.data.event;
	// persist to background
	sendMessage('setPanelData', { [banner_status_name]: banner_status });

	return {
		[banner_status_name]: banner_status,
	};
};
