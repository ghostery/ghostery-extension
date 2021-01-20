/**
 * Welcome View Test Component
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

import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router';
import WelcomeView from '../WelcomeView';

const noop = () => {};

describe('app/ghostery-browser-hub/Views/OnboardingViews/Step0_WelcomeView/WelcomeView.test.jsx', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('Welcome View is rendered correctly', () => {
			const initialState = {
				actions: {
					setSetupStep: noop
				}
			};
			const component = renderer.create(
				<MemoryRouter>
					<WelcomeView  {...initialState} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});
});
