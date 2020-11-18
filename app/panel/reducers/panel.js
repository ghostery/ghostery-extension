/**
 * Panel Reducer
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
	UPDATE_PANEL_DATA,
	SHOW_NOTIFICATION,
	CLOSE_NOTIFICATION,
	TOGGLE_EXPERT,
	TOGGLE_CLIQZ_FEATURE,
	UPDATE_NOTIFICATION_STATUS,
	TOGGLE_CHECKBOX,
	TOGGLE_EXPANDED,
	SET_THEME,
	CLEAR_THEME,
	TOGGLE_PROMO_MODAL
} from '../constants/constants';
import {
	LOGIN_SUCCESS,
	LOGIN_FAIL,
	LOGOUT_SUCCESS,
	REGISTER_SUCCESS,
	REGISTER_FAIL,
	RESET_PASSWORD_SUCCESS,
	RESET_PASSWORD_FAIL
} from '../../Account/AccountConstants';
import { sendMessage, sendMessageInPromise } from '../utils/msg';
import { setTheme } from '../utils/utils';

const initialState = {
	enable_ad_block: true,
	enable_anti_tracking: true,
	enable_smart_block: true,
	initialized: false, // prevent rendering subviews before UPDATE_PANEL_DATA resolves
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
	loggedIn: false,
	email: '',
	emailValidated: false,
	current_theme: 'default',
	isPromoModalHidden: false,
};

/**
 * Trigger notification and needsReload banners. Persist the change.
 * @memberOf  PanelReactReducers
 * @private
 * @param  {Object} state 		current state
 * @param  {Object} action 		action which contains data
 * @return {Object}        		notification parameters
 */
const _showNotification = (state, action) => {
	const msg = action.data || action.payload;
	// overrideNotificationShown ensures certain notifications are shown regardless of user's settings
	const { reload, overrideNotificationShown } = msg;

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
		notificationShown: overrideNotificationShown || updated_notificationShown,
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
const _closeNotification = () => ({
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
		case UPDATE_PANEL_DATA: {
			return { ...state, ...action.data, initialized: true };
		}
		case SET_THEME: {
			const { name, css } = action.data;
			setTheme(document, name, { themeData: { [name]: { name, css } } });
			return { ...state, current_theme: name };
		}
		case CLEAR_THEME: {
			setTheme(document, initialState.current_theme);
			return { ...state, current_theme: initialState.current_theme };
		}
		case SHOW_NOTIFICATION: {
			const updated = _showNotification(state, action);
			return { ...state, ...updated };
		}
		case CLOSE_NOTIFICATION: {
			const updated = _closeNotification(state, action);
			return { ...state, ...updated };
		}
		case LOGIN_SUCCESS: {
			const notificationAction = {
				payload: {
					text: `${t('panel_signin_success')} ${action.payload.email}`,
					classes: 'success',
					overrideNotificationShown: true,
				}
			};
			const updated = _showNotification(state, notificationAction);
			return { ...state, ...updated, loggedIn: true };
		}
		case LOGIN_FAIL: {
			const { errors } = action.payload;
			let errorText = t('server_error_message');
			errors.forEach((err) => {
				switch (err.code) {
					case '10050':
					case '10110':
						errorText = t('no_such_email_password_combo');
						break;
					case 'too_many_failed_logins':
						errorText = t('too_many_failed_logins_text');
						break;
					default:
						errorText = t('server_error_message');
				}
			});
			const notificationAction = {
				payload: {
					text: errorText,
					classes: 'alert',
					overrideNotificationShown: true,
				}
			};
			const updated = _showNotification(state, notificationAction);
			return { ...state, ...updated };
		}
		case REGISTER_SUCCESS: {
			const { email } = action.payload;
			const notificationAction = {
				payload: {
					text: t('panel_email_verification_sent', email),
					classes: 'success',
					overrideNotificationShown: true,
				}
			};
			const updated = _showNotification(state, notificationAction);
			return { ...state, ...updated, email };
		}
		case REGISTER_FAIL: {
			const { errors } = action.payload;
			let errorText = t('server_error_message');
			errors.forEach((err) => {
				switch (err.code) {
					case '10070':
						errorText = t('email_address_in_use');
						break;
					case '10080':
						errorText = t('your_email_do_not_match');
						break;
					default:
						errorText = t('server_error_message');
				}
			});
			const notificationAction = {
				payload: {
					text: errorText,
					classes: 'alert',
					overrideNotificationShown: true,
				}
			};
			const updated = _showNotification(state, notificationAction);
			return { ...state, ...updated };
		}
		case LOGOUT_SUCCESS: {
			setTheme(document);
			return { ...state, current_theme: initialState.current_theme };
		}
		case RESET_PASSWORD_SUCCESS: {
			const notificationAction = {
				payload: {
					text: t('banner_check_your_email_title'),
					classes: 'success',
					overrideNotificationShown: true,
				}
			};
			const updated = _showNotification(state, notificationAction);
			return { ...state, ...updated };
		}
		case RESET_PASSWORD_FAIL: {
			const { errors } = action.payload;
			let errorText = t('server_error_message');
			errors.forEach((err) => {
				switch (err.code) {
					case '10050':
					case '10110':
						errorText = t('banner_email_not_in_system_message');
						break;
					case 'too_many_password_resets':
						errorText = t('too_many_password_resets_text');
						break;
					default:
						errorText = t('server_error_message');
				}
			});
			const notificationAction = {
				payload: {
					text: errorText,
					classes: 'alert',
					overrideNotificationShown: true,
				}
			};
			const updated = _showNotification(state, notificationAction);
			return { ...state, ...updated };
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
			return { ...state, [action.data.featureName]: !action.data.isEnabled };
		}
		case TOGGLE_EXPANDED: {
			sendMessage('setPanelData', { is_expanded: !state.is_expanded });
			sendMessage('ping', state.is_expanded ? 'viewchange_from_expanded' : 'viewchange_from_detailed');

			return { ...state, is_expanded: !state.is_expanded };
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
			return { ...state, is_expert: !state.is_expert };
		}
		case UPDATE_NOTIFICATION_STATUS: {
			const updated = _updateNotificationStatus(state, action);
			return { ...state, ...updated };
		}
		case TOGGLE_CHECKBOX: {
			return state;
		}
		case TOGGLE_PROMO_MODAL: {
			return {
				...state,
				isPromoModalHidden: !state.isPromoModalHidden
			};
		}
		default: return state;
	}
};
