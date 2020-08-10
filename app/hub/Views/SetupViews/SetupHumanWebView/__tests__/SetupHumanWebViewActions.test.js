/**
 * Test file for Setup Human Web View Action creators
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
import * as utils from '../../../../utils';
import setHumanWeb from '../SetupHumanWebViewActions';
import { SET_HUMAN_WEB } from '../../../SetupView/SetupViewConstants';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

const testData = { test: true };
utils.sendMessageInPromise = jest.fn((name, message) => new Promise((resolve, reject) => {
	switch (name) {
		case SET_HUMAN_WEB: {
			resolve(message);
			break;
		}
		default: resolve(message);
	}
}));

describe('app/hub/Views/SetupViews/SetupHumanWebView actions', () => {
	test('setHumanWeb action should return correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);

		const data = testData;
		const expectedPayload = { data, type: SET_HUMAN_WEB };

		return store.dispatch(setHumanWeb(data)).then(() => {
			const actions = store.getActions();
			expect(actions).toEqual([expectedPayload]);
		});
	});
});
