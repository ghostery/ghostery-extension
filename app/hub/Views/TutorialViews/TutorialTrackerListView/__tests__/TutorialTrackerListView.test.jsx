/**
 * Tutorial Tracker List View Test Component
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
import TutorialTrackerListView from '../TutorialTrackerListView';

describe('app/hub/Views/TutorialViews/TutorialTrackerListView component', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('tutorial tracker list view is rendered correctly', () => {
			const component = renderer.create(<TutorialTrackerListView />).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('the happy path of the component', () => {
			const component = shallow(<TutorialTrackerListView />);
			expect(component.find('.TutorialTrackerListView').length).toBe(1);
			expect(component.find('.TutorialTrackerListView__image').length).toBe(1);
		});
	});
});
