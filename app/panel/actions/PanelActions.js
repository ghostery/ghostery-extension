/**
 * Panel Action creators
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
	GET_SETTINGS_DATA, GET_PANEL_DATA, GET_SUMMARY_DATA, GET_BLOCKING_DATA,
	TOGGLE_CLIQZ_FEATURE,
	SHOW_NOTIFICATION,
	CLOSE_NOTIFICATION,
	TOGGLE_EXPERT,
	LOGIN_SUCCESS, LOGIN_DATA_SUCCESS, LOGIN_FAILED,
	LOGOUT,
	CREATE_ACCOUNT_SUCCESS, CREATE_ACCOUNT_FAILED,
	FORGOT_PASSWORD_SUCCESS, FORGOT_PASSWORD_FAILED
} from '../constants/constants';
import { sendMessageInPromise } from '../utils/msg';
import { doXHR } from '../utils/utils';
import globals from '../../../src/classes/Globals';
import { decodeJwt, log } from '../../../src/utils/common';

const API_ROOT_URL = `https://consumerapi.${globals.GHOSTERY_DOMAIN}.com`;

/**
 * Update Cliqz Features.
 * @return {Object}
 */
export function toggleCliqzFeature(featureName, isEnabled) {
	const data = {
		featureName,
		isEnabled,
	};
	return {
		type: TOGGLE_CLIQZ_FEATURE,
		data,
	};
}

/**
 * Fetch panel data from background, only on the initial load. Returns combined
 * Panel, Summary and Blocking data as needed.
 * @return {Object} dispatch
 */
export function getPanelData(tabId) {
	return function (dispatch) {
		return sendMessageInPromise('getPanelData', {
			tabId,
			view: 'panel',
		}).then((data) => {
			// On initial load, getPanelData returns combined Panel
			// and Summary data and dispatches to respective reducers
			dispatch({
				type: GET_PANEL_DATA,
				data: data.panel,
			});
			dispatch({
				type: GET_SUMMARY_DATA,
				data: data.summary,
			});
			// If we're in Expert view, dispatch Blocking data to reducer
			if (data.blocking !== false) {
				dispatch({
					type: GET_BLOCKING_DATA,
					data: data.blocking,
				});
			}
			// send back to Panel component as promised data
			return data.panel;
		});
	};
}

/**
 * Display notification messages on Panel (status, needsReload). Also used to persist
 * the needsReload messages if the panel is closed before the page is refreshed.
 * @param  {Object} data
 * @return {Object}
 */
export function showNotification(data) {
	return {
		type: SHOW_NOTIFICATION,
		data,
	};
}

/**
 * Close notification alert
 * @param  {Object} data
 * @return {Object}
 */
export function closeNotification(data) {
	return {
		type: CLOSE_NOTIFICATION,
		data,
	};
}

/**
 * Called from Header and Summary's toggleExpert() and picked up by panel reducer
 * @return {Object}
 */
export function toggleExpert() {
	return {
		type: TOGGLE_EXPERT,
	};
}

/**
 * Call accountAPI for user settings.
 * Component. Picked up by Panel reducer.
 * @return {Object} dispatch
 */

export function pullUserSettings(user_id) {
	return function (dispatch) {
		return sendMessageInPromise('pullUserSettings', user_id)
			.then((settings) => {
				dispatch({
					type: GET_SETTINGS_DATA,
					data: { settingsData: settings.settingsJson }
				});
				return Promise.resolve(settings);
			})
			.catch((error) => {
				log('PanelActions pullUserSettings error', error);
			});
	};
}

/**
 * Call consumerAPI and set updated login info to state. Called from Login
 * Component. Picked up by Panel reducer.
 * @param  {Object} query
 * @return {Object} dispatch
 */
