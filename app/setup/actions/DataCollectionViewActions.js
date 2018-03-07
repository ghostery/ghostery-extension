/**
 * Data Collection View Action creators
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

import { UPDATE_DATA_COLLECTION } from '../constants/constants';

/**
 * Called from DataCollectionView.componentDidMount() and DataCollectionView._handleDataCollection()
 * @param  {Boolean} data
 * @return {Object}
 * @memberof SetupActions
 */
export function updateDataCollection(data) {
	return {
		type: UPDATE_DATA_COLLECTION,
		data,
	};
}
