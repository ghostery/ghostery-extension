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
	SET_BASIC_PROTECTION,
	SET_PLUS_PROTECTION,
	SET_PREMIUM_PROTECTION
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
 * Set Basic protection on medium or smaller screen sizes
 * @return {Object}
 */
export function setBasicProtection() {
	return {
		type: SET_BASIC_PROTECTION,
	};
}

/**
 * Set Plus protection on medium or smaller screen sizes
 * @return {Object}
 */
export function setPlusProtection() {
	return {
		type: SET_PLUS_PROTECTION,
	};
}

/**
 * Set Premium protection on medium or smaller screen sizes
 * @return {Object}
 */
export function setPremiumProtection() {
	return {
		type: SET_PREMIUM_PROTECTION,
	};
}
