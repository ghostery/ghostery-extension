/**
 * Modal Test Component
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
import Modal from '../Modal';

describe('app/shared-components/Modal component', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('modal is rendered correctly when shown', () => {
			const initialState = {
				show: true,
				toggle: () => {},
			};

			const component = renderer.create(
				<Modal {...initialState}>
					<div>Example Child</div>
				</Modal>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('modal is rendered correctly when not shown', () => {
			const initialState = {
				show: false,
				toggle: () => {},
			};

			const component = renderer.create(
				<Modal {...initialState}>
					<div>Example Child</div>
				</Modal>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('modal toggle is not required', () => {
			const initialState = {
				show: false,
			};

			const component = renderer.create(
				<Modal {...initialState}>
					<div>Example Child</div>
				</Modal>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('the happy path of the component', () => {
			const initialState = {
				show: false,
				toggle: jest.fn(),
			};

			const component = shallow(
				<Modal {...initialState}>
					<div>Example Child</div>
				</Modal>
			);
			expect(component.find('.Modal').length).toBe(1);
			expect(component.find('.Modal__background').length).toBe(0);
			expect(component.find('.Modal__container').length).toBe(0);

			component.setProps({ show: true });
			expect(component.find('.Modal').length).toBe(1);
			expect(component.find('.Modal__background').length).toBe(1);
			expect(component.find('.Modal__container').length).toBe(1);
			expect(component.find('.Modal__background').prop('onClick')).toBeTruthy();

			expect(initialState.toggle.mock.calls.length).toBe(0);
			component.find('.Modal__background').simulate('click');
			expect(initialState.toggle.mock.calls.length).toBe(1);
		});

		test('the happy path of the component when toggle not defined', () => {
			const initialState = {
				show: false,
			};

			const component = shallow(
				<Modal {...initialState}>
					<div>Example Child</div>
				</Modal>
			);
			expect(component.find('.Modal').length).toBe(1);
			expect(component.find('.Modal__background').length).toBe(0);
			expect(component.find('.Modal__container').length).toBe(0);

			component.setProps({ show: true });
			expect(component.find('.Modal').length).toBe(1);
			expect(component.find('.Modal__background').length).toBe(1);
			expect(component.find('.Modal__container').length).toBe(1);
			expect(component.find('.Modal__background').prop('onClick')).toBeFalsy();


		});
	});
});
