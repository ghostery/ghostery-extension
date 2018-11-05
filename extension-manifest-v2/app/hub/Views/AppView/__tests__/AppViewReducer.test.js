/**
 * App View Test Reducer
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

import Immutable from 'seamless-immutable';
import AppViewReducer from '../AppViewReducer';
import { SET_TOAST } from '../AppViewConstants';

// Copied from App View Container Default Props
const initialState = Immutable({
	app: {
		toastMessage: '',
		toastClass: '',
	},
});

describe('app/hub/Views/AppView reducer', () => {
	test('initial state is correct', () => {
		expect(AppViewReducer(undefined, {})).toEqual({});
	});

	test('reducer correctly handles SET_TOAST', () => {
		const data = {
			toastMessage: 'Test Message',
			toastClass: 'test-class',
		};
		const action = { data, type: SET_TOAST };

		const updatedAppState = Immutable.merge(initialState.app, data);

		expect(AppViewReducer(initialState, action)).toEqual({
			app: updatedAppState
		});
	});
});
