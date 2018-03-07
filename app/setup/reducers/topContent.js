/**
 * Top Content Reducer
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

import { UPDATE_TOP_CONTENT_DATA, SETUP_STEPS } from '../constants/constants';
import globals from '../../../src/classes/Globals';
import { msg } from '../utils';

const initialState = {
	image: '',
	title: '',
};

/**
 * Default export for top-content reducer.
 * Process top-content and return updated state.
 * @param  {Object} state 		current state
 * @param  {Object} action 		action which provides data
 * @return {Object}        		updated state clone
 * @memberof  SetupReactReducers
 */
export default (state = initialState, action) => {
	switch (action.type) {
		case UPDATE_TOP_CONTENT_DATA: {
			return Object.assign({}, state, {
				image: action.data.image,
				title: action.data.title,
			});
		}
		case SETUP_STEPS: {
			switch (action.data.key) {
				case 'setup_step': {
					msg.sendMessage('setupStep', { setup_step: action.data.value });
					break;
				}
				case 'setup_path': {
					msg.sendMessage('setupStep', { setup_path: action.data.value });
					break;
				}
				case 'setup_block': {
					msg.sendMessage('setupStep', { setup_block: action.data.value });
					break;
				}
				default: break;
			}
			break;
		}
		default: return state;
	}
	return state;
};
