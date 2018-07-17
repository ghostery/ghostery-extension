/**
 * Test file for Panel Actions
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

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as msg from '../../utils/msg';
import * as accountActions from '../AccountActions';
import {
	LOGIN_FAILED, SHOW_NOTIFICATION, LOGIN_SUCCESS,
	GET_SETTINGS_DATA, LOGIN_DATA_SUCCESS, LOGOUT
} from '../../constants/constants';

// Fake the translation function to only return the translation key
global.t = function (str) {
	return str;
};

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// TODO mock settings data
const settings = {
};

// TODO mock user data
const user = {
};

// TODO mock user data
const responseSuccess = [
	{ mockErr: 'error text' }
];

const invalidAccountErr = {
	errors: [
		{ code: '10050' }
	],
};

const serverErr = {
	errors: [
		{ mockErr: 'server error' }
	],
};

msg.sendMessageInPromise = jest.fn((messageType, data) => new Promise((resolve, reject) => {
	switch (messageType) {
		case 'account.getUserSettings':
			resolve(settings);
			break;
		case 'account.getUser':
			resolve(user);
			break;
		case 'account.login':
			if (data.email === 'valid.account') {
				resolve(responseSuccess);
			} else if (data.email === 'invalid.account') {
				resolve(invalidAccountErr);
			} else if (data.email === 'server.err') {
				resolve(serverErr);
			} else {
				resolve(responseSuccess);
			}
			break;
		default:
			reject();
	}
}));

describe('app/panel/actions/AccountActions.js', () => {
	test('getUserSettings action should resolve correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);
		const expectedPayload = { data: { settingsData: settings }, type: GET_SETTINGS_DATA };

		return store.dispatch(accountActions.getUserSettings())
			.then(() => {
				const actions = store.getActions();
				expect(actions).toEqual([expectedPayload]);
			});
	});
});

describe('app/panel/actions/AccountActions.js', () => {
	test('accountGetUser action should resolve correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);
		const expectedPayload = { data: user, type: LOGIN_DATA_SUCCESS };

		return store.dispatch(accountActions.getUser())
			.then(() => {
				const actions = store.getActions();
				expect(actions).toEqual([expectedPayload]);
			});
	});

	test('accountLogin action valid login should resolve correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);
		const email = 'valid.account';
		const password = 'password';
		const expectedPayload = [
			{
				type: LOGIN_SUCCESS
			},
			{
				type: SHOW_NOTIFICATION,
				data: {
					text: `panel_signin_success ${email}`,
					classes: 'success'
				}
			}
		];
		return store.dispatch(accountActions.login(email, password)).then(() => {
			const actions = store.getActions();
			expect(actions).toEqual(expectedPayload);
		});
	});

	test('accountLogin action invalid account err should fail correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);
		const email = 'invalid.account';
		const password = 'password';
		const expectedPayload = [
			{
				type: LOGIN_FAILED
			},
			{
				type: SHOW_NOTIFICATION,
				data: {
					text: 'banner_no_such_account_message',
					classes: 'alert'
				}
			}
		];
		return store.dispatch(accountActions.login(email, password))
			.then(() => {
				const actions = store.getActions();
				expect(actions).toEqual(expectedPayload);
			});
	});

	test('accountLogin action server err should fail correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);
		const email = 'server.err';
		const password = 'password';
		const expectedPayload = [
			{
				type: LOGIN_FAILED
			},
			{
				type: SHOW_NOTIFICATION,
				data: {
					text: 'server_error_message',
					classes: 'alert'
				}
			}
		];
		return store.dispatch(accountActions.login(email, password))
			.then(() => {
				const actions = store.getActions();
				expect(actions).toEqual(expectedPayload);
			});
	});

	// test('accountLogout action should resolve', () => {
	// 	const initialState = {};
	// 	const store = mockStore(initialState);
	// 	const expectedPayload = { type: LOGOUT };
	// 	return store.dispatch(accountActions.accountLogout())
	// 		.then(() => {
	// 			const actions = store.getActions();
	// 			expect(actions).toEqual(expectedPayload);
	// 		});
	// });
});
