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
	INIT_SETUP_PROPS,
	SET_HIGHEST_SETUP_STEP_REACHED
} from '../constants/SetupLifecycleConstants';

const initialState = {
	setup_step: 0 // To be used in <StepProgressBar /> only. Prevents the user from navigating to a page they have not yet completed the previous steps for
};

// const initialState = {};

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
				setup: {
					blockingPolicy,
					enable_anti_tracking,
					enable_ad_block,
					enable_smart_block,
					setup_step: 0
				}
			};
		}
		case SET_HIGHEST_SETUP_STEP_REACHED: {
			return {
				...state,
				setup: {
					...state.setup,
					setup_step: action.data
				}
			};
		}

		default: return state;
	}
}

export default SetupLifecycleReducer;
