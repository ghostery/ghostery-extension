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
	plus: globals.DEBUG ? 0.0005 : 30 // 40 seconds on staging
};
const WEEKLY_INSIGHTS_TARGET = globals.DEBUG ? 1 : 3;
const DAILY_INSIGHTS_TARGET = globals.DEBUG ? 7 : 3;

const MSECS_IN_DAY = 86400000; // 1000 msecs-in-sec * 60 secs-in-min * 60 mins-in-hour * 24 hours-in-day
const PREMIUM = 'premium';
const INSIGHTS = 'insights';
const PLUS = 'plus';
const PROMO_MODAL_LAST_SEEN = 'promo_modal_last_seen';

const PRIORITY_ORDERED_ACTIVE_MODALS = [INSIGHTS, PREMIUM];

/**
 * Static 'namespace' class for handling the business logic for the display of promo modals (Premium, Insights, etc...)
 * @memberOf  BackgroundClasses
 */
class PromoModals {
	/**
	 * Tracks which promo modal, if any, should be FORCED to trigger
	 * at moments when a promo modal MIGHT trigger.
	 * Originally intended to facilitate QA of modal UI
	 * @type {string}
	 */
	static forcedModalType = '';

	/**
	 * Specify a modal type that should be forced to trigger at the next opportunity
	 * Originally added to facilitate modal UI QA
	 * @param 	{String}	modalType		The modal type to trigger
	 * @return	{String}					Either 'success' or 'failure'
	 */
	static showOnce(modalType) {
		if (
			modalType
			&& typeof modalType === 'string'
			&& PRIORITY_ORDERED_ACTIVE_MODALS.includes(modalType.toLowerCase())
		) {
			PromoModals.forcedModalType = modalType;
			return 'success';
		}

		return 'failure';
	}

	static getActiveModalTypes() {
		return PRIORITY_ORDERED_ACTIVE_MODALS;
	}

	/**
	 * Determine if a modal should be shown.  Called from PanelData
	 * when the panel is opened.
	 *
	 * @return {String|null} Type of promo to show, or null if we should not show a promo
	 */
	static whichPromoModalShouldWeDisplay() {
		if (PRIORITY_ORDERED_ACTIVE_MODALS.includes(PromoModals.forcedModalType)) {
			const type = PromoModals.forcedModalType;
			PromoModals.forcedModalType = '';
			return type;
		}

		// The order is important
		const promoType = PRIORITY_ORDERED_ACTIVE_MODALS.find(poam => this._isTimeForAPromo(poam));
		if (promoType !== undefined) return promoType;
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

		const lastSeenPremiumPromo = conf[`${PREMIUM}_${PROMO_MODAL_LAST_SEEN}`];
		const lastSeenInsightsPromo = conf[`${INSIGHTS}_${PROMO_MODAL_LAST_SEEN}`];
		const lastSeenPromo = Math.max(lastSeenPremiumPromo, lastSeenInsightsPromo);

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
		const { engaged_daily_count = [] } = conf.metrics;

		const very_engaged_days = engaged_daily_count.reduce((acc, count) => (count >= DAILY_INSIGHTS_TARGET ? acc + 1 : acc), 0);

		return very_engaged_days >= WEEKLY_INSIGHTS_TARGET;
	}
}

// the class is simply a namespace for some static methods,
// as we do not need to maintain any state
export default PromoModals;
