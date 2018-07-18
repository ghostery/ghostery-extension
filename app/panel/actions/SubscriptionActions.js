/**
 * Subscription Action creators
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
	GET_SUBSCRIPTION_DATA
} from '../constants/constants';
import { sendMessageInPromise } from '../utils/msg';

/**
 * Fetch subscription data from background
 * @return {Object} dispatch
 */
export function getSubscriptionData() {
	return function (dispatch) {
		return sendMessageInPromise('getPanelData', {
			view: 'subscription',
		}).then((data) => {
			dispatch({
				type: GET_SUBSCRIPTION_DATA,
				data,
			});
		});
	};
}
