/**
 * Setup Blocking View Test Component
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
import SetupBlockingView from '../SetupBlockingView';

describe('app/hub/Views/SetupViews/SetupBlockingView component', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('setup blocking view is rendered correctly', () => {
			const initialState = {
				blockingPolicy: 'test',
				choices: [
					{
						name: 'test',
						image: 'choice-test-image',
						text: 'This is your TEST choice',
						description: 'This is your TEST below text',
					},
					{
						name: 'example',
						image: 'choice-example-image',
						text: 'This is your EXAMPLE choice',
						description: 'This is your EXAMPLE below text',
					},
				],
				handleSelection: () => {},
				handleCustomClick: () => {},
			};

			const component = renderer.create(
				<SetupBlockingView {...initialState} />
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('More Snapshot tests with react-test-renderer, but for edge cases', () => {
		test('edge case where choices is an empty array', () => {
			const initialState = {
				blockingPolicy: 'test',
				choices: [],
				handleSelection: () => {},
				handleCustomClick: () => {},
			};

			const component = renderer.create(
				<SetupBlockingView {...initialState} />
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('the happy path of the component', () => {
			const initialState = {
				blockingPolicy: 'test',
				choices: [
					{
						name: 'test',
						image: 'choice-test-image',
						text: 'This is your TEST choice',
						description: 'This is your TEST below text',
					},
					{
						name: 'example',
						image: 'choice-example-image',
						text: 'This is your EXAMPLE choice',
						description: 'This is your EXAMPLE below text',
					},
				],
				handleSelection: () => {},
				handleCustomClick: () => {},
			};

			const component = shallow(<SetupBlockingView {...initialState} />);
			expect(component.find('.SetupBlocking').length).toBe(1);
			expect(component.find('.SetupBlocking__choiceBox').length).toBe(2);
			expect(component.find('.SetupBlocking--selected').length).toBe(1);
			expect(component.find('.SetupBlocking__imageContainer').length).toBe(2);
			expect(component.find('.SetupBlocking__textContainer').length).toBe(2);
		});

		test('the non-happy path of the component', () => {
			const initialState = {
				blockingPolicy: 'test',
				choices: [],
				handleSelection: () => {},
				handleCustomClick: () => {},
			};

			const component = shallow(<SetupBlockingView {...initialState} />);
			expect(component.find('.SetupBlocking').length).toBe(1);
			expect(component.find('.SetupBlocking__choiceBox').length).toBe(0);
			expect(component.find('.SetupBlocking--selected').length).toBe(0);
			expect(component.find('.SetupBlocking__imageContainer').length).toBe(0);
			expect(component.find('.SetupBlocking__textContainer').length).toBe(0);
		});
	});
});
