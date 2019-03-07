/**
 * Test file for Setup View Action creators
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
import * as utils from '../../../utils';
import * as SetupViewActions from '../SetupViewActions';
import {
	GET_SETUP_SHOW_WARNING_OVERRIDE,
	SET_SETUP_SHOW_WARNING_OVERRIDE,
	INIT_SETUP_PROPS,
	SET_SETUP_STEP,
	SET_SETUP_NAVIGATION
} from '../SetupViewConstants';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

const testData = { test: true };
utils.sendMessageInPromise = jest.fn((name, message) => new Promise((resolve, reject) => {
	switch (name) {
		case GET_SETUP_SHOW_WARNING_OVERRIDE: {
			resolve(testData);
			break;
		}
		case SET_SETUP_SHOW_WARNING_OVERRIDE: {
			resolve(message);
			break;
		}
		case SET_SETUP_STEP: {
			resolve(testData);
			break;
		}
		default: resolve(message);
	}
}));

describe('app/hub/Views/SetupView/ actions', () => {
	test('getSetupShowWarningOverride action should return correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);

		const data = testData;
		const expectedPayload = { data, type: GET_SETUP_SHOW_WARNING_OVERRIDE };

		return store.dispatch(SetupViewActions.getSetupShowWarningOverride()).then(() => {
			const actions = store.getActions();
			expect(actions).toEqual([expectedPayload]);
		});
	});

	test('setSetupShowWarningOverride action should return correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);

		const data = testData;
		const expectedPayload = { data, type: SET_SETUP_SHOW_WARNING_OVERRIDE };

		return store.dispatch(SetupViewActions.setSetupShowWarningOverride(data)).then(() => {
			const actions = store.getActions();
			expect(actions).toEqual([expectedPayload]);
		});
	});

	test('initSetupProps action should return correctly', () => {
		const testData = {
			test: 'test-data',
		};
		expect(SetupViewActions.initSetupProps(testData)).toEqual({
			type: INIT_SETUP_PROPS,
			data: testData,
		});
	});

	test('setSetupStep action should return correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);

		const data = testData;
		const expectedPayload = { data, type: SET_SETUP_STEP };

		return store.dispatch(SetupViewActions.setSetupStep(data)).then(() => {
			const actions = store.getActions();
			expect(actions).toEqual([expectedPayload]);
		});
	});

	test('setSetupNavigation action should return correctly', () => {
		const testData = {
			test: 'test-data',
		};
		expect(SetupViewActions.setSetupNavigation(testData)).toEqual({
			type: SET_SETUP_NAVIGATION,
			data: testData,
		});
	});
});
