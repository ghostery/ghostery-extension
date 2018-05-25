/**
 * Test file for Rewards Actions
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
import * as rewardsActions from '../RewardsActions';
import {
	GET_REWARDS_DATA,
	TOGGLE_OFFERS_ENABLED,
	REMOVE_OFFER,
	SET_OFFER_READ,
	SEND_SIGNAL
} from '../../constants/constants';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

const testData = { test: true };
msg.sendMessageInPromise = jest.fn(messageType => new Promise((resolve, reject) => {
	switch (messageType) {
		case 'getPanelData':
			resolve(testData);
			break;
		default:
			resolve();
	}
}));

describe('app/panel/actions/RewardsActions.js', () => {
	test('getRewardsData action should return correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);

		const data = testData;
		const expectedPayload = { data, type: GET_REWARDS_DATA };

		return store.dispatch(rewardsActions.getRewardsData()).then(() => {
			const actions = store.getActions();
			expect(actions).toEqual([expectedPayload]);
		});
	});

	test('toggleOffersEnabled action should return correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);

		const enabled = true;
		const expectedPayload = { data: { enabled }, type: TOGGLE_OFFERS_ENABLED };
		store.dispatch(rewardsActions.toggleOffersEnabled(enabled));

		const actions = store.getActions();
		expect(actions).toEqual([expectedPayload]);
	});

	test('removeOffer action should return correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);

		const id = 'test_reward_id';
		const expectedPayload = { data: { id }, type: REMOVE_OFFER };
		store.dispatch(rewardsActions.removeOffer(id));

		const actions = store.getActions();
		expect(actions).toEqual([expectedPayload]);
	});

	test('setOfferRead action should return correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);

		const id = 'test_reward_id';
		const expectedPayload = { data: { id }, type: SET_OFFER_READ };
		store.dispatch(rewardsActions.setOfferRead(id));

		const actions = store.getActions();
		expect(actions).toEqual([expectedPayload]);
	});

	test('sendSignal offer-action-signal should return correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);

		const actionId = 'action_id';
		const offerId = 'offer_id';
		const origin = 'rewards-hub';
		const type = 'offer-action-signal';
		const expectedPayload = {
			data: {
				actionId, offerId, origin, type
			},
			type: SEND_SIGNAL
		};
		store.dispatch(rewardsActions.sendSignal(actionId, offerId));

		const actions = store.getActions();
		expect(actions).toEqual([expectedPayload]);
	});

	test('sendSignal action-signal should return correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);

		const actionId = 'action_id';
		const offerId = undefined;
		const origin = 'rewards-hub';
		const type = 'action-signal';
		const expectedPayload = {
			data: {
				actionId, offerId, origin, type
			},
			type: SEND_SIGNAL
		};
		store.dispatch(rewardsActions.sendSignal(actionId));

		const actions = store.getActions();
		expect(actions).toEqual([expectedPayload]);
	});
});
