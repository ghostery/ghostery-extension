/**
 * Reducer used in the App View
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

import { CLEAR_LOGIN_PARAMS } from './AppViewConstants';
import { LOGIN_SUCCESS, REGISTER_SUCCESS, LOGOUT_SUCCESS } from '../../../Account/AccountConstants';

const initialState = { fromLoginPage: false, fromCreateAccountPage: false };

function AppViewReducer(state = initialState, action) {
	switch (action.type) {
		case LOGIN_SUCCESS: {
			return Object.assign({}, state, { fromLoginPage: true, fromCreateAccountPage: false });
		}
		case REGISTER_SUCCESS: {
			return Object.assign({}, state, { fromLoginPage: false, fromCreateAccountPage: true });
		}
		case LOGOUT_SUCCESS: {
			return Object.assign({}, state, initialState);
		}
		case CLEAR_LOGIN_PARAMS: {
			return Object.assign({}, state, initialState);
		}
		default: return state;
	}
}

export default AppViewReducer;
