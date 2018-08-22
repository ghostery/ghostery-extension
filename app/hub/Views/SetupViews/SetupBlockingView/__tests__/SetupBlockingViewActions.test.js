/**
 * Test file for Setup Blocking View Action creators
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
import * as utils from '../../../../utils';
import * as SetupBlockingViewActions from '../SetupBlockingViewActions';
import { SET_BLOCKING_POLICY } from '../../../SetupView/SetupViewConstants';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

const testData = { test: true };
utils.sendMessageInPromise = jest.fn((name, message) => new Promise((resolve, reject) => {
	switch (name) {
		case SET_BLOCKING_POLICY: {
			resolve(message);
			break;
		}
		default: resolve(message);
	}
}));

describe('app/hub/Views/SetupViews/SetupBlockingView actions', () => {
	test('setBlockingPolicy action should return correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);

		const data = testData;
		const expectedPayload = { data, type: SET_BLOCKING_POLICY };

		return store.dispatch(SetupBlockingViewActions.setBlockingPolicy(data)).then(() => {
			const actions = store.getActions();
			expect(actions).toEqual([expectedPayload]);
		});
	});
});
