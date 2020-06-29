/**
 * BlockingTracker Test Component
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
import { shallow } from 'enzyme';
import BlockingTracker from '../BlockingTracker';

describe('app/panel-android/components/content/BlockingTracker.jsx', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('BlockingTracker component with falsy props', () => {
			const tracker = {
				id: 1,
				name: 'Tracker 1',
				ss_allowed: false,
				ss_blocked: false,
				blocked: false,
			};
			const siteProps = {
				isTrusted: false,
				isRestricted: false,
				isPaused: false,
			};

			const component = renderer.create(
				<BlockingTracker
					index={1}
					tracker={tracker}
					categoryId="cat-1"
					type="site"
					toggleTrackerSelectOpen={() => {}}
					open={false}
					siteProps={siteProps}
					callGlobalAction={() => {}}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('BlockingTracker component when tracker blocked', () => {
			const tracker = {
				id: 1,
				name: 'Tracker 1',
				ss_allowed: false,
				ss_blocked: false,
				blocked: true,
			};
			const siteProps = {
				isTrusted: false,
				isRestricted: false,
				isPaused: false,
			};

			const component = renderer.create(
				<BlockingTracker
					index={1}
					tracker={tracker}
					categoryId="cat-1"
					type="site"
					toggleTrackerSelectOpen={() => {}}
					open={false}
					siteProps={siteProps}
					callGlobalAction={() => {}}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('BlockingTracker component when tracker allowed', () => {
			const tracker = {
				id: 1,
				name: 'Tracker 1',
				ss_allowed: true,
				ss_blocked: false,
				blocked: false,
			};
			const siteProps = {
				isTrusted: false,
				isRestricted: false,
				isPaused: false,
			};

			const component = renderer.create(
				<BlockingTracker
					index={1}
					tracker={tracker}
					categoryId="cat-1"
					type="site"
					toggleTrackerSelectOpen={() => {}}
					open={false}
					siteProps={siteProps}
					callGlobalAction={() => {}}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('BlockingTracker component when tracker restricted', () => {
			const tracker = {
				id: 1,
				name: 'Tracker 1',
				ss_allowed: false,
				ss_blocked: true,
				blocked: false,
			};
			const siteProps = {
				isTrusted: false,
				isRestricted: false,
				isPaused: false,
			};

			const component = renderer.create(
				<BlockingTracker
					index={1}
					tracker={tracker}
					categoryId="cat-1"
					type="site"
					toggleTrackerSelectOpen={() => {}}
					open={false}
					siteProps={siteProps}
					callGlobalAction={() => {}}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('BlockingTracker component when site Trusted', () => {
			const tracker = {
				id: 1,
				name: 'Tracker 1',
				ss_allowed: false,
				ss_blocked: false,
				blocked: false,
			};
			const siteProps = {
				isTrusted: true,
				isRestricted: false,
				isPaused: false,
			};

			const component = renderer.create(
				<BlockingTracker
					index={1}
					tracker={tracker}
					categoryId="cat-1"
					type="site"
					toggleTrackerSelectOpen={() => {}}
					open={false}
					siteProps={siteProps}
					callGlobalAction={() => {}}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('BlockingTracker component when site Restricted', () => {
			const tracker = {
				id: 1,
				name: 'Tracker 1',
				ss_allowed: false,
				ss_blocked: false,
				blocked: false,
			};
			const siteProps = {
				isTrusted: false,
				isRestricted: true,
				isPaused: false,
			};

			const component = renderer.create(
				<BlockingTracker
					index={1}
					tracker={tracker}
					categoryId="cat-1"
					type="site"
					toggleTrackerSelectOpen={() => {}}
					open={false}
					siteProps={siteProps}
					callGlobalAction={() => {}}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('BlockingTracker component when site Paused', () => {
			const tracker = {
				id: 1,
				name: 'Tracker 1',
				ss_allowed: false,
				ss_blocked: false,
				blocked: false,
			};
			const siteProps = {
				isTrusted: false,
				isRestricted: false,
				isPaused: true,
			};

			const component = renderer.create(
				<BlockingTracker
					index={1}
					tracker={tracker}
					categoryId="cat-1"
					type="site"
					toggleTrackerSelectOpen={() => {}}
					open={false}
					siteProps={siteProps}
					callGlobalAction={() => {}}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Functionality tests shallow mounted with Enzyme', () => {
		test('BlockingTracker component clicks work', () => {
			const tracker = {
				id: 1,
				name: 'Tracker 1',
				ss_allowed: false,
				ss_blocked: false,
				blocked: false,
			};
			const siteProps = {
				isTrusted: false,
				isRestricted: false,
				isPaused: false,
			};

			const toggleTrackerSelectOpen = jest.fn();
			const callGlobalAction = jest.fn();

			const component = shallow(
				<BlockingTracker
					index={1}
					tracker={tracker}
					categoryId="cat-1"
					type="global"
					toggleTrackerSelectOpen={toggleTrackerSelectOpen}
					open={false}
					siteProps={siteProps}
					callGlobalAction={callGlobalAction}
				/>
			);

			expect(component.find('.BlockingSelectGroup.BlockingSelectGroup--open').length).toBe(0);
			component.find('.BlockingTracker').simulate('click');
			component.setProps({ open: true });
			expect(toggleTrackerSelectOpen.mock.calls.length).toBe(1);
			expect(component.find('.BlockingSelectGroup.BlockingSelectGroup--open').length).toBe(1);

			expect(callGlobalAction.mock.calls.length).toBe(0);
			component.find('.BlockingSelect__block').simulate('click');
			component.setProps({ type: 'site' });
			component.find('.BlockingSelect__block').simulate('click');
			component.find('.BlockingSelect__restrict').simulate('click');
			component.find('.BlockingSelect__trust').simulate('click');
			expect(callGlobalAction.mock.calls[0][0].actionName).toBe('blockUnblockGlobalTracker');
			expect(callGlobalAction.mock.calls[1][0].actionName).toBe('trustRestrictBlockSiteTracker');
			expect(callGlobalAction.mock.calls[2][0].actionData.restrict).toBe(true);
			expect(callGlobalAction.mock.calls[3][0].actionData.trust).toBe(true);
		});
	});
});
