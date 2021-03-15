/**
 * Reducer for the setup flow's lifecycle events, for use by the Hubs
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2020 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import {
	INIT_SETUP_PROPS, SET_BLOCK_SETUP_SEEN, SET_SEARCH_SETUP_SEEN
} from '../constants/SetupLifecycleConstants';

const initialState = {
	setupLifecycle: {
		blockingPolicy: '',
		enable_anti_tracking: false,
		enable_ad_block: false,
		enable_smart_block: false,
		blockSetupSeen: false,
		searchSetupSeen: false
	}
};

function SetupLifecycleReducer(state = initialState, action) {
	switch (action.type) {
		// TODO add navigation, override warning, and human web props init as separate case to share this with original hub
		case INIT_SETUP_PROPS: {
			const {
				blockingPolicy,
				enable_anti_tracking,
				enable_ad_block,
				enable_smart_block,
			} = action.data;
			return {
				...state,
				setupLifecycle: {
					blockingPolicy,
					enable_anti_tracking,
					enable_ad_block,
					enable_smart_block,
					blockSetupSeen: false,
					searchSetupSeen: false
				}
			};
		}
		case SET_BLOCK_SETUP_SEEN: {
			return { ...state, setupLifecycle: { ...state.setupLifecycle, blockSetupSeen: action.data } };
		}
		case SET_SEARCH_SETUP_SEEN: {
			return { ...state, setupLifecycle: { ...state.setupLifecycle, searchSetupSeen: action.data } };
		}

		default: return state;
	}
}

export default SetupLifecycleReducer;
