/**
 * Reducer for the Choose Default Search view in the Dawn onboarding hub
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2021 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import {
	SET_DEFAULT_SEARCH,
	SEARCH_GHOSTERY,
	SEARCH_BING,
	SEARCH_STARTPAGE,
	SEARCH_YAHOO
} from './ChooseDefaultSearchConstants';

const initialState = {
	defaultSearch: SEARCH_GHOSTERY,
};

function ChooseDefaultSearchReducer(state = initialState, action) {
	switch (action.type) {
		case SET_DEFAULT_SEARCH: {
			const newDefault = action.data;

			console.log('in SET_DEFAULT_SEARCH reducer switch case. newDefault:');
			console.log(newDefault);

			if ([SEARCH_GHOSTERY, SEARCH_BING, SEARCH_STARTPAGE, SEARCH_YAHOO].includes(newDefault)) {
				return {
					...state,
					defaultSearch: newDefault
				};
			}

			return state;
		}

		default: return state;
	}
}

export default ChooseDefaultSearchReducer;
