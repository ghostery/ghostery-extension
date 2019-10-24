/**
 * Rewards Reducer
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

import {
	UPDATE_REWARDS_DATA,
	TOGGLE_OFFERS_ENABLED,
	SEND_SIGNAL
} from '../constants/constants';
import { sendRewardMessage } from '../utils/msg';

const initialState = {
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
		case UPDATE_REWARDS_DATA: {
			return Object.assign({}, state, action.data);
		}
		case TOGGLE_OFFERS_ENABLED: {
			const enable_offers = action.data.enabled;
			return Object.assign({}, state, { enable_offers });
		}

		case SEND_SIGNAL: {
			sendRewardMessage('rewardSignal', action.data);
			return state;
		}

		default: return state;
	}
};
