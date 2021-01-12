/**
 * Test file for Setup Lifecycle Actions
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2021 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as utils from '../../utils';
import * as SetupLifecycleActions from '../SetupLifecycleActions';
import { INIT_SETUP_PROPS, SET_SETUP_STEP, SET_SETUP_COMPLETE } from '../../constants/SetupLifecycleConstants';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

const testData = { test: true };

utils.sendMessageInPromise = jest.fn((name, message) => new Promise((resolve, reject) => {
	switch (name) {
		case 'INIT_SETUP_PROPS': {
			resolve(testData);
			break;
		}
		case 'SET_SETUP_STEP': {
			resolve(testData);
			break;
		}
		case 'SET_SETUP_COMPLETE': {
			resolve(testData);
			break;
		}
		default: resolve(testData);
	}
}));

describe('app/shared-hub/actions/AntiSuiteActions', () => {
	test('initSetupProps action should return correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);

		const data = testData;
		const expectedPayload = { data, type: INIT_SETUP_PROPS };
		store.dispatch(SetupLifecycleActions.initSetupProps(testData));
		const actions = store.getActions();
		expect(actions).toEqual([expectedPayload]);
	});

	test('setSetupStep action should return correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);

		const data = testData;
		const expectedPayload = { data, type: SET_SETUP_STEP };
		return store.dispatch(SetupLifecycleActions.setSetupStep()).then(() => {
			const actions = store.getActions();
			expect(actions).toEqual([expectedPayload]);
		});
	});

	test('setSetupStep action should return correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);

		const data = testData;
		const expectedPayload = { data, type: SET_SETUP_COMPLETE };
		return store.dispatch(SetupLifecycleActions.setSetupComplete()).then(() => {
			const actions = store.getActions();
			expect(actions).toEqual([expectedPayload]);
		});
	});
});
