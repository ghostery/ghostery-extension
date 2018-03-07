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

import { GET_PANEL_DATA, GET_SUMMARY_DATA, GET_BLOCKING_DATA,
	SHOW_NOTIFICATION,
	CLOSE_NOTIFICATION,
	LOGIN_SUCCESS, LOGIN_FAILED,
	LOGOUT,
	CREATE_ACCOUNT_SUCCESS, CREATE_ACCOUNT_FAILED,
	FORGOT_PASSWORD_SUCCESS, FORGOT_PASSWORD_FAILED } from '../constants/constants';
import { sendMessageInPromise } from '../utils/msg';
import { doXHR } from '../utils/utils';
import globals from '../../../src/classes/Globals';
import { decodeJwt, log } from '../../../src/utils/common';

const API_ROOT_URL = `https://consumerapi.${globals.GHOSTERY_DOMAIN}.com`;

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
 * Call consumerAPI and set updated login info to state. Called from Login
 * Component. Picked up by Panel reducer.
 * @param  {Object} query
 * @return {Object} dispatch
 */
export function userLogin(query) {
	return function (dispatch) {
		return doXHR('POST', `${API_ROOT_URL}/api/Login`, JSON.stringify(query)).then((response) => {
			if (response.UserId !== null && response.Token !== null) {
				const decodedToken = decodeJwt(response.Token);

				if (decodedToken && decodedToken.payload) {
					sendMessageInPromise('setLoginInfo', {
						user_token: response.Token,
						decoded_user_token: decodedToken.payload,
					}).then((data) => {
						dispatch({
							type: LOGIN_SUCCESS,
							data: decodedToken.payload,
						});
						dispatch({
							type: SHOW_NOTIFICATION,
							data: {
								text: `${t('panel_signin_success')} ${query.EmailAddress}`,
								classes: 'success',
							},
						});
					}).catch((err) => {
						log('PanelActions userLogin returned with an error', err);
						dispatch({ type: LOGIN_FAILED });
						dispatch({
							type: SHOW_NOTIFICATION,
							data: {
								text: `${t('panel_signin_success')} ${query.EmailAddress}`,
								classes: 'alert',
							},
						});
					});
				}
			} else {
				// XHR was successful but we did not get a token back
				log('PanelActions userLogin callback error', response);
				dispatch({ type: LOGIN_FAILED });
				dispatch({
					type: SHOW_NOTIFICATION,
					data: {
						text: t('banner_no_such_account_message'),
						classes: 'alert',
					},
				});
			}
		}).catch((error) => {
			// server error
			log('PanelActions userLogin server error', error);
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
		return sendMessageInPromise('setLoginInfo', {}).then((data) => {
			dispatch({
				type: LOGOUT,
				data,
			});
		}).catch((err) => {
			log('PanelActions userLogout returned with an error', err);
		});
	};
}

/**
 * Call consumer API and create new account. Set new login info to state.
 * @param  {Object} query
 * @return {Object} dispatch
 */
export function createAccount(query) {
	return function (dispatch) {
		return doXHR('POST', `${API_ROOT_URL}/api/Account`, JSON.stringify(query)).then((response) => {
			if (response.UserId !== null && response.Token !== null) {
				const decodedToken = decodeJwt(response.Token);

				if (decodedToken && decodedToken.payload) {
					sendMessageInPromise('setLoginInfo', {
						user_token: response.Token,
						decoded_user_token: decodedToken.payload,
					}).then((data) => {
						dispatch({
							type: CREATE_ACCOUNT_SUCCESS,
							data: decodedToken.payload,
						});
						dispatch({
							type: SHOW_NOTIFICATION,
							data: {
								text: t('panel_email_verification_sent', query.EmailAddress),
								classes: 'success',
							},
						});
					}).catch((err) => {
						log('PanelActions createAccount returned with an error', err);
						dispatch({ type: CREATE_ACCOUNT_FAILED });
						dispatch({
							type: SHOW_NOTIFICATION,
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
				dispatch({ type: CREATE_ACCOUNT_FAILED });

				// TODO: temporary until we get better error handling on the consumerAPI
				if (response.Message.startsWith('User with email address')) {
					// email address already in use
					dispatch({
						type: SHOW_NOTIFICATION,
						data: {
							text: t('email_address_in_use'),
							classes: 'alert',
						},
					});
				} else {
					dispatch({
						type: SHOW_NOTIFICATION,
						data: {
							text: t('server_error_message'),
							classes: 'alert',
						},
					});
				}
			}
		}).catch((error) => {
			// server error
			log('PanelActions createAccount server error', error);
			dispatch({ type: CREATE_ACCOUNT_FAILED });
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
 * Call consumer API and send password reminder email
 * @param  {Object} query
 * @return {Object} dispatch
 */
export function forgotPassword(query) {
	return function (dispatch) {
		return doXHR('POST', `${API_ROOT_URL}/api/Password/Forgot`, JSON.stringify(query)).then((response) => {
			if (response.succeeded === true) {
				dispatch({ type: FORGOT_PASSWORD_SUCCESS });
				dispatch({
					type: SHOW_NOTIFICATION,
					data: {
						text: t('banner_check_your_email_title'),
						classes: 'success',
					},
				});
			} else {
				log('PanelActions forgotPassword success callback error', response);
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
			}
		}).catch((error) => {
			// if the email is not in the DB, system returns a 400
			if (error.message.includes('Bad Request')) {
				log('PanelActions forgotPassword email not found', error);
				dispatch({
					type: FORGOT_PASSWORD_FAILED,
					emailNotFound: true,
				});
			} else {
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
			}
		});
	};
}
