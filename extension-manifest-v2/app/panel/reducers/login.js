/**
 * Login Reducer
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

import { LOGIN_SUCCESS, LOGIN_FAILED } from '../constants/constants';

const initialState = {
	loginSuccess: false,
	loginFailed: false,
};
/**
 * Default export for login view reducer.
 * @memberOf  PanelReactReducers
 *
 * @param  {Object} state 		current state
 * @param  {Object} action 		action which provides data
 * @return {Object}        		updated state clone
 */
export default (state = initialState, action) => {
	switch (action.type) {
		case LOGIN_SUCCESS: {
			return Object.assign({}, state, { loginSuccess: true });
		}
		case LOGIN_FAILED: {
			return Object.assign({}, state, { loginFailed: true });
		}
		default: return state;
	}
};

