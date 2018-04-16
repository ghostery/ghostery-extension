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
	GET_REWARDS_ACTIVE,
	REMOVE_REWARD_ID,
	TOGGLE_REWARDS_ACTIVE
} from '../constants/constants';

const initialState = {
	rewards: null,
	rewardsActive: true,
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
		case GET_REWARDS_ACTIVE: {
			const { rewardsActive } = state;
			return (!rewardsActive) ? state : Object.assign({}, state, {
				rewards: action.data
			});
		}
		case REMOVE_REWARD_ID: {
			const { rewards } = state;
			const filtered = rewards.filter(el => el.id !== action.data.id);
			return Object.assign({}, state, {
				rewards: filtered,
			});
		}
		case TOGGLE_REWARDS_ACTIVE: {
			const { rewards, rewardsActive } = state;
			const updatedRewardsActive = !rewardsActive;
			const updatedRewards = updatedRewardsActive ? rewards : [];
			return Object.assign({}, state, {
				rewards: updatedRewards,
				rewardsActive: updatedRewardsActive,
			});
		}
		default: return state;
	}
};
