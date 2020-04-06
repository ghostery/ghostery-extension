/**
 * PromoModals Class
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

import conf from './Conf';
import globals from './Globals';
import panelData from './PanelData';

const DAYS_BETWEEN_PROMOS = {
	premium: globals.DEBUG ? 0.0005 : 30, // 40 seconds on staging
	insights: globals.DEBUG ? 0.0005 : 30, // 40 seconds on staging
	plus: globals.DEBUG ? 0.0005 : 7 // 40 seconds on staging
};
const WEEKLY_INSIGHTS_TARGET = globals.DEBUG ? 1 : 3;
const DAILY_INSIGHTS_TARGET = globals.DEBUG ? 2 : 3;

const MSECS_IN_DAY = 86400000; // 1000 msecs-in-sec * 60 secs-in-min * 60 mins-in-hour * 24 hours-in-day
const PREMIUM = 'premium';
const INSIGHTS = 'insights';
const PLUS = 'plus';
const PROMO_MODAL_LAST_SEEN = 'promo_modal_last_seen';

/**
 * Static 'namespace' class for handling the business logic for the display of promo modals (Premium, Insights, etc...)
 * @memberOf  BackgroundClasses
 */
class PromoModals {
	/**
	 * Determine if a modal should be shown.  Called from PanelData
	 * when the panel is opened.
	 *
	 * @return {string} Type of promo to show
	 */
	static whichPromoModalShouldWeDisplay() {
		// The order is important
		// Insights takes priority over Plus
		if (this._isTimeForAPromo(INSIGHTS)) return INSIGHTS;
		if (this._isTimeForAPromo(PLUS)) return PLUS;
		return null;
	}

	static recordPremiumPromoSighting() { this._recordPromoSighting(PREMIUM); }

	static recordInsightsPromoSighting() { this._recordPromoSighting(INSIGHTS); }

	static recordPlusPromoSighting() { this._recordPromoSighting(PLUS); }

	static turnOffPromos() {
		panelData.set({ notify_promotions: false });
	}

	/**
	 * Check Conf values to determine if the enough time has
	 * passed for `type` modal to be displayed
	 * @param  {string} type 	The type of modal
	 * @return {Boolean}
	 */
	static _isTimeForAPromo(type) {
		if (conf.notify_promotions === false) { return false; }

		const lastSeenPlusPromo = conf[`${PLUS}_${PROMO_MODAL_LAST_SEEN}`];
		const lastSeenInsightsPromo = conf[`${INSIGHTS}_${PROMO_MODAL_LAST_SEEN}`];
		const lastSeenPromo = Math.max(lastSeenPlusPromo, lastSeenInsightsPromo);

		if (type === INSIGHTS && !this._hasEngagedFrequently()) {
			return false;
		}

		// don't wait 30 days to show the first Insights promo if user meets the criteria before then
		if (type === INSIGHTS && lastSeenInsightsPromo === 0) {
			return true;
		}

		return (
			(Date.now() - lastSeenPromo) >
			(MSECS_IN_DAY * DAYS_BETWEEN_PROMOS[type])
		);
	}

	/**
	 * Store ${type}_promo_modal_last_seen value to Conf
	 * @param  {string} type The type of modal
	 */
	static _recordPromoSighting(type) {
		conf[`${type}_${PROMO_MODAL_LAST_SEEN}`] = Date.now();
	}

	/**
	 * Check the panel engagement rate. If the user has engaged the panel
	 * DAILY_INSIGHTS_TARGET times per day over WEEKLY_INSIGHTS_TARGET weeks, return true.
	 * @return {Boolean}
	 */
	static _hasEngagedFrequently() {
		const { engaged_daily_count } = conf.metrics || [];

		const very_engaged_days = engaged_daily_count.reduce((acc, count) => (count >= DAILY_INSIGHTS_TARGET ? ++acc : acc), 0);

		return very_engaged_days >= WEEKLY_INSIGHTS_TARGET;
	}
}

// the class is simply a namespace for some static methods,
// as we do not need to maintain any state
export default PromoModals;
