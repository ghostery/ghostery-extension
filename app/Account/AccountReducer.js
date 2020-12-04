/**
 * Account Reducer
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
	LOGIN_SUCCESS,
	LOGOUT_SUCCESS,
	REGISTER_SUCCESS,
	GET_USER_SUCCESS,
	GET_USER_SETTINGS_SUCCESS,
	GET_USER_SUBSCRIPTION_DATA_FAIL,
	GET_USER_SUBSCRIPTION_DATA_SUCCESS,
	RESET_PASSWORD_SUCCESS,
	RESET_PASSWORD_FAIL,
	ACCOUNT_DATA_EMAIL_PREFERENCES_CHECKBOX_CHANGE
} from './AccountConstants';
import { UPDATE_PANEL_DATA } from '../panel/constants/constants';

const initialState = {
	loggedIn: false,
	userID: '',
	user: null,
	userSettings: null,
	subscriptionData: null,
	toastMessage: '',
	resetPasswordError: false
};

export default (state = initialState, action) => {
	switch (action.type) {
		case UPDATE_PANEL_DATA: {
			const { account } = action.data;
			if (account === null) {
				return { ...initialState };
			}
			const {
				userID, user, userSettings, subscriptionData
			} = account;
			return {
				...state,
				loggedIn: true,
				userID,
				user,
				userSettings,
				subscriptionData
			};
		}
		case REGISTER_SUCCESS:
		case LOGIN_SUCCESS: {
			return { ...state, loggedIn: true };
		}
		case LOGOUT_SUCCESS: {
			return { ...initialState };
		}
		case GET_USER_SUCCESS: {
			const { user } = action.payload;
			return {
				...state,
				loggedIn: true,
				user
			};
		}
		case GET_USER_SETTINGS_SUCCESS: {
			const { settings } = action.payload;
			return {
				...state,
				loggedIn: true,
				userSettings: settings
			};
		}
		case GET_USER_SUBSCRIPTION_DATA_FAIL: {
			const { subscriptionData } = initialState;
			return { ...state, subscriptionData };
		}
		case GET_USER_SUBSCRIPTION_DATA_SUCCESS: {
			const { subscriptionData } = action.payload;
			return {
				...state,
				loggedIn: true,
				subscriptionData
			};
		}
		case RESET_PASSWORD_SUCCESS: {
			const toastMessage = t('banner_check_your_email_title');
			return {
				...state,
				toastMessage,
				resetPasswordError: false
			};
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
			return {
				...state,
				toastMessage: errorText,
				resetPasswordError: true
			};
		}
		case ACCOUNT_DATA_EMAIL_PREFERENCES_CHECKBOX_CHANGE: {
			const { name, checked } = action.payload;
			let emailPreferences;
			if (name === 'global') {
				emailPreferences = { ...state.user.emailPreferences, ...{ global: checked } };
			}
			const user = { ...state.user, ...{ emailPreferences } };
			return { ...state, ...{ user } };
		}

		default: return state;
	}
};
