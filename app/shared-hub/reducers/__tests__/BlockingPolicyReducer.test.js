/**
 * BlockingPolicy Test Reducer
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
import BlockingPolicyReducer from '../BlockingPolicyReducer';
import { SET_BLOCKING_POLICY } from '../../constants/BlockingPolicyConstants';

const initialState = Immutable({
	setup: {
		blockingPolicy: true
	}
});

describe('app/shared-hub/reducers/BlockingPolicy', () => {
	test('initial state is correct', () => {
		expect(BlockingPolicyReducer(undefined, {})).toEqual({});
	});

	test('reducer correctly handles SET_BLOCKING_POLICY', () => {
		const data = {
			blockingPolicy: true,
		};
		const action = { data, type: SET_BLOCKING_POLICY };

		const updatedBlockingPolicyState = Immutable.merge(initialState.setup, data);

		expect(BlockingPolicyReducer(initialState, action)).toEqual({
			setup: updatedBlockingPolicyState
		});
	});
});
