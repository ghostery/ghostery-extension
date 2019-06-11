/**
 * App View Action creators
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

import { log, sendMessageInPromise } from '../../utils';
import { SET_TOAST, SEND_PING } from './AppViewConstants';

export function setToast(data) {
	return {
		type: SET_TOAST,
		data,
	};
}

export function sendPing(actionData) {
	return function (dispatch) {
		return sendMessageInPromise(SEND_PING, actionData).then((data) => {
			dispatch({
				type: SEND_PING,
				data,
			});
		}).catch((err) => {
			log('appView Action sendPing Error', err);
		});
	};
}
