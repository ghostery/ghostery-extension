/**
 * Home View Action creators
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
import { GET_HOME_PROPS, SET_METRICS } from './HomeViewConstants';

export function getHomeProps() {
	return function (dispatch) {
		return sendMessageInPromise(GET_HOME_PROPS).then((data) => {
			dispatch({
				type: GET_HOME_PROPS,
				data,
			});
		}).catch((err) => {
			log('homeView Action getHomeProps Error', err);
		});
	};
}

export function setMetrics(actionData) {
	return function (dispatch) {
		return sendMessageInPromise(SET_METRICS, actionData).then((data) => {
			dispatch({
				type: SET_METRICS,
				data,
			});
		}).catch((err) => {
			log('homeView Action setMetrics Error', err);
		});
	};
}
