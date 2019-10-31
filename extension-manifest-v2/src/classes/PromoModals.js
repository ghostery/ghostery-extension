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
	plus: globals.DEBUG ? 0.0005 : 30, // 40 seconds on staging
	insights: globals.DEBUG ? 0.0005 : 30 // 40 seconds on staging
};
const WEEKLY_INSIGHTS_TARGET = globals.DEBUG ? 1 : 3;
const DAILY_INSIGHTS_TARGET = globals.DEBUG ? 7 : 3;

const MSECS_IN_DAY = 86400000; // 1000 msecs-in-sec * 60 secs-in-min * 60 mins-in-hour * 24 hours-in-day
const PLUS = 'plus';
const PLUS_INITIAL = 'plus_initial';
const PLUS_UPGRADE = 'plus_upgrade';
const INSIGHTS = 'insights';
const PROMO_MODAL_LAST_SEEN = 'promo_modal_last_seen';

/**
 * Static 'namespace' class for handling the business logic for the display of promo modals (Plus, Insights, etc...)
 * @memberOf  BackgroundClasses
 */
class PromoModals {
	static whichPromoModalShouldWeDisplay() {
		if (this._isTimeForAPromo(INSIGHTS)) return INSIGHTS;

		if (this._isTimeForAPromo(PLUS)) {
			if (this._haveSeenInitialPlusPromo()) return PLUS_UPGRADE;

			return PLUS_INITIAL;
		}

		return null;
	}

	static recordPlusPromoSighting() { this._recordPromoSighting(PLUS); }

	static recordInsightsPromoSighting() { this._recordPromoSighting(INSIGHTS); }

	static turnOffPromos() { panelData.set({ notify_promotions: false }); }

	static _haveSeenInitialPlusPromo() {
		const lastSeenTime = conf[`${PLUS}_${PROMO_MODAL_LAST_SEEN}`];
		return (lastSeenTime !== 0);
	}

	static _isTimeForAPromo(type) {
		if (conf.notify_promotions === false) { return false; }

		const lastSeenPlusPromo = conf[`${PLUS}_${PROMO_MODAL_LAST_SEEN}`];
		const lastSeenInsightsPromo = conf[`${INSIGHTS}_${PROMO_MODAL_LAST_SEEN}`];
		const lastSeenPromo = lastSeenPlusPromo > lastSeenInsightsPromo ? lastSeenPlusPromo : lastSeenInsightsPromo;

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

		let very_engaged_days = 0;
		engaged_daily_count.forEach((count) => {
			very_engaged_days = count >= DAILY_INSIGHTS_TARGET ? ++very_engaged_days : very_engaged_days;
		});

		if (very_engaged_days >= WEEKLY_INSIGHTS_TARGET) return true;

		return false;
	}
}

// the class is simply a namespace for some static methods,
// as we do not need to maintain any state
export default PromoModals;
