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

import { GET_HOME_PROPS, SET_HUMAN_WEB } from './HomeViewConstants';

const initialState = {};

function HomeViewReducer(state = initialState, action) {
	switch (action.type) {
		case GET_HOME_PROPS: {
			const {
				setup_complete,
				tutorial_complete,
				enable_human_web,
				account_text,
				account_link,
			} = action.data;
			return Object.assign({}, state, {
				home: Object.assign({}, state.home, {
					setup_complete,
					tutorial_complete,
					enable_human_web,
					account_text,
					account_link,
				}),
			});
		}
		case SET_HUMAN_WEB: {
			const { enable_human_web } = action.data;
			return Object.assign({}, state, {
				home: Object.assign({}, state.home, { enable_human_web }),
			});
		}

		default: return state;
	}
}

export default HomeViewReducer;
