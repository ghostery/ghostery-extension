/**
 * Test file for Summary Actions
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
import * as msg from '../../utils/msg';
import * as summaryActions from '../SummaryActions';
import {
	UPDATE_CLIQZ_MODULE_DATA,
	UPDATE_TRACKER_COUNTS,
	UPDATE_GHOSTERY_PAUSED,
	UPDATE_SITE_POLICY,
	FILTER_TRACKERS
} from '../../constants/constants';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

const testData = { adblock: {}, antitracking: {} };
msg.sendMessageInPromise = jest.fn(messageType => new Promise((resolve) => {
	switch (messageType) {
		case 'updateCliqzModuleData':
			resolve(testData);
			break;
		default:
			resolve();
	}
}));

describe('app/panel/actions/SummaryActions.js', () => {
	test('updateCliqzModuleData action should return correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);

		const data = testData;
		const expectedPayload = { data, type: UPDATE_CLIQZ_MODULE_DATA };
		store.dispatch(summaryActions.updateCliqzModuleData(data));

		const actions = store.getActions();
		expect(actions).toEqual([expectedPayload]);
	});

	test('updateTrackerCounts action should return correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);

		const data = { test: true };
		const expectedPayload = { data, type: UPDATE_TRACKER_COUNTS };
		store.dispatch(summaryActions.updateTrackerCounts(data));

		const actions = store.getActions();
		expect(actions).toEqual([expectedPayload]);
	});

	test('updateGhosteryPaused action should return correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);

		const data = { time: null, ghosteryPaused: true };
		const expectedPayload = { data, type: UPDATE_GHOSTERY_PAUSED };

		return store.dispatch(summaryActions.updateGhosteryPaused(data)).then(() => {
			const actions = store.getActions();
			expect(actions).toEqual([expectedPayload]);
		});
	});

	test('updateSitePolicy action should return correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);

		const data = { test: true };
		const expectedPayload = { data, type: UPDATE_SITE_POLICY };
		store.dispatch(summaryActions.updateSitePolicy(data));

		const actions = store.getActions();
		expect(actions).toEqual([expectedPayload]);
	});

	test('filterTrackers action should return correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);

		const data = { test: true };
		const expectedPayload = { data, type: FILTER_TRACKERS };
		store.dispatch(summaryActions.filterTrackers(data));

		const actions = store.getActions();
		expect(actions).toEqual([expectedPayload]);
	});
});
