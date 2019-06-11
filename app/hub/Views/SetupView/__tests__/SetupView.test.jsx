/**
 * Setup View Test Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2019 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 *
 * ToDo: Update this file with Integration tests using Enzyme
 */

import React from 'react';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router';

// Mock Necessary Imports
jest.mock('../../SetupViews/SetupHeader', () => props => <div>Mock Setup Header</div>);
jest.mock('../../SetupViews/SetupNavigation', () => props => <div>Mock Setup Navigation</div>);

// Import Components
import SetupView from '../SetupView';

// Mock Test Component
const TestComponent = props => (
	<div>test component</div>
);
const ExampleComponent = props => (
	<div>example component</div>
);

describe('app/hub/Views/SetupView component', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('setup view is rendered correctly on first route', () => {
			const initialState = {
				steps: [
					{
						index: 1,
						path: '/test/1',
						bodyComponent: TestComponent,
						headerProps: {
							title: 'title test 1',
							titleImage: 'image for title test 1',
						}
					},
					{
						index: 2,
						path: '/test/2',
						bodyComponent: TestComponent,
						headerProps: {
							title: 'title test 2',
							titleImage: 'image for title test 2',
						}
					},
				],
				extraRoutes: [],
				sendMountActions: true,
			};
			const component = renderer.create(
				<MemoryRouter initialEntries={['/test/1']} >
					<SetupView {...initialState} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('setup view is rendered correctly on first and extra route', () => {
			const initialState = {
				steps: [
					{
						index: 1,
						path: '/test/1',
						bodyComponent: TestComponent,
						headerProps: {
							title: 'title test 1',
							titleImage: 'image for title test 1',
						}
					},
					{
						index: 2,
						path: '/test/2',
						bodyComponent: TestComponent,
						headerProps: {
							title: 'title test 2',
							titleImage: 'image for title test 2',
						}
					},
				],
				extraRoutes: [
					{
						name: '1/example',
						path: '/test/1/example',
						component: ExampleComponent,
					}
				],
				sendMountActions: true,
			};
			const component = renderer.create(
				<MemoryRouter initialEntries={['/test/1/example']} >
					<SetupView {...initialState} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('setup view is rendered correctly on last route', () => {
			const initialState = {
				steps: [
					{
						index: 1,
						path: '/example/1',
						bodyComponent: TestComponent,
						headerProps: {
							title: 'title example 1',
							titleImage: 'image for title example 1',
						}
					},
					{
						index: 2,
						path: '/example/2',
						bodyComponent: TestComponent,
						headerProps: {
							title: 'title example 2',
							titleImage: 'image for title example 2',
						}
					},
					{
						index: 3,
						path: '/example/3',
						bodyComponent: TestComponent,
						headerProps: {
							title: 'title example 3',
							titleImage: 'image for title example 3',
						}
					},
				],
				extraRoutes: [],
				sendMountActions: true,
			};
			const component = renderer.create(
				<MemoryRouter initialEntries={['/example/3']} >
					<SetupView {...initialState} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('More Snapshot tests with react-test-renderer, but for edge cases', () => {
		test('edge case where steps is empty array', () => {
			const initialState = {
				steps: [],
				extraRoutes: [],
				sendMountActions: true,
			};
			const component = renderer.create(
				<MemoryRouter>
					<SetupView {...initialState} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('edge case where activeIndex not in steps index', () => {
			const initialState = {
				steps: [
					{
						index: 1,
						path: '/test/1',
						bodyComponent: TestComponent,
						headerProps: {
							title: 'title test 1',
							titleImage: 'image for title test 1',
						}
					},
					{
						index: 2,
						path: '/test/2',
						bodyComponent: TestComponent,
						headerProps: {
							title: 'title test 2',
							titleImage: 'image for title test 2',
						}
					},
				],
				extraRoutes: [],
				sendMountActions: true,
			};
			const component = renderer.create(
				<MemoryRouter initialEntries={['/test/4']} >
					<SetupView {...initialState} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Mount snapshot tests rendered with Enzyme', () => {
		test.skip('the happy path of the component', () => {});

		test.skip('the non-happy path of the component', () => {});
	});
});
