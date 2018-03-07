/**
 * Blocking View Action creators
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
	UPDATE_BLOCK_ALL,
	UPDATE_BLOCK_NONE,
	UPDATE_BLOCK_ADS,
	UPDATE_BLOCK_CUSTOM
} from '../constants/constants';

/**
* Called from BlockingView._save()
 * @return {Object}
 * @memberof SetupActions
 */
export function blockAll() {
	return {
		type: UPDATE_BLOCK_ALL,
	};
}

/**
 * Called from BlockingView._save()
 * @memberof SetupActions
 * @return {Object}
 */
export function blockNone() {
	return {
		type: UPDATE_BLOCK_NONE,
	};
}

/**
 * Called from BlockingView._save()
 * @return {Object}
 * @memberof SetupActions
 */
export function blockAds() {
	return {
		type: UPDATE_BLOCK_ADS,
	};
}

/**
 * Called from BlockingView._save()
 * @return {Object}
 * @memberof SetupActions
 */
export function blockCustom() {
	return {
		type: UPDATE_BLOCK_CUSTOM,
	};
}
