/**
 * Test file for Metrics Actions
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
import sendPing from '../MetricsActions';
import SEND_PING from '../../constants/MetricsConstants'

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

const testData = { test: true };

utils.sendMessageInPromise = jest.fn((name, message) => new Promise((resolve, reject) => {
	switch (name) {
		case 'SEND_PING': {
			resolve(testData);
			break;
		}
		default: resolve(testData);
	}
}));

describe('app/shared-hub/actions/MetricsActions', () => {
	test('sendPing action should return correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);

		const data = testData;
		const expectedPayload = { data, type: SEND_PING };
		return store.dispatch(sendPing()).then(() => {
			const actions = store.getActions();
			expect(actions).toEqual([expectedPayload]);
		});
	});
});
