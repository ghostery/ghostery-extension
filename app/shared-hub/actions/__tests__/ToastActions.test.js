/**
 * Test file for Toast Actions
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

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import setToast from '../ToastActions';
import SET_TOAST from '../../constants/ToastConstants'

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

const testData = { test: true };

describe('app/shared-hub/actions/ToastActions', () => {
	test('setToast action should return correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);

		const data = testData;
		const expectedPayload = { data, type: SET_TOAST };
		store.dispatch(setToast(testData));
		const actions = store.getActions();
		expect(actions).toEqual([expectedPayload]);
	});
});
