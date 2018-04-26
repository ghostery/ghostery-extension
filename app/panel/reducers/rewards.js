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
	SET_OFFER_READ
} from '../constants/constants';
import { sendMessage } from '../utils/msg';

const initialState = {
	rewards: null,
	enable_offers: false,
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
			sendMessage('setPanelData', { enable_offers });
			return Object.assign({}, state, { enable_offers });
		}

		case REMOVE_OFFER: {
			console.log('removing an offer does not work right now');
			return state;
		}

		case SET_OFFER_READ: {
			console.log('setting an offer to read does not work right now');
			return state;
		}
		default: return state;
	}
};
