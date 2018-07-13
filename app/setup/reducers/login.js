/**
 * Log In Reducer
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
	GET_LOGIN_INFO,
	LOGIN_SUCCESS,
	LOGIN_FAIL,
	CREATE_ACCOUNT,
	CREATE_ACCOUNT_SUCCESS,
	CREATE_ACCOUNT_FAIL,
	SIGN_IN,
	SIGN_OUT,
	CLEAR_MESSAGE
} from '../constants/constants';

import { msg } from '../utils';

const initialState = {
	payload: {},
	success: false,
	loading: false,
	message: '',
	triggerSignIn: false,
	triggerCreateAccount: false,
};

/**
 * Default export for log-in reducer.
 * Process log-in and return updated state.
 * @param  {Object} state 		current state
 * @param  {Object} action 		action which provides data
 * @return {Object}        		updated state clone
 * @memberof  SetupReactReducers
 */
export default (state = initialState, action) => {
	switch (action.type) {
		case GET_LOGIN_INFO: {
			return Object.assign({}, state, {
				success: action.data.logged_in,
				payload: action.data,
			});
		}
		case CREATE_ACCOUNT_SUCCESS:
			msg.sendMessage('ping', 'create_account_setup');
			return Object.assign({}, state, {
				success: true,
				loading: false,
				payload: action.data.payload,
				message: action.data.text,
				triggerSignIn: initialState.triggerSignIn,
				triggerCreateAccount: initialState.triggerCreateAccount,
			});
		case LOGIN_SUCCESS: {
			return Object.assign({}, state, {
				success: true,
				loading: false,
				payload: action.data.payload,
				message: action.data.text,
				triggerSignIn: initialState.triggerSignIn,
				triggerCreateAccount: initialState.triggerCreateAccount,
			});
		}
		case LOGIN_FAIL: {
			return Object.assign({}, state, {
				success: false,
				loading: false,
				payload: initialState.payload,
				message: action.data,
				triggerSignIn: initialState.triggerSignIn,
				triggerCreateAccount: initialState.triggerCreateAccount,
			});
		}
		case CREATE_ACCOUNT: {
			return Object.assign({}, state, {
				triggerCreateAccount: true,
				loading: true,
			});
		}
		case CREATE_ACCOUNT_FAIL: {
			return Object.assign({}, state, {
				triggerCreateAccount: false,
				success: false,
				loading: false,
				message: action.data.text,
			});
		}
		case SIGN_IN: {
			return Object.assign({}, state, {
				triggerSignIn: true,
				loading: true,
			});
		}
		case CLEAR_MESSAGE: {
			return Object.assign({}, state, { message: '' });
		}
		default: return state;
	}
};
