/**
 * Rewards Action creators
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
	UPDATE_REWARDS_DATA,
	TOGGLE_OFFERS_ENABLED,
	REMOVE_OFFER,
	SET_OFFER_READ,
	SEND_SIGNAL
} from '../constants/constants';

/**
 * Store rewards data fetched from background
 * @param	{Object}	data
 * @return	{Object}
 */
export function updateRewardsData(data) {
	return {
		type: UPDATE_REWARDS_DATA,
		data
	};
}

/**
* Toggles Rewards on/off
* @param  {Boolean} enabled Whether offers should be enabled or not.
* @return {Object}
*/
export function toggleOffersEnabled(enabled) {
	return {
		type: TOGGLE_OFFERS_ENABLED,
		data: { enabled },
	};
}

/**
 * Removes a reward from the rewards list
 * @param  {String} id The ID of the reward we want to remove.
 * @return {Object}
 */
export function removeOffer(id) {
	return {
		type: REMOVE_OFFER,
		data: { id }
	};
}

/**
 * Sets the unread status of an offer to false
 * @param  {String} id the ID of the reward we want to update.
 * @return {Object}
 */
export function setOfferRead(id) {
	return {
		type: SET_OFFER_READ,
		data: { id }
	};
}

// TODO the reducer calls getRewardMessage
// determine whether it would be better to simply call getRewardMessage directly where sendSignal is called
// (both since reducers are not supposed to have side effects and also because...why the extra complexity?)
/**
 * Sends a Signal to the Cliqz Offers
 * @param  {String} actionId the action id of the signal
 * @param  {String} offerId  the offer id to be sent alongside the signal, sometimes
 * @return {Object}
 */
export function sendSignal(actionId, offerId) {
	const signal = {
		type: SEND_SIGNAL,
		data: {
			actionId,
			offerId,
			origin: 'rewards-hub',
			type: offerId ? 'offer-action-signal' : 'action-signal'
		}
	};
	return signal;
}
