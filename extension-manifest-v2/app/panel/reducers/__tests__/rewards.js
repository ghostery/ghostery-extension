/**
 * Test file for the Rewards Reducer
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
import rewardsReducer from '../rewards';
import {
	UPDATE_REWARDS_DATA,
	TOGGLE_OFFERS_ENABLED,
	SEND_SIGNAL
} from '../../constants/constants';

// Copied from app/panel/reducers/rewards.js
const initialState = Immutable({
	enable_offers: false,
});

describe('app/panel/reducers/rewards.js', () => {
	test('initial state is correct', () => {
		expect(rewardsReducer(undefined, {})).toEqual(initialState);
	});

	test('reducer correctly handles UPDATE_REWARDS_DATA', () => {
		const data = { test: true };
		const action = { data, type: UPDATE_REWARDS_DATA };
		const initState = Immutable({});

		expect(rewardsReducer(initState, action)).toEqual(data);
	});

	test('reducer correctly handles TOGGLE_OFFERS_ENABLED', () => {
		const data = { enabled: true };
		const action = { data, type: TOGGLE_OFFERS_ENABLED };

		const updatedState = Immutable.merge(initialState, {
			enable_offers: action.data.enabled,
		});

		expect(rewardsReducer(initialState, action)).toEqual(updatedState);
	});

	test('reducer correctly handles SEND_SIGNAL', () => {
		const data = {
			actionId: 'action_id',
			offerId: 'offer_id',
		};
		const action = { data, type: SEND_SIGNAL };

		expect(rewardsReducer(initialState, action)).toEqual(initialState);
	});
});
