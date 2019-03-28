/**
 * Account Reducer
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
	LOGIN_SUCCESS,
	LOGOUT_SUCCESS,
	REGISTER_SUCCESS,
	GET_USER_SUCCESS,
	GET_USER_SETTINGS_SUCCESS,
	GET_USER_SUBSCRIPTION_DATA_FAIL,
	GET_USER_SUBSCRIPTION_DATA_SUCCESS
} from './AccountConstants';
import { UPDATE_PANEL_DATA } from '../panel/constants/constants';

const initialState = {
	loggedIn: false,
	userID: '',
	user: null,
	userSettings: null,
	subscriptionData: null,
};

export default (state = initialState, action) => {
	switch (action.type) {
		case UPDATE_PANEL_DATA: {
			const { account } = action.data;
			if (account === null) {
				return Object.assign({}, initialState);
			}
			const {
				userID, user, userSettings, subscriptionData
			} = account;
			return Object.assign({}, state, {
				loggedIn: true,
				userID,
				user,
				userSettings,
				subscriptionData,
			});
		}
		case REGISTER_SUCCESS:
		case LOGIN_SUCCESS: {
			return Object.assign({}, state, {
				loggedIn: true,
			});
		}
		case LOGOUT_SUCCESS: {
			return Object.assign({}, initialState);
		}
		case GET_USER_SUCCESS: {
			const { user } = action.payload;
			return Object.assign({}, state, {
				loggedIn: true,
				user
			});
		}
		case GET_USER_SETTINGS_SUCCESS: {
			const { settings } = action.payload;
			return Object.assign({}, state, {
				loggedIn: true,
				userSettings: settings
			});
		}
		case GET_USER_SUBSCRIPTION_DATA_FAIL: {
			const { subscriptionData } = initialState;
			return Object.assign({}, state, {
				subscriptionData,
			});
		}
		case GET_USER_SUBSCRIPTION_DATA_SUCCESS: {
			const { subscriptionData } = action.payload;
			return Object.assign({}, state, {
				loggedIn: true,
				subscriptionData
			});
		}

		default: return state;
	}
};
