/**
 * Toast Test Reducer
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2021 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import Immutable from 'seamless-immutable';
import ToastReducer from '../ToastReducer';
import SET_TOAST from '../../constants/ToastConstants';

const initialState = Immutable({
	app: {}
});

describe('app/shared-hub/reducers/ToastReducer', () => {
	test('initial state is correct', () => {
		expect(ToastReducer(undefined, {})).toEqual({});
	});

	test('reducer correctly handles SET_TOAST', () => {
		const data = {
			toastMessage: 'Toaster',
			toastClass: 'danger'
		};
		const action = { data, type: SET_TOAST };

		const updatedToastReducerState = Immutable.merge(initialState.app, data);
		expect(ToastReducer(initialState, action)).toEqual({
			app: updatedToastReducerState
		});
	});
});
