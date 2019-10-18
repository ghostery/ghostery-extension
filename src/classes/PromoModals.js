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
const MSECS_IN_DAY = 86400000; // 1000 msecs-in-sec * 60 secs-in-min * 60 mins-in-hour * 24 hours-in-day
const PLUS = 'plus';
const INSIGHTS = 'insights';
const PROMO_MODAL_LAST_SEEN = 'promo_modal_last_seen';

/**
 * Static 'namespace' class for handling the business logic for the display of promo modals (Plus, Insights, etc...)
 * @memberOf  BackgroundClasses
 */
class PromoModals {
	static haveSeenInitialPlusPromo() {
		const lastSeenTime = conf[`${PLUS}_${PROMO_MODAL_LAST_SEEN}`];
		return (lastSeenTime !== null);
	}

	static isTimeForAPlusPromo() { return this._isTimeForAPromo(PLUS); }

	static isTimeForInsightsPromo() { return this._isTimeForAPromo(INSIGHTS); }

	static recordPlusPromoSighting() { this._recordPromoSighting(PLUS); }

	static recordInsightsPromoSighting() { this._recordPromoSighting(INSIGHTS); }

	static _isTimeForAPromo(type) {
		const lastSeenPlusPromo = conf[`${PLUS}_${PROMO_MODAL_LAST_SEEN}`];
		const lastSeenInsightsPromo = conf[`${INSIGHTS}_${PROMO_MODAL_LAST_SEEN}`];
		const lastSeenPromo = Math.max(lastSeenPlusPromo, lastSeenInsightsPromo);

		if (conf.notify_promotions === false) { return false; }
		if (lastSeenPromo === null) { return true; }

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
		const { engaged_daily_velocity_with_repeats } = conf.metrics;
		const pastSevenDays = Array.from(new Set(engaged_daily_velocity_with_repeats));
		let timesPerWeek = 0;

		for (let i = 0; i < pastSevenDays.length; i++) {
			const engagementsEachDay = engaged_daily_velocity_with_repeats.filter(day => day === pastSevenDays[i]).length;
			if (engagementsEachDay >= 3) {
				timesPerWeek++;
			}
		}

		if (timesPerWeek >= 3) {
			return true;
		}
		return false;
	}
}

// the class is simply a namespace for some static methods,
// as we do not need to maintain any state
export default PromoModals;
