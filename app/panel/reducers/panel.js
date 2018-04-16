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
	LOGOUT,
	CREATE_ACCOUNT_SUCCESS,
	TOGGLE_EXPANDED,
	TOGGLE_EXPERT,
	TOGGLE_CLIQZ_FEATURE,
	UPDATE_NOTIFICATION_STATUS
} from '../constants/constants';
import { sendMessage } from '../utils/msg';

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
	reload_banner_status: {
		dismissals: [],
		show: true,
	},
	trackers_banner_status: {
		dismissals: [],
		show: true,
	},
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
			sendMessage('ping', 'create_account_extension');
			return Object.assign({}, state, {
				logged_in: true,
				email: action.data.ClaimEmailAddress,
				is_validated: action.data.ClaimEmailAddressValidated,
				decoded_user_token: action.data,
			});
		case LOGIN_SUCCESS: {
			return Object.assign({}, state, {
				logged_in: true,
				email: action.data.ClaimEmailAddress,
				is_validated: action.data.ClaimEmailAddressValidated,
				decoded_user_token: action.data,
			});
		} case LOGOUT: {
			return Object.assign({}, state, {
				logged_in: action.data.logged_in,
				email: action.data.email,
				is_validated: action.data.is_validated,
				decoded_user_token: action.data.decoded_user_token,
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
			if (pingName) {
				sendMessage('ping', pingName);
			}
			sendMessage('setPanelData', { [action.data.featureName]: !action.data.isEnabled });
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
	const trackersBannerStatus = Object.assign({ ...state.trackers_banner_status, dismissals: [...state.trackers_banner_status.dismissals] });
	const reloadBannerStatus = Object.assign({ ...state.reload_banner_status, dismissals: [...state.reload_banner_status.dismissals] });
	const nowTime = Number(new Date().getTime());

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
		if ((msg.text || Object.keys(updated_needsReload.changes).length > 0) && reloadBannerStatus.show && nowTime > reloadBannerStatus.show_time) {
			updated_notificationShown = true;
		} else {
			updated_notificationShown = false;
		}

		updated_notificationClasses = msg.classes || 'warning';
	} else {
		// Notification banners (success/warnings)
		if (trackersBannerStatus.show && nowTime > trackersBannerStatus.show_time) {
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
 * Dismiss notification banners. Update the 'reload_banner_status' and
 * 'trackers_banner_status' properties. If banners are dismissed BANNERS_ALLOWED times,
 * within BANNER_INTERVAL, they will not be shown again for BANNERS_BANNED_TIME. Persist the change.
 * @memberOf  PanelReactReducers
 * @private
 * @param  {Object} state 		current state
 * @param  {Object} action 		action which contains data
 * @return {Object}        		notification parameters
 */
const _closeNotification = (state, action) => {
	const { banner_status_name } = action.data;
	const BANNER_INTERVAL = 3600000; // one hour
	const BANNERS_ALLOWED = 3;
	const BANNERS_BANNED_TIME = 604800000; // one week

	if (banner_status_name === 'temp_banner_status') {
		return {
			notificationShown: false,
		};
	}

	// deep clone nested dismissals[]
	let banner_status = { ...state[banner_status_name], dismissals: [...state[banner_status_name].dismissals] };

	// show_time becomes 0 if it was set explicitly through Settinns or Setting page,
	// or came through Sync which delivered choice different from default value
	if (!banner_status.show_time) {
		return false;
	}

	const { dismissals } = banner_status;
	const lastDismissal = Number(new Date().getTime());

	dismissals.push(lastDismissal);
	let firstDismissal = dismissals[0];

	while (lastDismissal > firstDismissal + BANNER_INTERVAL) {
		dismissals.shift();
		// eslint-disable-next-line prefer-destructuring
		firstDismissal = dismissals[0];
	}

	if (dismissals.length >= BANNERS_ALLOWED) {
		banner_status = {
			show_time: lastDismissal + BANNERS_BANNED_TIME,
			dismissals: [],
			show: false,
		};
	} else {
		banner_status = {
			show_time: lastDismissal,
			dismissals,
			show: true,
		};
	}

	// persist to background
	sendMessage('setPanelData', { [banner_status_name]: banner_status });

	return {
		[banner_status_name]: banner_status,
		notificationShown: false,
	};
};

/**
 * Set the 'show' property on reload_banner_status and trackers_banner_status. Update from
 * Settings > Notifications. Persist the change.
 * @memberOf  PanelReactReducers
 * @private
 *
 * @param  {Object} state 		current state
 * @param  {Object} action 		action which contains data
 * @return {Object}        		notification parameter
 */
const _updateNotificationStatus = (state, action) => {
	const msg = action.data;
	const banner_status_name = msg.event;
	// deep clone nested dismissals[] and update 'show'
	const banner_status = { ...state[banner_status_name], dismissals: [...state[banner_status_name].dismissals], show: msg.checked };

	// persist to background
	sendMessage('setPanelData', { [banner_status_name]: banner_status });

	return {
		[banner_status_name]: banner_status,
	};
};