export function userLogin(email, password) {
	return function (dispatch) {
		const data = `email=${window.encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
		return sendMessageInPromise('userLogin', data)
			.then((response) => {
				if (response.errors) {
					log('PanelActions userLogin server error', response);
					dispatch({ type: LOGIN_FAILED });
					return response.errors.forEach((err) => {
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
							type: SHOW_NOTIFICATION,
							data: {
								text: errorText,
								classes: 'alert',
							},
						});
					});
				}
				return sendMessageInPromise('fetchUser')
					.then((user) => {
						dispatch({
							type: LOGIN_SUCCESS
						});
						dispatch({
							type: LOGIN_DATA_SUCCESS,
							data: user,
						});
						dispatch({
							type: SHOW_NOTIFICATION,
							data: {
								text: `${t('panel_signin_success')} ${email}`,
								classes: 'success',
							},
						});
						return user;
					});
			})
			.catch((err) => {
				log('PanelActions userLogin server error', err);
				dispatch({ type: LOGIN_FAILED });
				dispatch({
					type: SHOW_NOTIFICATION,
					data: {
						text: t('server_error_message'),
						classes: 'alert',
					},
				});
			});
	};
}

/**
 * Triggers logout by sending empty {} to setLoginInfo. Called from
 * HeaderMenu. Picked up by Panel reducer.
 * @param  {Object} query
 * @return {Object} dispatch
 */
export function userLogout() {
	return function (dispatch) {
		sendMessageInPromise('userLogout', {})
			.then((data) => {
				dispatch({ type: LOGOUT });
			})
			.catch((err) => {
				log('PanelActions userLogout returned with an error', err);
			});
	};
}

/**
 * Call consumer API and create new account. Set new login info to state.
 * @param  {Object} query
 * @return {Object} dispatch
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
		}).then((res) => {
			if (res.status >= 400) {
				res.json().then((json) => {
					dispatch({ type: CREATE_ACCOUNT_FAILED });
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
							type: SHOW_NOTIFICATION,
							data: {
								text: errorText,
								classes: 'alert',
							},
						});
					});
				});
				return;
			}

			sendMessageInPromise('fetchUser')
				.then((user) => {
					dispatch({
						type: CREATE_ACCOUNT_SUCCESS,
						data: {
							email: user.email,
							is_validated: user.is_validated
						}
					});
					dispatch({
						type: LOGIN_DATA_SUCCESS,
						data: user,
					});
					dispatch({
						type: SHOW_NOTIFICATION,
						data: {
							text: t('panel_email_verification_sent', user.email),
							classes: 'success',
						},
					});
					return user;
				});
		});
	}
);

/**
 * Call consumer API and send password reminder email
 * @param  {Object} query
 * @return {Object} dispatch
 */
export function forgotPassword(email) {
	return function (dispatch) {
		const data = `email=${window.encodeURIComponent(email)}`;
		return sendMessageInPromise('resetPassword', data)
			.then((response) => {
				if (response.errors) {
					log('PanelActions userLogin server error', response);
					dispatch({ type: LOGIN_FAILED });
					return response.errors.forEach((err) => {
						let errorText = '';
						let emailNotFound = '';
						switch (err.code) {
							case '10050':
							case '10110':
								errorText = t('banner_no_such_account_message');
								emailNotFound = true;
								break;
							default:
								errorText = t('server_error_message');
								emailNotFound = false;
						}
						dispatch({
							type: FORGOT_PASSWORD_FAILED,
							emailNotFound
						});
						dispatch({
							type: SHOW_NOTIFICATION,
							data: {
								text: errorText,
								classes: 'alert',
							},
						});
					});
				}
				dispatch({ type: FORGOT_PASSWORD_SUCCESS });
				dispatch({
					type: SHOW_NOTIFICATION,
					data: {
						text: t('banner_check_your_email_title'),
						classes: 'success',
					},
				});
				return true;
			})
			.catch((error) => {
				// server error
				log('PanelActions forgotPassword server error', error);
				dispatch({
					type: FORGOT_PASSWORD_FAILED,
					emailNotFound: false,
				});
				dispatch({
					type: SHOW_NOTIFICATION,
					data: {
						text: t('server_error_message'),
						classes: 'alert',
					},
				});
			});
	};
}
