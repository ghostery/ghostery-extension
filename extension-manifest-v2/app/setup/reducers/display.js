/**
 * Display Reducer
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

import { UPDATE_DISPLAY_MODE } from '../constants/constants';
import { msg } from '../utils';

const initialState = {
	displayMode: 'simple',
};

/**
 * Default export for display reducer.
 * Process display and return updated state.
 * @param  {Object} state 		current state
 * @param  {Object} action 		action which provides data
 * @return {Object}        		updated state clone
 * @memberof  SetupReactReducers
 */
export default (state = initialState, action) => {
	switch (action.type) {
		case UPDATE_DISPLAY_MODE: {
			msg.sendMessage('updateDisplayMode', action.data);
			return Object.assign({}, state, {
				displayMode: action.data ? 'detailed' : 'simple',
			});
		}
		default: return state;
	}
};
