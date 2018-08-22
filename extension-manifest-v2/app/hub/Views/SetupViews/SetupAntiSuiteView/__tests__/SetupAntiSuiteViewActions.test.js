/**
 * Test file for Setup Anti-Suite View Action creators
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
import * as SetupAntiSuiteViewActions from '../SetupAntiSuiteViewActions';
import {
	SET_ANTI_TRACKING,
	SET_AD_BLOCK,
	SET_SMART_BLOCKING,
	SET_GHOSTERY_REWARDS
} from '../../../SetupView/SetupViewConstants';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

const testData = { test: true };
utils.sendMessageInPromise = jest.fn((name, message) => new Promise((resolve, reject) => {
	switch (name) {
		case SET_ANTI_TRACKING: {
			resolve(message);
			break;
		}
		case SET_AD_BLOCK: {
			resolve(message);
			break;
		}
		case SET_SMART_BLOCKING: {
			resolve(message);
			break;
		}
		case SET_GHOSTERY_REWARDS: {
			resolve(message);
			break;
		}
		default: resolve(message);
	}
}));

describe('app/hub/Views/SetupViews/SetupAntiSuiteView actions', () => {
	test('setAntiTracking action should return correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);

		const data = testData;
		const expectedPayload = { data, type: SET_ANTI_TRACKING };

		return store.dispatch(SetupAntiSuiteViewActions.setAntiTracking(data)).then(() => {
			const actions = store.getActions();
			expect(actions).toEqual([expectedPayload]);
		});
	});

	test('setAdBlock action should return correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);

		const data = testData;
		const expectedPayload = { data, type: SET_AD_BLOCK };

		return store.dispatch(SetupAntiSuiteViewActions.setAdBlock(data)).then(() => {
			const actions = store.getActions();
			expect(actions).toEqual([expectedPayload]);
		});
	});

	test('setSmartBlocking action should return correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);

		const data = testData;
		const expectedPayload = { data, type: SET_SMART_BLOCKING };

		return store.dispatch(SetupAntiSuiteViewActions.setSmartBlocking(data)).then(() => {
			const actions = store.getActions();
			expect(actions).toEqual([expectedPayload]);
		});
	});

	test('setGhosteryRewards action should return correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);

		const data = testData;
		const expectedPayload = { data, type: SET_GHOSTERY_REWARDS };

		return store.dispatch(SetupAntiSuiteViewActions.setGhosteryRewards(data)).then(() => {
			const actions = store.getActions();
			expect(actions).toEqual([expectedPayload]);
		});
	});
});
