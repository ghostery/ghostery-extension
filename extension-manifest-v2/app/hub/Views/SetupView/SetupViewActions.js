/**
 * Setup View Action creators
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

import { log, sendMessageInPromise } from '../../utils';
import {
	GET_SETUP_SHOW_WARNING_OVERRIDE,
	SET_SETUP_SHOW_WARNING_OVERRIDE,
	INIT_SETUP_PROPS,
	SET_SETUP_NAVIGATION
} from './SetupViewConstants';

export function getSetupShowWarningOverride() {
	return function (dispatch) {
		return sendMessageInPromise(GET_SETUP_SHOW_WARNING_OVERRIDE).then((data) => {
			dispatch({
				type: GET_SETUP_SHOW_WARNING_OVERRIDE,
				data,
			});

			// Send data back to SetupViewContainer
			return data;
		}).catch((err) => {
			log('setupView Action getSetupShowWarningOverride Error', err);
		});
	};
}

export function setSetupShowWarningOverride(actionData) {
	return function (dispatch) {
		return sendMessageInPromise(SET_SETUP_SHOW_WARNING_OVERRIDE, actionData).then((data) => {
			dispatch({
				type: SET_SETUP_SHOW_WARNING_OVERRIDE,
				data,
			});
		}).catch((err) => {
			log('setupView Action setSetupShowWarningOverride Error', err);
		});
	};
}

export function initSetupProps(data) {
	return {
		type: INIT_SETUP_PROPS,
		data,
	};
}

export function setSetupNavigation(data) {
	return {
		type: SET_SETUP_NAVIGATION,
		data,
	};
}
