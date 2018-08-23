/**
 * Test file for Setup Done View Action creators
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
import * as SetupDoneViewActions from '../SetupDoneViewActions';
import { SET_SETUP_COMPLETE } from '../../../SetupView/SetupViewConstants';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

const testData = { test: true };
utils.sendMessageInPromise = jest.fn((name) => new Promise((resolve, reject) => {
	switch (name) {
		case SET_SETUP_COMPLETE: {
			resolve(testData);
			break;
		}
		default: resolve(message);
	}
}));

describe('app/hub/Views/SetupViews/SetupDoneView actions', () => {
	test('setSetupComplete action should return correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);

		const data = testData;
		const expectedPayload = { data, type: SET_SETUP_COMPLETE };

		return store.dispatch(SetupDoneViewActions.setSetupComplete()).then(() => {
			const actions = store.getActions();
			expect(actions).toEqual([expectedPayload]);
		});
	});
});
