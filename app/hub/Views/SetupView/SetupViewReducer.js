/**
 * Reducer used throughout the Setup View's flow
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2019 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import {
	GET_SETUP_SHOW_WARNING_OVERRIDE,
	SET_SETUP_SHOW_WARNING_OVERRIDE,
	INIT_SETUP_PROPS,
	SET_SETUP_NAVIGATION,
	SET_BLOCKING_POLICY,
	SET_ANTI_TRACKING,
	SET_AD_BLOCK,
	SET_SMART_BLOCK,
	SET_HUMAN_WEB
} from './SetupViewConstants';

const initialState = {};

function SetupViewReducer(state = initialState, action) {
	switch (action.type) {
		// Setup View
		case GET_SETUP_SHOW_WARNING_OVERRIDE: // Same as SET_SETUP_SHOW_WARNING_OVERRIDE
		case SET_SETUP_SHOW_WARNING_OVERRIDE: {
			const { setup_show_warning_override } = action.data;
			return { ...state, setup: { ...state.setup, setup_show_warning_override } };
		}
		case INIT_SETUP_PROPS: {
			const {
				navigation,
				setup_show_warning_override,
				blockingPolicy,
				enable_anti_tracking,
				enable_ad_block,
				enable_smart_block,
				enable_human_web,
			} = action.data;
			const {
				activeIndex,
				hrefPrev,
				hrefNext,
				hrefDone,
				textPrev,
				textNext,
				textDone,
			} = navigation;
			return {
				...state,
				setup: {
					navigation: {
						activeIndex,
						hrefPrev,
						hrefNext,
						hrefDone,
						textPrev,
						textNext,
						textDone,
					},
					setup_show_warning_override,
					blockingPolicy,
					enable_anti_tracking,
					enable_ad_block,
					enable_smart_block,
					enable_human_web,
				}
			};
		}
		case SET_SETUP_NAVIGATION: {
			const {
				activeIndex,
				hrefPrev,
				hrefNext,
				hrefDone,
				textPrev,
				textNext,
				textDone,
			} = action.data;
			return {
				...state,
				setup: {
					...state.setup,
					navigation: {
						activeIndex,
						hrefPrev,
						hrefNext,
						hrefDone,
						textPrev,
						textNext,
						textDone,
					}
				}
			};
		}

		// Setup Blocking View
		case SET_BLOCKING_POLICY: {
			const { blockingPolicy } = action.data;
			return { ...state, setup: { ...state.setup, blockingPolicy } };
		}

		// Setup Anti-Suite View
		case SET_ANTI_TRACKING: {
			const { enable_anti_tracking } = action.data;
			return { ...state, setup: { ...state.setup, enable_anti_tracking } };
		}
		case SET_AD_BLOCK: {
			const { enable_ad_block } = action.data;
			return { ...state, setup: { ...state.setup, enable_ad_block } };
		}
		case SET_SMART_BLOCK: {
			const { enable_smart_block } = action.data;
			return { ...state, setup: { ...state.setup, enable_smart_block } };
		}

		// Setup Human Web View
		case SET_HUMAN_WEB: {
			const { enable_human_web } = action.data;
			return { ...state, setup: { ...state.setup, enable_human_web } };
		}

		default: return state;
	}
}

export default SetupViewReducer;
