/**
 * Rewards Action creators
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2018 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import {
	GET_REWARDS_ACTIVE,
	REMOVE_REWARD_ID,
	SHOW_NOTIFICATION,
	TOGGLE_REWARDS_ACTIVE,
	UPDATE_REWARD
} from '../constants/constants';

/**
 * Fetch active rewards. Will eventually fetch from background during the initial
 * load, but currently fakes an async call by using setTimeout and default datal.
 * @return {Object} dispatch
 */
export function getActiveRewards() {
	return function (dispatch) {
		return new Promise((resolve, reject) => {
			const dateNow = new Date();
			return setTimeout(() => {
				dispatch({
					type: GET_REWARDS_ACTIVE,
					data: [
						{
							id: 0,
							unread: true,
							code: 'MTWAFFEWEREXDF1E',
							text: '2 Free Audio Books',
							description: 'Description of the offer. There is a lot of exciting stuff going on.',
							expires: (new Date()).setDate(dateNow.getDate() + 14),
						},
						{
							id: 1,
							unread: true,
							code: 'MTWAFFEWEREXDF2E',
							text: 'Save $150',
							description: 'Description of the offer. There is a lot of exciting stuff going on.',
							expires: (new Date()).setDate(dateNow.getDate() + 30),
						},
						{
							id: 2,
							unread: true,
							code: 'MTWAFFEWEREXDF3E',
							text: 'Save $75',
							description: 'Description of the offer. There is a lot of exciting stuff going on.',
							expires: (new Date()).setDate(dateNow.getDate() + 60),
						},
					],
				});
			}, 125);
		});
	};
}

/**
 * Removes a reward from the rewards list
 * @param  {Int} id The ID of the reward we want to remove.
 * @return {Object}
 */
export function removeReward(id) {
	return {
		type: REMOVE_REWARD_ID,
		data: { id }
	};
}

/**
 * Toggles Rewards on/off
 * @return {Object}
 */
export function toggleRewardsActive() {
	return {
		type: TOGGLE_REWARDS_ACTIVE
	};
}

/**
 * Updates an existing reward
 * @param {Object} data
 * @return {Object}
 */
export function updateReward(data) {
	return {
		type: UPDATE_REWARD,
		data,
	};
}

/**
 * Display notification messages on Panel (status, needsReload). Also used to persist
 * the needsReload messages if the panel is closed before the page is refreshed.
 * @param  {Object} data
 * @return {Object}
 */
export function showNotification(data) {
	return {
		type: SHOW_NOTIFICATION,
		data,
	};
}
