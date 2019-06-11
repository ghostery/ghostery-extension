/**
 * Tutorial Layout View Test Component
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
import TutorialLayoutView from '../TutorialLayoutView';

describe('app/hub/Views/TutorialViews/TutorialLayoutView component', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('tutorial layout view is rendered correctly', () => {
			const component = renderer.create(<TutorialLayoutView />).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('the happy path of the component', () => {
			const component = shallow(<TutorialLayoutView />);
			expect(component.find('.TutorialLayoutView').length).toBe(1);
			expect(component.find('.TutorialLayoutView__image').length).toBe(2);
		});
	});
});
