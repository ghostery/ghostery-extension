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
	CLEAR_MESSAGE,
	SHOW_NOTIFICATION,
	TRIGGER_LOGIN,
	TRIGGER_REGISTER
} from '../constants/constants';
import {
	LOGIN_FAIL,
	GET_LOGIN_INFO,
	LOGIN_SUCCESS,
	REGISTER_SUCCESS,
	REGISTER_FAIL
} from '../../Account/AccountConstants';
import { msg } from '../utils';

const initialState = {
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
		case LOGIN_SUCCESS: {
			return Object.assign({}, state, {
				success: true,
				loading: false,
				triggerSignIn: true,
			});
		}
		case LOGIN_FAIL: {
			const { errors } = action.payload;
			let errorText = t('server_error_message');
			errors.forEach((err) => {
				switch (err.code) {
					case '10050':
					case '10110':
						errorText = t('banner_no_such_account_message');
						break;
					default:
						errorText = t('server_error_message');
				}
			});
			return Object.assign({}, state, {
				message: errorText,
				success: false,
				loading: false,
				triggerSignIn: initialState.triggerSignIn,
				triggerCreateAccount: initialState.triggerCreateAccount,
			});
		}
		case REGISTER_SUCCESS:
			msg.sendMessage('ping', 'create_account_setup');
			return Object.assign({}, state, {
				success: true,
				loading: false,
				triggerCreateAccount: true,
			});
		case REGISTER_FAIL: {
			const { errors } = action.payload;
			let errorText = t('server_error_message');
			errors.forEach((err) => {
				switch (err.code) {
					case '10070':
						errorText = t('email_address_in_use');
						break;
					case '10080':
						errorText = t('invalid_email_confirmation');
						break;
					default:
						errorText = t('server_error_message');
				}
			});
			return Object.assign({}, state, {
				message: errorText,
				success: false,
				loading: false,
				triggerSignIn: initialState.triggerSignIn,
				triggerCreateAccount: initialState.triggerCreateAccount,
			});
		}
		case TRIGGER_LOGIN: {
			return Object.assign({}, state, {
				triggerSignIn: true,
			});
		}
		case TRIGGER_REGISTER: {
			return Object.assign({}, state, {
				triggerCreateAccount: true,
			});
		}
		case SHOW_NOTIFICATION: {
			return Object.assign({}, state, {
				message: action.data.text,
			});
		}
		case CLEAR_MESSAGE: {
			return Object.assign({}, state, { message: '' });
		}
		case 'RESET': {
			return Object.assign({}, initialState);
		}
		default: return state;
	}
};
