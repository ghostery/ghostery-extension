/**
 * Setup Blocking View Action creators
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

import { log, sendMessageInPromise } from '../../../utils';
import { SET_BLOCKING_POLICY } from '../../SetupView/SetupViewConstants';

export function setBlockingPolicy(actionData) {
	return function (dispatch) {
		return sendMessageInPromise(SET_BLOCKING_POLICY, actionData).then((data) => {
			dispatch({
				type: SET_BLOCKING_POLICY,
				data,
			});
		}).catch((err) => {
			log('setupBlocking Action setBlockingPolicy Error', err);
		});
	};
}
