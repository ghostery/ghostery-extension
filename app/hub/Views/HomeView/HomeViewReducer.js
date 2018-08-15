/**
 * Reducer used in the Home View
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
import { TOGGLE_ANALYTICS } from './HomeViewConstants';

const initialState = {};

function HomeViewReducer(state = initialState, action) {
	switch (action.type) {
		case TOGGLE_ANALYTICS: {
			return Object.assign({}, state, {
				home: {
					enable_human_web: action.data.enable_human_web
				},
			});
		}

		default: return state;
	}
}

export default HomeViewReducer;
