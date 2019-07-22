/**
 * Test file for the Summary Reducer
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

import Immutable from 'seamless-immutable';
import summaryReducer from '../summary';
import {
	UPDATE_SUMMARY_DATA,
	UPDATE_CLIQZ_MODULE_DATA,
	UPDATE_TRACKER_COUNTS,
	UPDATE_GHOSTERY_PAUSED,
	UPDATE_SITE_POLICY
} from '../../constants/constants';

// Copied from app/panel/reducers/summary.js
const initialState = Immutable({
	alertCounts: {
		total: 0,
	},
	pageHost: '',
	pageUrl: '',
	paused_blocking: false,
	siteNotScanned: false,
	trackerCounts: {
		allowed: 0,
		blocked: 0,
	},
	tab_id: 0,
	antiTracking: {
		totalUnsafeCount: 0,
		totalUnknownCount: 0,
		unknownTrackerCount: 0,
	},
});

describe('app/panel/reducers/summary.js', () => {
	test('initial state is correct', () => {
		expect(summaryReducer(undefined, {})).toEqual(initialState);
	});

	test('reducer correctly handles UPDATE_SUMMARY_DATA', () => {
		const data = { test: true };
		const action = { data, type: UPDATE_SUMMARY_DATA };
		const initState = Immutable({});

		expect(summaryReducer(initState, action)).toEqual(data);
	});

	test('reducer correctly handles UPDATE_CLIQZ_MODULE_DATA', () => {
		const data = {
			adblock: {
				unchangedData: false,
				changedData: true,
				newData: true
			},
			antiTracking: {
				totalUnsafeCount: 5,
				totalUnknownCount: 3,
				unknownTrackerCount: 1
			}
		};
		const action = { data, type: UPDATE_CLIQZ_MODULE_DATA };
		const initState = Immutable({
			tab_id: 0,
			adBlock: {
				unchangedData: false,
				changedData: false
			},
			antiTracking: {
				totalUnsafeCount: 1,
				totalUnknownCount: 0,
				unknownTrackerCount: 0
			}
		});

		const updatedState = Immutable.merge(initState, {
			adBlock: data.adblock,
			antiTracking: data.antiTracking
		});

		console.log('~~~~~~~~~~~~', summaryReducer(initState, action));

		expect(summaryReducer(initState, action)).toEqual(updatedState);
	});

	test('reducer correctly handles UPDATE_GHOSTERY_PAUSED', () => {
		const data = { time: null, ghosteryPaused: true };
		const action = { data, type: UPDATE_GHOSTERY_PAUSED };

		const updatedState = Immutable.merge(initialState, {
			paused_blocking: data.ghosteryPaused,
			paused_blocking_timeout: data.time
		});

		expect(summaryReducer(undefined, action)).toEqual(updatedState);
	});

	test('reducer correctly handles UPDATE_SITE_POLICY', () => {
		const data = { type: 'blacklist' };
		const action = { data, type: UPDATE_SITE_POLICY };

		const initState = Immutable({
			pageHost: 'www.cnn.com',
			pageUrl: '',
			sitePolicy: 2,
			site_blacklist: [],
			site_whitelist: ['cnn.com']
		});

		expect(summaryReducer(initState, action)).toEqual({
			pageHost: 'www.cnn.com',
			pageUrl: '',
			sitePolicy: 1,
			site_blacklist: ['cnn.com'],
			site_whitelist: []
		});
	});

	test('reducer correctly handles UPDATE_TRACKER_COUNTS', () => {
		const data = {
			num_blocked: 3,
			num_total: 8,
			num_ss_blocked: 1,
			num_ss_allowed: 2
		};
		const action = { data, type: UPDATE_TRACKER_COUNTS };
		const initState = Immutable({});

		expect(summaryReducer(initState, action)).toEqual({
			trackerCounts: {
				blocked: 3,
				allowed: 5,
				ssBlocked: 1,
				ssAllowed: 2
			}
		});
	});
});
