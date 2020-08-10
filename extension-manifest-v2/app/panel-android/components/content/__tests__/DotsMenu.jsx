/**
 * DotsMenu Test Component
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
import { mount } from 'enzyme';
import DotsMenu from '../DotsMenu';

describe('app/panel-android/components/content/DotsMenu.jsx', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('DotsMenu component with 0 actions', () => {
			const actions = [];
			const component = renderer.create(
				<DotsMenu actions={actions} />
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('DotsMenu component with 3 actions', () => {
			const actions = [
				{
					id: 'action-1',
					name: 'Action One',
					callback: () => {},
				},
				{
					id: 'action-2',
					name: 'Action Two',
					callback: () => {},
				},
				{
					id: 'action-3',
					name: 'Action Three',
					callback: () => {},
				}
			];

			const component = renderer.create(
				<DotsMenu actions={actions} />
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Functionality tests mounted with Enzyme', () => {
		test('DotsMenu component with 3 actions happy path', () => {
			const actions = [
				{
					id: 'action-1',
					name: 'Action One',
					callback: jest.fn(),
				},
				{
					id: 'action-2',
					name: 'Action Two',
					callback: jest.fn(),
				},
				{
					id: 'action-3',
					name: 'Action Three',
					callback: jest.fn(),
				}
			];

			const component = mount(
				<DotsMenu actions={actions} />
			);
			expect(component.find('.DotsMenu').length).toBe(1);
			expect(component.find('.DotsMenu__button').length).toBe(1);
			expect(component.find('.DotsMenu__content').length).toBe(1);
			expect(component.find('.DotsMenu__content.DotsMenu__open').length).toBe(0);
			expect(component.find('.DotsMenu__item').length).toBe(3);

			component.setState({ open: true });
			expect(component.find('.DotsMenu__content.DotsMenu__open').length).toBe(1);
			expect(component.find('.DotsMenu__item').length).toBe(3);
			expect(actions[0].callback.mock.calls.length).toBe(0);
			expect(actions[1].callback.mock.calls.length).toBe(0);
			expect(actions[2].callback.mock.calls.length).toBe(0);
			component.find('.DotsMenu__item').at(0).simulate('click');
			expect(actions[0].callback.mock.calls.length).toBe(1);
			component.find('.DotsMenu__item').at(1).simulate('click');
			expect(actions[1].callback.mock.calls.length).toBe(1);
			component.find('.DotsMenu__item').at(2).simulate('click');
			expect(actions[0].callback.mock.calls.length).toBe(1);
			expect(actions[1].callback.mock.calls.length).toBe(1);
			expect(actions[2].callback.mock.calls.length).toBe(1);

			component.setState({ open: false });
			expect(component.find('.DotsMenu__content.DotsMenu__open').length).toBe(0);
			expect(component.find('.DotsMenu__item').length).toBe(3);
		});
	});
});
