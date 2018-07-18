/**
 * Subscription Reducer
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

/* eslint no-use-before-define: 0 */

import moment from 'moment/min/moment-with-locales.min';
import {
	GET_SUBSCRIPTION_DATA,
} from '../constants/constants';
import { removeFromObject, updateObject } from '../utils/utils';
import { sendMessage } from '../utils/msg';
import globals from '../../../src/classes/Globals';
import { objectEntries } from '../../../src/utils/common';

const initialState = {
};
/**
 * Default export for settings view reducer.
 * @memberOf  PanelReactReducers
 *
 * @param  {Object} state 		current state
 * @param  {Object} action 		action which provides data
 * @return {Object}        		updated state clone
 */
export default (state = initialState, action) => {
	switch (action.type) {
		case GET_SUBSCRIPTION_DATA: {
			return Object.assign({}, state, action.data);
		}
		default: return state;
	}
};

