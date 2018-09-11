/**
 * Exit Button Test Component
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

import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import { MemoryRouter } from 'react-router';
import ExitButton from '../ExitButton';

describe('app/shared-components/ExitButton', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('exit button is rendered correctly', () => {
			const initialState = {
				hrefExit: '/',
				textExit: 'Exit',
			};
			const component = renderer.create(
				<MemoryRouter>
					<ExitButton {...initialState} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('More Snapshot tests with react-test-renderer, but for edge cases', () => {
		test('edge case where text is empty string', () => {
			const initialState = {
				hrefExit: '/test',
				textExit: '',
			};
			const component = renderer.create(
				<MemoryRouter>
					<ExitButton {...initialState} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('edge case where text is false', () => {
			const initialState = {
				hrefExit: '/example',
				textExit: false,
			};
			const component = renderer.create(
				<MemoryRouter>
					<ExitButton {...initialState} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('the happy path of the component', () => {
			const initialState = {
				hrefExit: '/',
				textExit: 'Exit',
			};

			const component = shallow(<ExitButton {...initialState} />);
			expect(component.find('.ExitButton__exit').length).toBe(1);
			expect(component.find('.ExitButton__exitText').length).toBe(1);
			expect(component.find('.ExitButton__exitIcon').length).toBe(1);
		});

		test('the edge cases of the component', () => {
			const initialState = {
				hrefExit: '/',
				textExit: '',
			};

			const component = shallow(<ExitButton {...initialState} />);
			expect(component.find('.ExitButton__exit').length).toBe(1);
			expect(component.find('.ExitButton__exitText').length).toBe(0);
			expect(component.find('.ExitButton__exitIcon').length).toBe(1);

			// Same result when textExit is boolean instead of empty string
			component.setProps({ textExit: false });
			expect(component.find('.ExitButton__exit').length).toBe(1);
			expect(component.find('.ExitButton__exitText').length).toBe(0);
			expect(component.find('.ExitButton__exitIcon').length).toBe(1);
		});
	});
});
