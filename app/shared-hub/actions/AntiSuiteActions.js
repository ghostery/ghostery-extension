/**
 * Anti Suite Action Creators for the Hubs to use
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2020 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import { log, sendMessageInPromise } from '../utils';
import {
	SET_ANTI_TRACKING,
	SET_AD_BLOCK,
	SET_SMART_BLOCK
} from '../constants/AntiSuiteConstants';

function _smipFactory(action, actionData) {
	return function(dispatch) {
		return sendMessageInPromise(action, actionData).then((data) => {
			dispatch({
				type: action,
				data,
			});
		}).catch((err) => {
			log(`${action} action creator error`, err);
		});
	};
}

export function setAntiTracking(actionData) {
	return _smipFactory(SET_ANTI_TRACKING, actionData);
}

export function setAdBlock(actionData) {
	return _smipFactory(SET_AD_BLOCK, actionData);
}

export function setSmartBlocking(actionData) {
	return _smipFactory(SET_SMART_BLOCK, actionData);
}
