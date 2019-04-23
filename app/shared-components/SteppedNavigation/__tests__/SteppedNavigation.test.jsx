/**
 * Stepped Navigation Test Component
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

import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import { MemoryRouter } from 'react-router';
import SteppedNavigation from '../SteppedNavigation';
import ExitButton from '../../ExitButton';

describe('app/shared-components/SteppedNavigation', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('stepped navigation is rendered correctly on first step', () => {
			const initialState = {
				totalSteps: 6,
				activeIndex: 1,
				hrefPrev: false,
				hrefNext: '/test/2',
				hrefDone: '/',
				textPrev: false,
				textNext: 'Next',
				textDone: 'Exit',
			};
			const component = renderer.create(
				<MemoryRouter>
					<SteppedNavigation {...initialState} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('stepped navigation is rendered correctly on second step', () => {
			const initialState = {
				totalSteps: 3,
				activeIndex: 2,
				hrefPrev: '/test/1',
				hrefNext: '/test/3',
				hrefDone: '/more-examples',
				textPrev: 'Previous',
				textNext: 'Foreward',
				textDone: 'Leave',
			};
			const component = renderer.create(
				<MemoryRouter>
					<SteppedNavigation {...initialState} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('stepped navigation is rendered correctly on last step', () => {
			const initialState = {
				totalSteps: 3,
				activeIndex: 3,
				hrefPrev: '/test/2',
				hrefNext: false,
				hrefDone: false,
				textPrev: 'Back',
				textNext: 'Not Shown',
				textDone: 'Also Not Shown',
			};

			const component = renderer.create(
				<MemoryRouter>
					<SteppedNavigation {...initialState} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('More Snapshot tests with react-test-renderer, but for edge cases', () => {
		test('edge case where activeIndex beyond totalSteps', () => {
			const initialState = {
				totalSteps: 3,
				activeIndex: 4,
				hrefPrev: '/test/1',
				hrefNext: '/',
				hrefDone: false,
				textPrev: 'Beginning',
				textNext: 'Exit',
				textDone: 'Not Shown',
			};
			const component = renderer.create(
				<MemoryRouter>
					<SteppedNavigation {...initialState} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('edge case where hrefDone is set but textDone is not', () => {
			const initialState = {
				totalSteps: 3,
				activeIndex: 1,
				hrefPrev: false,
				hrefNext: '/step/2',
				hrefDone: '/',
				textPrev: 'Not Shown',
				textNext: 'Next',
				textDone: false,
			};
			const component = renderer.create(
				<MemoryRouter>
					<SteppedNavigation {...initialState} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('the happy path of the component', () => {
			const initialState = {
				totalSteps: 3,
				activeIndex: 1,
				hrefPrev: false,
				hrefNext: '/test/2',
				hrefDone: '/',
				textPrev: false,
				textNext: 'Next',
				textDone: 'Exit',
			};

			const component = shallow(<SteppedNavigation {...initialState} />);
			expect(component.find(ExitButton).length).toBe(1);
			expect(component.find('.SteppedNavigation__buttonContainer').length).toBe(2);
			expect(component.find('.SteppedNavigation__buttonContainer .button').length).toBe(1);
			expect(component.find('.SteppedNavigation__circles NavLink').length).toBe(2);
			expect(component.find('.SteppedNavigation__circles a.active').length).toBe(1);

			component.setProps({
				activeIndex: 2,
				hrefPrev: '/test/1',
				hrefNext: '/test/3',
				textPrev: 'Back',
			});
			expect(component.find(ExitButton).length).toBe(1);
			expect(component.find('.SteppedNavigation__buttonContainer').length).toBe(2);
			expect(component.find('.SteppedNavigation__buttonContainer .button').length).toBe(2);
			expect(component.find('.SteppedNavigation__circles NavLink').length).toBe(2);
			expect(component.find('.SteppedNavigation__circles a.active').length).toBe(1);

			component.setProps({
				activeIndex: 3,
				hrefPrev: '/test/2',
				hrefNext: '/',
				hrefDone: false,
				textNext: 'Done',
				textDone: false,
			});
			expect(component.find(ExitButton).length).toBe(0);
			expect(component.find('.SteppedNavigation__buttonContainer').length).toBe(2);
			expect(component.find('.SteppedNavigation__buttonContainer .button').length).toBe(2);
			expect(component.find('.SteppedNavigation__circles NavLink').length).toBe(2);
			expect(component.find('.SteppedNavigation__circles a.active').length).toBe(1);
		});

		test('the edge cases of the component', () => {
			const initialState = {
				totalSteps: 3,
				activeIndex: 1,
				hrefPrev: false,
				hrefNext: '/test/2',
				hrefDone: '/',
				textPrev: false,
				textNext: 'Next',
				textDone: 'Exit',
			};

			// Happy State
			const component = shallow(<SteppedNavigation {...initialState} />);
			expect(component.find(ExitButton).length).toBe(1);
			expect(component.find('.SteppedNavigation__buttonContainer').length).toBe(2);
			expect(component.find('.SteppedNavigation__buttonContainer .button').length).toBe(1);
			expect(component.find('.SteppedNavigation__circles NavLink').length).toBe(2);
			expect(component.find('.SteppedNavigation__circles a.active').length).toBe(1);

			// Edge Case: activeIndex greater than the number of totalSteps
			component.setProps({
				activeIndex: 4,
				hrefPrev: '/test/1',
				hrefNext: '/',
				textPrev: 'Beginning',
				textNext: 'Exit',
			});
			expect(component.find(ExitButton).length).toBe(1);
			expect(component.find('.SteppedNavigation__buttonContainer').length).toBe(2);
			expect(component.find('.SteppedNavigation__buttonContainer .button').length).toBe(2);
			expect(component.find('.SteppedNavigation__circles NavLink').length).toBe(3);
			expect(component.find('.SteppedNavigation__circles a.active').length).toBe(0);

			// Edge Case: textDone is false
			component.setProps({ textDone: false });
			expect(component.find(ExitButton).length).toBe(1);
			expect(component.find('.SteppedNavigation__buttonContainer').length).toBe(2);
			expect(component.find('.SteppedNavigation__buttonContainer .button').length).toBe(2);
			expect(component.find('.SteppedNavigation__circles NavLink').length).toBe(3);
			expect(component.find('.SteppedNavigation__circles a.active').length).toBe(0);

			// Edge Case: hrefDone and textDone are false
			component.setProps({ hrefDone: false });
			expect(component.find(ExitButton).length).toBe(0);
			expect(component.find('.SteppedNavigation__buttonContainer').length).toBe(2);
			expect(component.find('.SteppedNavigation__buttonContainer .button').length).toBe(2);
			expect(component.find('.SteppedNavigation__circles NavLink').length).toBe(3);
			expect(component.find('.SteppedNavigation__circles a.active').length).toBe(0);
		});
	});
});
