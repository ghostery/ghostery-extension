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

const DAYS_BETWEEN_PROMOS = {
	plus: 30
};
const MSECS_IN_DAY = 1000 * 60 * 60 * 24; // msecs-in-sec * secs-in-min * mins-in-hour * hours-in-day

const PLUS = 'plus';
const PROMO_MODAL_LAST_SEEN = 'promo_modal_last_seen';

/**
 * Class for handling the business logic for the display of promo modals (Plus, Insights, etc...)
 * @memberOf  BackgroundClasses
 */
class PromoModals {
	haveSeenAPlusPromo() { return this._haveSeenAPromo(PLUS); }

	isTimeForAPlusPromo() { return this._isTimeForAPromo(PLUS); }

	recordPlusPromoSighting() { this._recordPromoSighting(PLUS); }

	_haveSeenAPromo(type) {
		const lastSeenTime = conf[`${type}_${PROMO_MODAL_LAST_SEEN}`];
		return (lastSeenTime !== null);
	}

	_isTimeForAPromo(type) {
		const lastSeenTime = conf[`${type}_${PROMO_MODAL_LAST_SEEN}`];

		if (lastSeenTime === null) { return true; }

		return (
			(Date.now() - lastSeenTime) >
			(MSECS_IN_DAY * DAYS_BETWEEN_PROMOS[type])
		);
	}

	_recordPromoSighting(type) {
		conf[`${type}_${PROMO_MODAL_LAST_SEEN}`] = Date.now();
	}
}

// return the class as a singleton
export default new PromoModals();
