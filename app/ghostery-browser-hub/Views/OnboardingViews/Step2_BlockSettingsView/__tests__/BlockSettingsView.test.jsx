/**
 * BlockSettings View Test Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2020 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router';
import BlockSettingsView from '../BlockSettingsView';

const noop = () => {};

describe('app/ghostery-browser-hub/Views/OnboardingViews/Step2_BlockSettingsView/BlockSettingsView.test.jsx', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('BlockSettings View is rendered correctly', () => {
			const initialState = {
				recommendedChoices: false,
				blockAds: null,
				kindsOfTrackers: null,
				antiTracking: null,
				smartBrowsing: null,
				actions: {
					setAntiTracking: noop,
					setAdBlock: noop,
					setSmartBlocking: noop,
					setBlockingPolicy: noop,
					setToast: noop,
					setSetupStep: noop,
				}
			};
			const component = renderer.create(
				<MemoryRouter>
					<BlockSettingsView  {...initialState} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});
});
