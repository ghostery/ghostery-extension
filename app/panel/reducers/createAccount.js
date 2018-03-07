/**
 * Create Account Reducer
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

import { CREATE_ACCOUNT_SUCCESS, CREATE_ACCOUNT_FAILED } from '../constants/constants';
import { sendMessage } from '../utils/msg';

const initialState = {
	createAccountSuccess: false,
	createAccountFailed: false,
};
/**
 * Default export for create account view reducer
 * Process specified create account action and return updated state.
 * @memberOf  PanelReactReducers
 * @param  {Object} state 		current state
 * @param  {Object} action 		action which provides data
 * @return {Object}        		updated state clone
 */
export default (state = initialState, action) => {
	switch (action.type) {
		case CREATE_ACCOUNT_SUCCESS: {
			sendMessage('ping', 'create_account_extension');
			return Object.assign({}, state, { createAccountSuccess: true });
		}
		case CREATE_ACCOUNT_FAILED: {
			return Object.assign({}, state, { createAccountFailed: true });
		}
		default: return state;
	}
};

