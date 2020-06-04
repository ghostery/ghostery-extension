/**
 * Reducer used in the App View
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

import { SET_TOAST } from './AppViewConstants';

const initialState = {};

function AppViewReducer(state = initialState, action) {
	switch (action.type) {
		case SET_TOAST: {
			const { toastMessage, toastClass } = action.data;
			return {
				...state,
				app: {
					toastMessage,
					toastClass
				}
			};
		}
		default: return state;
	}
}

export default AppViewReducer;
