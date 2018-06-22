/**
 * Rewards Reducer
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

import {
	GET_REWARDS_DATA,
	TOGGLE_OFFERS_ENABLED,
	REMOVE_OFFER,
	SET_OFFER_READ,
	SEND_SIGNAL
} from '../constants/constants';
import { sendMessage, sendRewardMessage } from '../utils/msg';

const initialState = {
	rewards: null,
	enable_offers: false,
	unread_offer_ids: [],
};

/**
 * Default export for rewards view reducer.
 * @memberof  PanelReactReducers
 *
 * @param  {Object} state 		current state
 * @param  {Object} action 		action which provides data
 * @return {Object}        		unaltered state
 */
export default (state = initialState, action) => {
	switch (action.type) {
		case GET_REWARDS_DATA: {
			return Object.assign({}, state, action.data);
		}
		case TOGGLE_OFFERS_ENABLED: {
			const enable_offers = action.data.enabled;
			return Object.assign({}, state, { enable_offers });
		}

		case REMOVE_OFFER: {
			// Remove offer from unread array
			const unread_offer_ids = [...state.unread_offer_ids];
			const idx = unread_offer_ids.indexOf(action.data.id);
			if (idx !== -1) {
				unread_offer_ids.splice(idx, 1);
			}

			// Remove offer from offers list
			const rewards = Object.assign({}, state.rewards);
			delete rewards[action.data.id];

			sendRewardMessage('deleteReward', { offerId: action.data.id });
			return Object.assign({}, state, { unread_offer_ids, rewards });
		}

		case SET_OFFER_READ: {
			const unread_offer_ids = [...state.unread_offer_ids];
			const idx = unread_offer_ids.indexOf(action.data.id);
			if (idx !== -1) {
				unread_offer_ids.splice(idx, 1);
				sendRewardMessage('rewardSeen', { offerId: action.data.id });
				return Object.assign({}, state, { unread_offer_ids });
			}
			return state;
		}

		case SEND_SIGNAL: {
			sendRewardMessage('rewardSignal', action.data);
			return state;
		}

		default: return state;
	}
};
