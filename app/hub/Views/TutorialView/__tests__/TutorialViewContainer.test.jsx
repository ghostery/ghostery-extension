/**
 * Tutorial View Container Test Component
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
import { MemoryRouter } from 'react-router';

// Mock Necessary Imports
jest.mock('../../TutorialViews/TutorialVideoView', () => props => <div>Mock Tutorial Video View</div>);
jest.mock('../../TutorialViews/TutorialTrackerListView', () => props => <div>Mock Tutorial Tracker List View</div>);
jest.mock('../../TutorialViews/TutorialBlockingView', () => props => <div>Mock Tutorial Blocking View</div>);
jest.mock('../../TutorialViews/TutorialLayoutView', () => props => <div>Mock Tutorial Layout View</div>);
jest.mock('../../TutorialViews/TutorialTrustView', () => props => <div>Mock Tutorial Trust View</div>);
jest.mock('../../TutorialViews/TutorialAntiSuiteView', () => props => <div>Mock Tutorial Anti Suite View</div>);
jest.mock('../../TutorialViews/TutorialNavigation', () => props => <div>Mock Tutorial Navigation View</div>);

// Import Components
import TutorialViewContainer from '../TutorialViewContainer';

// Fake Actions
const actions = {
	initTutorialProps: () => {
		return new Promise((resolve) => {
			resolve();
		});
	},
	setTutorialNavigation: () => {},
};

describe('app/hub/Views/TutorialView container', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('tutorial view container is rendered correctly on the tutorial video step', () => {
			const paths = ['/tutorial/1', '/tutorial/2', '/tutorial/3', '/tutorial/4', '/tutorial/5', '/tutorial/6'];
			const component = renderer.create(
				<MemoryRouter initialEntries={paths} initialIndex={0} >
					<TutorialViewContainer actions={actions} preventRedirect={true} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('tutorial view container is rendered correctly on the tutorial tracker list step', () => {
			const paths = ['/tutorial/1', '/tutorial/2', '/tutorial/3', '/tutorial/4', '/tutorial/5', '/tutorial/6'];
			const component = renderer.create(
				<MemoryRouter initialEntries={paths} initialIndex={1} >
					<TutorialViewContainer actions={actions} preventRedirect={true} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('tutorial view container is rendered correctly on the tutorial blocking step', () => {
			const paths = ['/tutorial/1', '/tutorial/2', '/tutorial/3', '/tutorial/4', '/tutorial/5', '/tutorial/6'];
			const component = renderer.create(
				<MemoryRouter initialEntries={paths} initialIndex={2} >
					<TutorialViewContainer actions={actions} preventRedirect={true} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('tutorial view container is rendered correctly on the tutorial layout step', () => {
			const paths = ['/tutorial/1', '/tutorial/2', '/tutorial/3', '/tutorial/4', '/tutorial/5', '/tutorial/6'];
			const component = renderer.create(
				<MemoryRouter initialEntries={paths} initialIndex={3} >
					<TutorialViewContainer actions={actions} preventRedirect={true} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('tutorial view container is rendered correctly on the tutorial trust and restrict step', () => {
			const paths = ['/tutorial/1', '/tutorial/2', '/tutorial/3', '/tutorial/4', '/tutorial/5', '/tutorial/6'];
			const component = renderer.create(
				<MemoryRouter initialEntries={paths} initialIndex={4} >
					<TutorialViewContainer actions={actions} preventRedirect={true} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('tutorial view container is rendered correctly on the tutorial anti suite step', () => {
			const paths = ['/tutorial/1', '/tutorial/2', '/tutorial/3', '/tutorial/4', '/tutorial/5', '/tutorial/6'];
			const component = renderer.create(
				<MemoryRouter initialEntries={paths} initialIndex={5} >
					<TutorialViewContainer actions={actions} preventRedirect={true} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});
});
