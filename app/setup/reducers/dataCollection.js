/**
 * Data Collection Reducer
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

import { UPDATE_DATA_COLLECTION } from '../constants/constants';
import { msg } from '../utils';

const initialState = {
	enabled: true,
};

/**
 * Default export for data-collection reducer.
 * Process data-collection and return updated state.
 * @param  {Object} state 		current state
 * @param  {Object} action 		action which provides data
 * @return {Object}        		updated state clone
 * @memberof  SetupReactReducers
 */
export default (state = initialState, action) => {
	switch (action.type) {
		case UPDATE_DATA_COLLECTION: {
			msg.sendMessage('updateDataCollection', action.data);
			return Object.assign({}, state, {
				enabled: action.data,
			});
		}
		default: return state;
	}
};
