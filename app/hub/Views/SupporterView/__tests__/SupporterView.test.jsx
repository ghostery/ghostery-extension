/**
 * Supporter View Test Component
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
import SupporterView from '../SupporterView';

describe('app/hub/Views/SupporterView component', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('rewards view is rendered correctly', () => {
			const component = renderer.create(
				<SupporterView />
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('the happy path of the component', () => {
			const component = shallow(<SupporterView />);
			expect(component.find('.SupporterView').length).toBe(1);
			expect(component.find('.button').length).toBe(4);
			expect(component.find('.SupporterView__perkFeature').length).toBe(3);
			expect(component.find('.SupporterView__title').length).toBe(4);
			expect(component.find('.SupporterView__description').length).toBe(4);
		});
	});
});
