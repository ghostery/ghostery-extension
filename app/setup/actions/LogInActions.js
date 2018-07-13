/**
 * Login Action creators
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
import 'whatwg-fetch';
import normalize from 'json-api-normalizer';
import build from 'redux-object';
import {
	GET_LOGIN_INFO,
	LOGIN_SUCCESS,
	LOGIN_FAIL,
	CREATE_ACCOUNT_SUCCESS,
	CREATE_ACCOUNT_FAIL,
	CLEAR_MESSAGE
} from '../constants/constants';
import { msg, utils } from '../utils';
import globals from '../../../src/classes/Globals';
import { decodeJwt, log } from '../../../src/utils/common';

const API_ROOT_URL = `https://consumerapi.${globals.GHOSTERY_DOMAIN}.com`;

/**
 * called from Header.clearMessage
 * @return {Object}
 * @memberof SetupActions
 */
export function clearMessage() {
	return {
		type: CLEAR_MESSAGE,
	};
}

/**
 * Called from LogInView.componentWillMount()
 * @return {Object}
 * @memberof SetupActions
 */
export function getLoginInfo() {
	return function (dispatch) {
		return msg.sendMessageInPromise('fetchUser')
			.then((user) => {
				dispatch({
					type: GET_LOGIN_INFO,
					data: user,
				});
			});
	};
}

/**
 * Called from LogInView._createAccount()
 * @return {Object}
 * @memberof SetupActions
 */
export function createAccountFail() {
	return {
		type: CREATE_ACCOUNT_FAIL,
		data: '', // TODO
	};
}

/**
 * Called from LogInView._signIn()
 * @return {Object}
 * @memberof SetupActions
 */
export function loginFail() {
	return {
		type: LOGIN_FAIL,
		data: '', // TODO
	};
}

/**
 * Call consumerAPI and set updated login info to state
 * @param  {Object} query
 * @return {Object} dispatch
 * @memberof SetupActions
 */
export function userLogin(email, password) {
	return function (dispatch) {
		const data = `email=${window.encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
		return msg.sendMessageInPromise('userLogin', data)
			.then((response) => {
				if (response.errors) {
					log('PanelActions userLogin server error', response);
					response.errors.forEach((err) => {
						let errorText = '';
						switch (err.code) {
							case '10050':
							case '10110':
								errorText = t('banner_no_such_account_message');
								break;
							default:
								errorText = t('server_error_message');
						}
						dispatch({
							type: LOGIN_FAIL,
							data: errorText
						});
					});
					return false;
				}
				return msg.sendMessageInPromise('fetchUser')
					.then((user) => {
						dispatch({
							type: LOGIN_SUCCESS,
							data: {
								text: `${t('panel_signin_success')} ${email}`,
								payload: { email }
							}
						});
					});
			})
			.catch((err) => {
				log('PanelActions userLogin server error', err);
				dispatch({
					type: LOGIN_FAIL,
					data: t('server_error_message')
				});
			});
	};
}

/**
 * Call consumer API and create new account. Set new login info to state.
 * @param  {Object} query
 * @return {Object} dispatch
 * @memberof SetupActions
 */

export const createAccount = (email, confirmEmail, firstName, lastName, password) => (
	function (dispatch) {
		const data = `email=${window.encodeURIComponent(email)}&email_confirmation=${window.encodeURIComponent(confirmEmail)}&first_name=${window.encodeURIComponent(firstName)}&last_name=${window.encodeURIComponent(lastName)}&password=${window.encodeURIComponent(password)}`;
		return fetch(`${API_ROOT_URL}/api/v2/register`, {
			method: 'POST',
			body: data,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(data),
			},
			credentials: 'include'
		})
			.then((res) => {
				if (res.status >= 400) {
					res.json().then((json) => {
						json.errors.forEach((err) => {
							let errorText = '';
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
							dispatch({
								type: CREATE_ACCOUNT_FAIL,
								data: {
									text: errorText,
									classes: 'alert',
								},
							});
						});
					});
					return;
				}
				dispatch({
					type: CREATE_ACCOUNT_SUCCESS,
					data: {
						payload: { email },
						text: `${t('panel_signin_success')} ${email}`
					},
				});
			})
			.catch((err) => {
				log('PanelActions createAccount returned with an error', err);
				dispatch({
					type: CREATE_ACCOUNT_FAIL,
					data: {
						text: t('server_error_message'),
						classes: 'alert',
					},
				});
			});
	}
);

export function createAccountOld(query) {
	return function (dispatch) {
		return utils.doXHR('POST', `${API_ROOT_URL}/api/Account`, JSON.stringify(query)).then((response) => {
			if (response.UserId !== null && response.Token !== null) {
				const decodedToken = decodeJwt(response.Token);

				if (decodedToken && decodedToken.payload) {
					msg.sendMessageInPromise('setLoginInfo', {
						user_token: response.Token,
						decoded_user_token: decodedToken.payload,
					}).then((data) => {
						dispatch({
							type: CREATE_ACCOUNT_SUCCESS,
							data: {
								payload: decodedToken.payload,
								text: `${t('panel_signin_success')} ${query.EmailAddress}`
							},
						});
					}).catch((err) => {
						log('PanelActions createAccount returned with an error', err);
						dispatch({
							type: CREATE_ACCOUNT_FAIL,
							data: {
								text: t('server_error_message'),
								classes: 'alert',
							},
						});
					});
				}
			} else {
				// XHR was successful but we did not get a token back
				log('PanelActions createAccount callback error', response);
				let text;

				// TODO: temporary until we get better error handling on the consumerAPI
				if (response.Message.startsWith('User with email address')) {
					text = t('email_address_in_use');
				} else {
					text = t('server_error_message');
				}
				dispatch({
					type: CREATE_ACCOUNT_FAIL,
					data: {
						text,
						classes: 'alert',
					},
				});
			}
		}).catch((error) => {
			// server error
			log('PanelActions createAccount server error', error);
			dispatch({
				type: CREATE_ACCOUNT_FAIL,
				data: {
					text: t('server_error_message'),
					classes: 'alert',
				},
			});
		});
	};
}
