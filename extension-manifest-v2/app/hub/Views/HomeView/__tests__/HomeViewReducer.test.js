/**
 * Home View Test Reducer
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

import Immutable from 'seamless-immutable';
import HomeViewReducer from '../HomeViewReducer';
import { GET_HOME_PROPS, SET_METRICS } from '../HomeViewConstants';

// Copied from Home View Container Default Props
const initialState = Immutable({
	home: {
		setup_complete: false,
		tutorial_complete: false,
		enable_metrics: false,
	},
});

describe('app/hub/Views/HomeView reducer', () => {
	test('initial state is correct', () => {
		expect(HomeViewReducer(undefined, {})).toEqual({});
	});

	test('reducer correctly handles GET_HOME_PROPS', () => {
		const data = {
			setup_complete: true,
			tutorial_complete: true,
			enable_metrics: true,
		};
		const action = { data, type: GET_HOME_PROPS };

		const updatedHomeState = Immutable.merge(initialState.home, data);

		expect(HomeViewReducer(initialState, action)).toEqual({
			home: updatedHomeState
		});
	});

	test('reducer correctly handles SET_METRICS', () => {
		const data = {
			enable_metrics: true,
		};
		const action = { data, type: SET_METRICS };
		const initHomeState = Immutable.merge(initialState.home, {
			enable_metrics: true,
		});

		const updatedHomeState = Immutable.merge(initHomeState, {
			enable_ghostery_rewards: data.enable_ghostery_rewards
		});

		expect(HomeViewReducer({ home: initHomeState }, action)).toEqual({
			home: updatedHomeState
		});
	});
});
