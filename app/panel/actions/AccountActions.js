import normalize from 'json-api-normalizer';
import build from 'redux-object';
import { sendMessageInPromise } from '../utils/msg';
import { log } from '../../../src/utils/common';
import {
	GET_SETTINGS_DATA, LOGIN_DATA_SUCCESS, LOGIN_FAILED,
	SHOW_NOTIFICATION, LOGIN_SUCCESS, LOGOUT, CREATE_ACCOUNT_FAILED,
	CREATE_ACCOUNT_SUCCESS, FORGOT_PASSWORD_SUCCESS,
	FORGOT_PASSWORD_FAILED
} from '../constants/constants';

/**
 * Call accountAPI for user settings.
 * Component. Picked up by Panel reducer.
 * @return {Object} dispatch
 */

export function getUserSettings() {
	return function (dispatch) {
		return sendMessageInPromise('account.getUserSettings')
			.then((settings) => {
				dispatch({
					type: GET_SETTINGS_DATA,
					data: { settingsData: settings }
				});
			})
			.catch((error) => {
				log('PanelActions getUserSettings error', error);
			});
	};
}

export const accountGetUser = () => dispatch => (
	sendMessageInPromise('account.getUser')
		.then((user) => {
			dispatch({
				type: LOGIN_DATA_SUCCESS,
				data: user,
			});
			return user;
		})
);

/**
 * Call consumerAPI and set updated login info to state. Called from Login
 * Component. Picked up by Panel reducer.
 * @param  {Object} query
 * @return {Object} dispatch
 */
export const accountLogin = (email, password) => dispatch => (
	sendMessageInPromise('account.login', { email, password })
		.then((response) => {
			if (response.errors) {
				log('PanelActions accountLogin server error', response);
				dispatch({ type: LOGIN_FAILED });
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
						type: SHOW_NOTIFICATION,
						data: {
							text: errorText,
							classes: 'alert',
						},
					});
				});
				return false;
			}
			dispatch({ type: LOGIN_SUCCESS });
			dispatch({
				type: SHOW_NOTIFICATION,
				data: {
					text: `${t('panel_signin_success')} ${email}`,
					classes: 'success',
				},
			});
			return true;
		})
		.catch((err) => {
			log('PanelActions accountLogin server error', err);
			dispatch({ type: LOGIN_FAILED });
			dispatch({
				type: SHOW_NOTIFICATION,
				data: {
					text: t('server_error_message'),
					classes: 'alert',
				},
			});
		})
);

/**
 * Triggers logout by sending empty {} to setLoginInfo. Called from
 * HeaderMenu. Picked up by Panel reducer.
 * @param  {Object} query
 * @return {Object} dispatch
 */
export function accountLogout() {
	return function (dispatch) {
		sendMessageInPromise('account.logout', {})
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
		return sendMessageInPromise('createAccount', data)
			.then((response) => {
				const { errors } = response;
				if (errors) {
					dispatch({ type: CREATE_ACCOUNT_FAILED });
					errors.forEach((err) => {
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
