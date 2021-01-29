/**
 * Test file for Anti Suite Actions
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
import * as AntiSuiteActions from '../AntiSuiteActions';
import { SET_AD_BLOCK, SET_ANTI_TRACKING, SET_SMART_BLOCK } from '../../constants/AntiSuiteConstants';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

const testData = { test: true };

const mockSendMessageInPromise = jest.fn((dispatch, name, message) => new Promise((resolve, reject) => {
	dispatch({
		type: name,
		testData
	});
	switch (name) {
		case 'SET_ANTI_TRACKING': {
			resolve(testData);
			break;
		}
		case 'SET_AD_BLOCK': {
			resolve(testData);
			break;
		}
		case 'SET_SMART_BLOCK': {
			resolve(testData);
			break;
		}
		default: resolve(testData);
	}
}));

utils.sendMessageInPromise = mockSendMessageInPromise;

utils.makeDeferredDispatcher = jest.fn((action, actionData) => dispatch => {
	return mockSendMessageInPromise(dispatch, action, actionData);
})

describe('app/shared-hub/actions/AntiSuiteActions', () => {
	test('setAdBlock action should return correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);

		const expectedPayload = { testData, type: SET_AD_BLOCK };
		return store.dispatch(AntiSuiteActions.setAdBlock()).then(() => {
			const actions = store.getActions();
			expect(actions).toEqual([expectedPayload]);
		});
	});

	test('setAntiTracking action should return correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);

		const data = testData;
		const expectedPayload = { testData, type: SET_ANTI_TRACKING };
		return store.dispatch(AntiSuiteActions.setAntiTracking()).then(() => {
			const actions = store.getActions();
			expect(actions).toEqual([expectedPayload]);
		});
	});

	test('setSmartBlock action should return correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);

		const data = testData;
		const expectedPayload = { testData, type: SET_SMART_BLOCK };
		return store.dispatch(AntiSuiteActions.setSmartBlocking()).then(() => {
			const actions = store.getActions();
			expect(actions).toEqual([expectedPayload]);
		});
	});
});
