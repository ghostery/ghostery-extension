import { sendMessageInPromise } from '../panel/utils/msg';
import { log } from '../../src/utils/common';
import {
	REGISTER_SUCCESS,
	REGISTER_FAIL,
	LOGIN_SUCCESS,
	LOGIN_FAIL,
	LOGOUT_SUCCESS,
	LOGOUT_FAIL,
	RESET_PASSWORD_SUCCESS,
	RESET_PASSWORD_FAIL,
	GET_USER_SUCCESS,
	GET_USER_FAIL,
	GET_USER_SETTINGS_SUCCESS
} from './AccountConstants';

export const getUserSettings = () => dispatch => (
	sendMessageInPromise('account.getUserSettings')
		.then((settings) => {
			dispatch({
				type: GET_USER_SETTINGS_SUCCESS,
				payload: { settings },
			});
		})
		.catch((error) => {
			log('PanelActions getUserSettings error', error);
		})
);

export const getUser = () => dispatch => (
	sendMessageInPromise('account.getUser')
		.then((res) => {
			const { errors, user } = res;
			if (errors) {
				dispatch({
					type: GET_USER_FAIL,
					payload: { errors },
				});
			} else {
				dispatch({
					type: GET_USER_SUCCESS,
					payload: { user },
				});
			}
			return res;
		})
);

export const login = (email, password) => dispatch => (
	sendMessageInPromise('account.login', { email, password })
		.then((res) => {
			const { errors } = res;
			if (errors) {
				dispatch({
					type: LOGIN_FAIL,
					payload: { errors },
				});
				return false;
			}
			dispatch({
				type: LOGIN_SUCCESS,
				payload: { email },
			});
			return true;
		})
		.catch((err) => {
			log('account.login() error:', err);
			dispatch({
				type: LOGIN_FAIL,
				payload: {
					errors: [{ title: err.toString(), detail: err.toString() }],
				},
			});
		})
);

export const register = (email, confirmEmail, firstName, lastName, password) => dispatch => (
	sendMessageInPromise('account.register', {
		email, confirmEmail, firstName, lastName, password
	}).then((res) => {
		const { errors } = res;
		if (errors) {
			dispatch({
				type: REGISTER_FAIL,
				payload: { errors },
			});
			return false;
		}
		dispatch({
			type: REGISTER_SUCCESS,
			payload: { email },
		});
		return true;
	}).catch((err) => {
		dispatch({
			type: REGISTER_FAIL,
			payload: {
				errors: [{ title: err.toString(), detail: err.toString() }],
			},
		});
	})
);

export const logout = () => dispatch => (
	sendMessageInPromise('account.logout', {})
		.then(() => {
			dispatch({ type: LOGOUT_SUCCESS });
		})
		.catch((err) => {
			dispatch({
				type: LOGOUT_FAIL,
				payload: {
					errors: [{ title: err.toString(), detail: err.toString() }],
				},
			});
		})
);

export const resetPassword = email => dispatch => (
	sendMessageInPromise('account.resetPassword', { email })
		.then((res) => {
			const { errors } = res;
			if (errors) {
				dispatch({
					type: RESET_PASSWORD_FAIL,
					payload: { errors },
				});
				return false;
			}
			dispatch({ type: RESET_PASSWORD_SUCCESS });
			return true;
		})
		.catch((err) => {
			dispatch({
				type: RESET_PASSWORD_FAIL,
				payload: {
					errors: [{ title: err.toString(), detail: err.toString() }],
				},
			});
		})
);
