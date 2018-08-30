/**
 * Test file for Home View Action creators
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
import * as HomeViewActions from '../HomeViewActions';
import { GET_HOME_PROPS, SET_METRICS } from '../HomeViewConstants';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

const testData = { test: true };
utils.sendMessageInPromise = jest.fn((name, message) => new Promise((resolve, reject) => {
	switch (name) {
		case GET_HOME_PROPS: {
			resolve(testData);
			break;
		}
		case SET_METRICS: {
			resolve(message);
			break;
		}
		default: resolve(message);
	}
}));

describe('app/hub/Views/SetupView/ actions', () => {
	test('getHomeProps action should return correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);

		const data = testData;
		const expectedPayload = { data, type: GET_HOME_PROPS };

		return store.dispatch(HomeViewActions.getHomeProps()).then(() => {
			const actions = store.getActions();
			expect(actions).toEqual([expectedPayload]);
		});
	});

	test('setMetrics action should return correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);

		const data = testData;
		const expectedPayload = { data, type: SET_METRICS };

		return store.dispatch(HomeViewActions.setMetrics(data)).then(() => {
			const actions = store.getActions();
			expect(actions).toEqual([expectedPayload]);
		});
	});
});
