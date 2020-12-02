/**
 * Anti Suite Action Creators used by Hub's Setup and Ghostery Browser Hub's Onboarding
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
} from '../constants/SetupConstants';

export function setAntiTracking(actionData) {
	return function(dispatch) {
		return sendMessageInPromise(SET_ANTI_TRACKING, actionData).then((data) => {
			dispatch({
				type: SET_ANTI_TRACKING,
				data,
			});
		}).catch((err) => {
			log('setAntiTracking setup action error', err);
		});
	};
}

export function setAdBlock(actionData) {
	return function(dispatch) {
		return sendMessageInPromise(SET_AD_BLOCK, actionData).then((data) => {
			dispatch({
				type: SET_AD_BLOCK,
				data,
			});
		}).catch((err) => {
			log('setAdBlock setup action error', err);
		});
	};
}

export function setSmartBlocking(actionData) {
	return function(dispatch) {
		return sendMessageInPromise(SET_SMART_BLOCK, actionData).then((data) => {
			dispatch({
				type: SET_SMART_BLOCK,
				data,
			});
		}).catch((err) => {
			log('setSmartBlocking setup action error', err);
		});
	};
}
