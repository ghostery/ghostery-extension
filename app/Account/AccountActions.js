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
	GET_USER_SETTINGS_SUCCESS,
	GET_USER_SETTINGS_FAIL
} from './AccountConstants';

export const getUserSettings = () => dispatch => (
	sendMessageInPromise('account.getUserSettings')
		.then((res) => {
			const { errors, settings } = res;
			if (errors) {
				dispatch({
					type: GET_USER_SETTINGS_FAIL,
					payload: { errors },
				});
				return false;
			}
			dispatch({
				type: GET_USER_SETTINGS_SUCCESS,
				payload: { settings },
			});
			return true;
		})
		.catch((error) => {
			log('PanelActions getUserSettings error', error);
			return false;
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
				return false;
			}
			dispatch({
				type: GET_USER_SUCCESS,
				payload: { user },
			});

			return true;
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
			const errors = [{ title: err.toString(), detail: err.toString() }];
			dispatch({
				type: LOGIN_FAIL,
				payload: {
					errors,
				},
			});
			return false;
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
		const errors = [{ title: err.toString(), detail: err.toString() }];
		dispatch({
			type: REGISTER_FAIL,
			payload: {
				errors,
			},
		});
		return false;
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
