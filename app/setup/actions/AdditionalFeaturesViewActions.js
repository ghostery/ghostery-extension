/**
 * Additional Features View Action creators
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
/**
 * @namespace SetupActions
 */
import {
	UPDATE_ANTITRACK,
	UPDATE_SMARTBLOCK,
	UPDATE_ADBLOCK
} from '../constants/constants';

/**
 * Called from AdditionalFeaturesView._handleAntiTrack()
 * @param  {Boolean} data
 * @return {Object}
 * @memberof SetupActions
 */
export function updateAntiTrack(data) {
	return {
		type: UPDATE_ANTITRACK,
		data,
	};
}

/**
 * Called from AdditionalFeaturesView._handleSmartBlock()
 * @param  {Boolean} data
 * @return {Object}
 * @memberof SetupActions
 */
export function updateSmartBlock(data) {
	return {
		type: UPDATE_SMARTBLOCK,
		data,
	};
}

/**
 * Called from AdditionalFeaturesView._handleAdBlock()
 * @param  {Boolean} data
 * @return {Object}
 * @memberof SetupActions
 */
export function updateAdBlock(data) {
	return {
		type: UPDATE_ADBLOCK,
		data,
	};
}
