/**
 * Test file for Panel Actions
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

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as panelActions from '../PanelActions';
import { TOGGLE_CLIQZ_FEATURE } from '../../constants/constants';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe('app/panel/actions/PanelActions.js', () => {
	test('toggleCliqzFeature action should resolve correctly', () => {
		const initialState = {};
		const store = mockStore(initialState);
		const data = {
			featureName: 'enable_ad_block',
			isEnabled: true
		};
		const expectedPayload = { data, type: TOGGLE_CLIQZ_FEATURE };

		store.dispatch(panelActions.toggleCliqzFeature(data.featureName, data.isEnabled));

		const actions = store.getActions();
		expect(actions).toEqual([expectedPayload]);
	});
});
