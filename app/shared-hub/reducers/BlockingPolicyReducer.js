/**
 * Reducer used throughout the Onboarding View's flow
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

import { SET_BLOCKING_POLICY } from '../constants/BlockingPolicyConstants';

const initialState = {
	blockingPolicy: ''
};

function BlockingPolicyReducer(state = initialState, action) {
	switch (action.type) {
		case SET_BLOCKING_POLICY: {
			const { blockingPolicy } = action.data;
			return { ...state, blockingPolicy };
		}

		default: return state;
	}
}

export default BlockingPolicyReducer;
