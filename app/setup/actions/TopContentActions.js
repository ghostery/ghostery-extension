/**
 * Top Content Action creators
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

import { UPDATE_TOP_CONTENT_DATA, SETUP_STEPS } from '../constants/constants';

/**
 * Called from most SubView's updateTopContentData() funciton
 * @param  {Object} data object with Top Content's Image and Header Text
 * @return {Object}
 * @memberof SetupActions
 */
export function updateTopContentData(data) {
	return {
		type: UPDATE_TOP_CONTENT_DATA,
		data,
	};
}

/**
 * Called from SubView's componentWillMount() funciton, and other places
 * @param  {Object} data our location within the setup flow
 * @return {Object}
 * @memberof SetupActions
 */
export function setupStep(data) {
	return {
		type: SETUP_STEPS,
		data,
	};
}
