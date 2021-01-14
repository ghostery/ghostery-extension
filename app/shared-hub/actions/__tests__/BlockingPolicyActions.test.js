/**
 * Test file for Blocking Policy Actions
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
import setBlockingPolicy from '../BlockingPolicyActions';
import { SET_BLOCKING_POLICY } from '../../constants/BlockingPolicyConstants'

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

const testData = { test: true };

const mockSendMessageInPromise = jest.fn((dispatch, name, message) => new Promise((resolve, reject) => {
	dispatch({
		type: name,
		testData
	});
	switch (name) {
		case 'SET_BLOCKING_POLICY': {
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

describe('app/shared-hub/actions/BlockingPolicyActions', () => {
	test('setBlockingPolicy action should return correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);

		const expectedPayload = { testData, type: SET_BLOCKING_POLICY };
		return store.dispatch(setBlockingPolicy()).then(() => {
			const actions = store.getActions();
			expect(actions).toEqual([expectedPayload]);
		});
	});
});
