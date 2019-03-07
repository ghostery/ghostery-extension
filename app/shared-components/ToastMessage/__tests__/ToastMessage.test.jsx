/**
 * Toast Message Test Component
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
import ToastMessage from '../ToastMessage';

describe('app/shared-components/ToastMessage', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('toast message is rendered correctly', () => {
			const initialState = {
				toastText: 'sample text',
				toastClass: 'test-class',
			};
			const component = renderer.create(
				<ToastMessage {...initialState} />
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('toast message is rendered correctly with a close button', () => {
			const initialState = {
				toastText: 'example text',
				toastClass: 'example-class',
				toastExit: () => {},
			};
			const component = renderer.create(
				<ToastMessage {...initialState} />
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('More Snapshot tests with react-test-renderer, but for edge cases', () => {
		test('edge case where text is empty string', () => {
			const initialState = {
				toastText: '',
				toastClass: 'test-class',
			};
			const component = renderer.create(
				<ToastMessage {...initialState} />
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('the happy path of the component', () => {
			const initialState = {
				toastText: 'sample text',
				toastClass: 'test-class',
				toastExit: jest.fn(),
			};

			const component = shallow(<ToastMessage {...initialState} />);
			expect(component.find('.ToastMessage').length).toBe(1);
			expect(component.find('.callout-container').length).toBe(1);
			expect(component.find('.callout.toast.test-class').length).toBe(1);
			expect(component.find('.callout-text').length).toBe(1);
			expect(component.find('.ToastMessage__close').length).toBe(1);

			expect(initialState.toastExit.mock.calls.length).toBe(0);
			component.find('.ToastMessage__close').simulate('click');
			expect(initialState.toastExit.mock.calls.length).toBe(1);

			component.setProps({ toastExit: false });
			expect(component.find('.ToastMessage__close').length).toBe(0);
		});

		test('the edge cases of the component', () => {
			const initialState = {
				toastText: '',
				toastClass: 'test-class',
			};

			const component = shallow(<ToastMessage {...initialState} />);
			expect(component.find('.ToastMessage').length).toBe(1);
			expect(component.find('.callout-container').length).toBe(0);
			expect(component.find('.callout.toast.test-class').length).toBe(0);
			expect(component.find('.callout-text').length).toBe(0);
		});
	});
});
