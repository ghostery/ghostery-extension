/**
 * ChoosePlanView Test Component
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
import { shallow } from 'enzyme';
import { MemoryRouter } from 'react-router';
import ChoosePlanView from '../ChoosePlanView';

const noop = () => {};

describe('app/ghostery-browser-hub/Views/OnboardingViews/Step4_ChoosePlanView/ChoosePlanView.test.jsx', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('ChoosePlanView is rendered correctly', () => {
			const initialState = {
				user: null,
				didNotSelectGhosterySearch: false,
				actions: {
					setSetupStep: noop
				}
			};
			const component = renderer.create(
				<MemoryRouter>
					<ChoosePlanView  {...initialState} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('ChoosePlanView View with user not logged in', () => {
			const initialState = {
				user: null,
				didNotSelectGhosterySearch: false,
				actions: {
					setSetupStep: noop
				},
			};

			const component = shallow(<ChoosePlanView {...initialState} />);

			expect(component.find('.ChoosePlanView__card').length).toBe(3);
			const instance = component.instance();

			instance.selectBasicPlan();
			expect(component.state('selectedPlan')).toBe('BASIC');

			instance.selectPlusPlan();
			expect(component.state('selectedPlan')).toBe('PLUS');

			instance.selectPremiumPlan();
			expect(component.state('selectedPlan')).toBe('PREMIUM');

			expect(component).toMatchSnapshot();
		});

		test('ChoosePlanView View with basic user logged in', () => {
			const initialState = {
				user: {
					plusAccess: false,
					premiumAccess: false
				},
				didNotSelectGhosterySearch: false,
				actions: {
					setSetupStep: noop
				},
			};

			const component = shallow(<ChoosePlanView {...initialState} />);

			expect(component.find('.ChoosePlanView__card').length).toBe(3);
			expect(component).toMatchSnapshot();
		});

		test('ChoosePlanView View with plus user logged in', () => {
			const initialState = {
				user: {
					plusAccess: true,
					premiumAccess: false
				},
				didNotSelectGhosterySearch: false,
				actions: {
					setSetupStep: noop
				},
			};

			const component = shallow(<ChoosePlanView {...initialState} />);

			expect(component.find('.ChoosePlanView__card').length).toBe(2);
			expect(component).toMatchSnapshot();
		});

		test('ChoosePlanView View with premium user logged in', () => {
			const initialState = {
				user: {
					plusAccess: true,
					premiumAccess: true
				},
				didNotSelectGhosterySearch: false,
				actions: {
					setSetupStep: noop
				},
			};

			const component = shallow(<ChoosePlanView {...initialState} />);

			expect(component.find('.ChoosePlanView__card').length).toBe(1);
			expect(component).toMatchSnapshot();
		});
	});
});
