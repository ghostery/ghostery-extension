/**
 * Blocking Reducer
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
	UPDATE_BLOCK_ALL,
	UPDATE_BLOCK_NONE,
	UPDATE_BLOCK_ADS,
	UPDATE_BLOCK_CUSTOM
} from '../constants/constants';
import { msg } from '../utils';

const initialState = {
	policy: 'none',
};

/**
 * Default export for blocking reducer.
 * Process blocking and return updated state.
 * @param  {Object} state 		current state
 * @param  {Object} action 		action which provides data
 * @return {Object}        		updated state clone
 * @memberof  SetupReactReducers
 */
export default (state = initialState, action) => {
	switch (action.type) {
		case UPDATE_BLOCK_ALL: {
			msg.sendMessage('updateBlocking', UPDATE_BLOCK_ALL);
			return Object.assign({}, state, {
				policy: 'all',
			});
		}
		case UPDATE_BLOCK_NONE: {
			msg.sendMessage('updateBlocking', UPDATE_BLOCK_NONE);
			return Object.assign({}, state, {
				policy: 'none',
			});
		}
		case UPDATE_BLOCK_ADS: {
			msg.sendMessage('updateBlocking', UPDATE_BLOCK_ADS);
			return Object.assign({}, state, {
				policy: 'ads',
			});
		}
		case UPDATE_BLOCK_CUSTOM: {
			return Object.assign({}, state, {
				policy: 'custom',
			});
		}
		default: return state;
	}
};
