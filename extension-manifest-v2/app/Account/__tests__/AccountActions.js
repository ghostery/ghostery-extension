/**
 * Test file for Panel Actions
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2019 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as accountActions from '../AccountActions';
import {
	LOGIN_FAIL, LOGIN_SUCCESS,
	GET_USER_SETTINGS_SUCCESS, GET_USER_SUCCESS
} from '../AccountConstants';

// Fake the translation function to only return the translation key
global.t = function(str) {
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

describe('app/panel/actions/AccountActions.js', () => {
	beforeEach(() => {
		chrome.runtime.sendMessage.flush();
	});

	afterAll(() => {
		chrome.flush();
	});

	test('account.getUserSettings action should resolve correctly', () => {
		chrome.runtime.sendMessage.withArgs({ name: 'account.getUserSettings', message: undefined, origin: '' }).yields(settings);
		const initialState = {};
		const store = mockStore(initialState);
		const expectedPayload = { payload: { settings }, type: GET_USER_SETTINGS_SUCCESS };

		return store.dispatch(accountActions.getUserSettings())
			.then(() => {
				const actions = store.getActions();
				expect(actions).toEqual([expectedPayload]);
			});
	});

	test('account.getUser action should resolve correctly', () => {
		chrome.runtime.sendMessage.withArgs({ name: 'account.getUser', message: undefined, origin: '' }).yields(user);
		const initialState = {};
		const store = mockStore(initialState);
		const expectedPayload = { payload: user, type: GET_USER_SUCCESS };

		return store.dispatch(accountActions.getUser())
			.then(() => {
				const actions = store.getActions();
				expect(actions).toEqual([expectedPayload]);
			});
	});

	test('account.login action valid login should resolve correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);
		const email = 'valid.account';
		const password = 'password';
		const expectedPayload = [
			{
				type: LOGIN_SUCCESS,
				payload: {
					email
				}
			}
		];
		chrome.runtime.sendMessage.withArgs({ name: 'account.login', message: { email, password }, origin: '' }).yields(responseSuccess);
		return store.dispatch(accountActions.login(email, password)).then(() => {
			const actions = store.getActions();
			expect(actions).toEqual(expectedPayload);
		});
	});

	test('account.login action invalid account err should fail correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);
		const email = 'invalid.account';
		const password = 'password';
		const expectedPayload = [
			{
				type: LOGIN_FAIL,
				payload: invalidAccountErr
			}
		];
		chrome.runtime.sendMessage.withArgs({ name: 'account.login', message: { email, password }, origin: '' }).yields(invalidAccountErr);
		return store.dispatch(accountActions.login(email, password))
			.then(() => {
				const actions = store.getActions();
				expect(actions).toEqual(expectedPayload);
			});
	});

	test('account.login action server err should fail correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);
		const email = 'server.err';
		const password = 'password';
		const expectedPayload = [
			{
				type: LOGIN_FAIL,
				payload: serverErr
			}
		];
		chrome.runtime.sendMessage.withArgs({ name: 'account.login', message: { email, password }, origin: '' }).yields(serverErr);
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
