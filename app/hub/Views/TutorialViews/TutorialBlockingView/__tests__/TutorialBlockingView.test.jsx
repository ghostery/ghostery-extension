/**
 * Tutorial Blocking View Test Component
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
import TutorialBlockingView from '../TutorialBlockingView';

describe('app/hub/Views/TutorialViews/TutorialBlockingView component', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('tutorial blocking view is rendered correctly', () => {
			const component = renderer.create(<TutorialBlockingView />).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('the happy path of the component', () => {
			const component = shallow(<TutorialBlockingView />);
			expect(component.find('.TutorialBlockingView').length).toBe(1);
			expect(component.find('.TutorialBlockingView__image').length).toBe(2);
			expect(component.find('.TutorialView__keyText').length).toBe(3);
		});
	});
});
