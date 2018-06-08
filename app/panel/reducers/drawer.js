/**
 * Drawer Reducer
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
	GET_CLIQZ_MODULE_DATA,
	OPEN_DRAWER,
	CLOSE_DRAWER
} from '../constants/constants';

const initialState = {
	activeDrawerType: null,
	adBlock: {},
	antiTracking: {},
	drawerIsOpen: false,
};
/**
 * Default export for drawer component reducer.
 * @memberOf  PanelReactReducers
 *
 * @param  {Object} state 		current state
 * @param  {Object} action 		action which provides data
 * @return {Object}        		updated state clone
 */
export default (state = initialState, action) => {
	switch (action.type) {
		case GET_CLIQZ_MODULE_DATA: {
			return Object.assign({}, state, { adBlock: action.data.adblock, antiTracking: action.data.antitracking });
		}
		case OPEN_DRAWER: {
			return Object.assign({}, state, {
				drawerIsOpen: true,
				activeDrawerType: action.data,
			});
		}
		case CLOSE_DRAWER: {
			return Object.assign({}, state, { drawerIsOpen: false });
		}
		default: return state;
	}
};
