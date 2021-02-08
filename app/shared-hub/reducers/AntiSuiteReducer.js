/**
 * Anti Suite reducer for the Hubs
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
	SET_AD_BLOCK,
	SET_ANTI_TRACKING,
	SET_SMART_BLOCK
} from '../constants/AntiSuiteConstants';

const initialState = {
	antiSuite: {
		enable_ad_block: false,
		enable_anti_tracking: false,
		enable_smart_block: false
	}
};

function AntiSuiteReducer(state = initialState, action) {
	switch (action.type) {
		case SET_AD_BLOCK: {
			const { enable_ad_block } = action.data;
			return { ...state, antiSuite: { ...state.antiSuite, enable_ad_block } };
		}
		case SET_ANTI_TRACKING: {
			const { enable_anti_tracking } = action.data;
			return { ...state, antiSuite: { ...state.antiSuite, enable_anti_tracking } };
		}
		case SET_SMART_BLOCK: {
			const { enable_smart_block } = action.data;
			return { ...state, antiSuite: { ...state.antiSuite, enable_smart_block } };
		}

		default: return state;
	}
}

export default AntiSuiteReducer;
