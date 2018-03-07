/**
 * Navigation Reducer
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
	UPDATE_NAVIGATION_NEXT_BUTTON,
	RESET_NAVIGATION_NEXT_BUTTON,
	SHOW_LOADING_NAVIGATION_BUTTON,
	HIDE_LOADING_NAVIGATION_BUTTON,
	NAVIGATION_NEXT
} from '../constants/constants';

const initialState = {
	nextButtons: [{
		title: t('setup_button_next'),
		action: 'next',
	}],
	loading: false,
	triggerNext: false,
};

/**
 * Default export for navigation reducer.
 * Process navigation and return updated state.
 * @param  {Object} state 		current state
 * @param  {Object} action 		action which provides data
 * @return {Object}        		updated state clone
 * @memberof  SetupReactReducers
 */
export default (state = initialState, action) => {
	switch (action.type) {
		case UPDATE_NAVIGATION_NEXT_BUTTON: {
			return Object.assign({}, state, {
				nextButtons: action.data,
				triggerNext: initialState.triggerNext,
			});
		}
		case RESET_NAVIGATION_NEXT_BUTTON: {
			return Object.assign({}, state, {
				nextButtons: initialState.nextButtons,
				triggerNext: initialState.triggerNext,
			});
		}
		case SHOW_LOADING_NAVIGATION_BUTTON: {
			return Object.assign({}, state, {
				loading: true,
			});
		}
		case HIDE_LOADING_NAVIGATION_BUTTON: {
			return Object.assign({}, state, {
				loading: false,
			});
		}
		case NAVIGATION_NEXT: {
			return Object.assign({}, state, {
				triggerNext: true,
			});
		}
		default: return state;
	}
};
