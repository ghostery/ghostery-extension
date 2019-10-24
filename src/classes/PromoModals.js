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

const DAYS_BETWEEN_PROMOS = {
	plus: globals.DEBUG ? 0.00025 : 30,
	insights: globals.DEBUG ? 0.00025 : 30
};
const WEEKLY_INSIGHTS_TARGET = globals.DEBUG ? 1 : 3;
const DAILY_INSIGHTS_TARGET = 3;

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

	static turnOffPromos() { conf.notify_promotions = false; }

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

		return (
			(Date.now() - lastSeenPromo) >
			(MSECS_IN_DAY * DAYS_BETWEEN_PROMOS[type])
		);
	}

	static _recordPromoSighting(type) {
		conf[`${type}_${PROMO_MODAL_LAST_SEEN}`] = Date.now();
	}

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
