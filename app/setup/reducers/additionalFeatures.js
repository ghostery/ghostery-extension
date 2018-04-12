/**
 * Additional Features Reducer
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
/**
 * @namespace SetupReactReducers
 */
import {
	UPDATE_ANTITRACK,
	UPDATE_SMARTBLOCK,
	UPDATE_ADBLOCK
} from '../constants/constants';
import { msg } from '../utils';
import globals from '../../../src/classes/Globals';

const { IS_CLIQZ } = globals;

const initialState = {
	antiTrack: !IS_CLIQZ,
	adBlock: !IS_CLIQZ,
	smartBlock: true
};

/**
 * Default export for additional-features reducer.
 * Process additional-features and return updated state.
 * @param  {Object} state 		current state
 * @param  {Object} action 		action which provides data
 * @return {Object}        		updated state clone
 * @memberof  SetupReactReducers
 */
export default (state = initialState, action) => {
	switch (action.type) {
		case UPDATE_ANTITRACK: {
			if(IS_CLIQZ) {
				return state;
			}
			msg.sendMessage('updateAntiTrack', action.data);
			return Object.assign({}, state, {
				antiTrack: action.data,
			});
		}
		case UPDATE_SMARTBLOCK: {
			msg.sendMessage('updateSmartBlock', action.data);
			return Object.assign({}, state, {
				smartBlock: action.data,
			});
		}
		case UPDATE_ADBLOCK: {
			if(IS_CLIQZ) {
				return state;
			}
			msg.sendMessage('updateAdBlock', action.data);
			return Object.assign({}, state, {
				adBlock: action.data,
			});
		}
		default: return state;
	}
};
