/**
 * Setup View Test Reducer
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
import SetupViewReducer from '../SetupViewReducer';
import {
	GET_SETUP_SHOW_WARNING_OVERRIDE,
	SET_SETUP_SHOW_WARNING_OVERRIDE,
	INIT_SETUP_PROPS,
	SET_SETUP_NAVIGATION,
	SET_BLOCKING_POLICY,
	BLOCKING_POLICY_RECOMMENDED,
	BLOCKING_POLICY_NOTHING,
	SET_ANTI_TRACKING,
	SET_AD_BLOCK,
	SET_SMART_BLOCK,
	SET_HUMAN_WEB
} from '../SetupViewConstants';

// Copied from Setup View Container Default Props
const initialState = Immutable({
	setup: {
		navigation: {
			activeIndex: 0,
			hrefPrev: false,
			hrefNext: false,
			hrefDone: false,
			textPrev: false,
			textNext: false,
			textDone: false,
		},
		setup_show_warning_override: true,
		blockingPolicy: BLOCKING_POLICY_RECOMMENDED,
		enable_anti_tracking: true,
		enable_ad_block: true,
		enable_smart_block: true,
		enable_human_web: true,
	},
});

describe('app/hub/Views/SetupView reducer', () => {
	test('initial state is correct', () => {
		expect(SetupViewReducer(undefined, {})).toEqual({});
	});

	test('reducer correctly handles GET_SETUP_SHOW_WARNING_OVERRIDE', () => {
		const data = { setup_show_warning_override: false };
		const action = { data, type: GET_SETUP_SHOW_WARNING_OVERRIDE };

		const updatedSetupState = Immutable.merge(initialState.setup, data);

		expect(SetupViewReducer(initialState, action)).toEqual({
			setup: updatedSetupState
		});
	});

	test('reducer correctly handles SET_SETUP_SHOW_WARNING_OVERRIDE', () => {
		const data = { setup_show_warning_override: false };
		const action = { data, type: SET_SETUP_SHOW_WARNING_OVERRIDE };

		const updatedSetupState = Immutable.merge(initialState.setup, data);

		expect(SetupViewReducer(initialState, action)).toEqual({
			setup: updatedSetupState
		});
	});

	test('reducer correctly handles INIT_SETUP_PROPS', () => {
		const data = initialState.setup;
		const action = { data, type: INIT_SETUP_PROPS };
		const initState = Immutable({});

		expect(SetupViewReducer(initState, action)).toEqual(initialState);
	});

	test('reducer correctly handles SET_SETUP_NAVIGATION', () => {
		const data = {
			activeIndex: 2,
			hrefPrev: '/test/1',
			hrefNext: '/test/3',
			hrefDone: '/',
			textPrev: 'Back',
			textNext: 'Next',
			textDone: 'Exit',
		};
		const action = { data, type: SET_SETUP_NAVIGATION };

		const updatedSetupState = Immutable.merge(initialState.setup, {
			navigation: data,
		});

		expect(SetupViewReducer(initialState, action)).toEqual({
			setup: updatedSetupState
		});
	});

	test('reducer correctly handles SET_BLOCKING_POLICY', () => {
		const data = { blockingPolicy: BLOCKING_POLICY_NOTHING };
		const action = { data, type: SET_BLOCKING_POLICY };

		const updatedSetupState = Immutable.merge(initialState.setup, data);

		expect(SetupViewReducer(initialState, action)).toEqual({
			setup: updatedSetupState
		});
	});

	test('reducer correctly handles SET_ANTI_TRACKING', () => {
		const data = { enable_anti_tracking: false };
		const action = { data, type: SET_ANTI_TRACKING };
		const initState = Immutable({
			setup: {
				test: 'test-val',
				example: 'example-val',
			}
		});

		const updatedSetupState = Immutable.merge(initState.setup, data);

		expect(SetupViewReducer(initState, action)).toEqual({
			setup: updatedSetupState
		});
	});

	test('reducer correctly handles SET_AD_BLOCK', () => {
		const data = {
			bad: 'bad-data',
			enable_ad_block: false,
		};
		const action = { data, type: SET_AD_BLOCK };
		const initState = Immutable({});

		expect(SetupViewReducer(initState, action)).toEqual({
			setup: {
				enable_ad_block: data.enable_ad_block,
			}
		});
	});

	test('reducer correctly handles SET_SMART_BLOCK', () => {
		const data = {
			test: 'test-bad-data',
			enable_smart_block: false,
		};
		const action = { data, type: SET_SMART_BLOCK };
		const initState = Immutable({
			setup: {
				test: 'test-good-data',
				example: 'example-good-data',
				enable_smart_block: 'ESB-bad-data',
			}
		});

		expect(SetupViewReducer(initState, action)).toEqual({
			setup: {
				test: 'test-good-data',
				example: 'example-good-data',
				enable_smart_block: data.enable_smart_block,
			}
		});
	});

	test('reducer correctly handles SET_HUMAN_WEB', () => {
		const data = { enable_human_web: false };
		const action = { data, type: SET_HUMAN_WEB };
		const initState = Immutable({
			test: {
				example: 'test-good-data',
			}
		});

		const updatedState = Immutable.merge(initState, { setup: data });

		expect(SetupViewReducer(initState, action)).toEqual(updatedState);
	});
});
