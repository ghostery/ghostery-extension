/**
 * Reducer used throughout the UpgradePlanView's flow
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
	TOGGLE_MONTHLY_YEARLY_PRICES,
	SET_BASIC_PROTECTION,
	SET_PLUS_PROTECTION,
	SET_PREMIUM_PROTECTION,
	BASIC,
	PLUS,
	PREMIUM
} from './UpgradePlanViewConstants';

const initialState = {
	show_yearly_prices: true,
	protection_level: BASIC
};

function UpgradePlanViewReducer(state = initialState, action) {
	switch (action.type) {
		case TOGGLE_MONTHLY_YEARLY_PRICES: {
			return {
				...state,
				show_yearly_prices: !state.show_yearly_prices
			};
		}
		case SET_BASIC_PROTECTION: {
			return {
				...state,
				protection_level: BASIC
			};
		}
		case SET_PLUS_PROTECTION: {
			return {
				...state,
				protection_level: PLUS
			};
		}
		case SET_PREMIUM_PROTECTION: {
			return {
				...state,
				protection_level: PREMIUM
			};
		}
		default: return state;
	}
}

export default UpgradePlanViewReducer;
