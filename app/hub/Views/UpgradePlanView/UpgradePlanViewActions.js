/**
 * UpgradePlanView Action creators
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
	SHOW_BASIC_PROTECTION,
	SHOW_PLUS_PROTECTION,
	SHOW_PREMIUM_PROTECTION
} from './UpgradePlanViewConstants';

/**
 * Toggle Monthly/Yearly Prices
 * @return {Object}
 */
export function toggleMonthlyYearlyPrices() {
	return {
		type: TOGGLE_MONTHLY_YEARLY_PRICES,
	};
}

/**
 * Show Basic protection on Mobile View
 * @return {Object}
 */
export function showBasicProtection() {
	return {
		type: SHOW_BASIC_PROTECTION,
	};
}

/**
 * Show Plus protection on Mobile View
 * @return {Object}
 */
export function showPlusProtection() {
	return {
		type: SHOW_PLUS_PROTECTION,
	};
}

/**
 * Show Premium protection on Mobile View
 * @return {Object}
 */
export function showPremiumProtection() {
	return {
		type: SHOW_PREMIUM_PROTECTION,
	};
}
