/**
 * SetupLifecycle Test Reducer
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
import SetupLifecycleReducer from '../SetupLifecycleReducer';
import { INIT_SETUP_PROPS } from '../../constants/SetupLifecycleConstants';

const initialState = Immutable({
	setup: {}
});

describe('app/shared-hub/reducers/SetupLifecycleReducer', () => {
	test('initial state is correct', () => {
		expect(SetupLifecycleReducer(undefined, {})).toEqual({});
	});

	test('reducer correctly handles INIT_SETUP_PROPS', () => {
		const data = {
			blockingPolicy: true,
			enable_anti_tracking: true,
			enable_ad_block: true,
			enable_smart_block: true,
		};
		const action = { data, type: INIT_SETUP_PROPS };

		const updatedSetupLifecycleState = Immutable.merge(initialState.setup, data);

		expect(SetupLifecycleReducer(initialState, action)).toEqual({
			setup: updatedSetupLifecycleState
		});
	});
});
