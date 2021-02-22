/**
 * AntiSuite Test Reducer
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

import Immutable from 'seamless-immutable';
import AntiSuiteReducer from '../AntiSuiteReducer';
import { SET_AD_BLOCK, SET_ANTI_TRACKING, SET_SMART_BLOCK } from '../../constants/AntiSuiteConstants';

const initialState = Immutable({
	enable_ad_block: false,
	enable_anti_tracking: false,
	enable_smart_block: false
});

describe('app/shared-hub/reducers/AntiSuiteReducer', () => {
	test('initial state is correct', () => {
		expect(AntiSuiteReducer(undefined, {})).toEqual({...initialState});
	});

	test('reducer correctly handles SET_AD_BLOCK', () => {
		const data = {
			enable_ad_block: true,
		};
		const action = { data, type: SET_AD_BLOCK };

		const updatedAntiSuiteState = Immutable.merge(initialState, data);

		expect(AntiSuiteReducer(initialState, action)).toEqual({
			...updatedAntiSuiteState
		});
	});

	test('reducer correctly handles SET_ANTI_TRACKING', () => {
		const data = {
			enable_anti_tracking: true,
		};
		const action = { data, type: SET_ANTI_TRACKING };

		const updatedAntiSuiteState = Immutable.merge(initialState, data);

		expect(AntiSuiteReducer(initialState, action)).toEqual({
			...updatedAntiSuiteState
		});
	});

	test('reducer correctly handles SET_SMART_BLOCK', () => {
		const data = {
			enable_smart_block: true,
		};
		const action = { data, type: SET_SMART_BLOCK };

		const updatedAntiSuiteState = Immutable.merge(initialState, data);

		expect(AntiSuiteReducer(initialState, action)).toEqual({
			...updatedAntiSuiteState
		});
	});
});
