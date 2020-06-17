/**
 * Tabs Test Component
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
import Tabs from '../Tabs';
import Tab from '../Tab';

describe('app/panel-android/components/content/Tabs.jsx', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('Tabs component with 3 Tab children components', () => {
			const component = renderer.create(
				<Tabs>
					<Tab tabLabel="Tab 1 Label" linkClassName="tab-1-class">
						<div className="tab-1-content">Tab 1 Content</div>
					</Tab>

					<Tab tabLabel="Tab 2 Label" linkClassName="tab-2-class">
						<div className="tab-2-content">Tab 2 Content</div>
					</Tab>

					<Tab tabLabel="Tab 3 Label" linkClassName="tab-3-class">
						<div>Tab 3 Content Part I</div>
						<div>Tab 3 Content Part II</div>
						<div>Tab 3 Content Part III</div>
					</Tab>
				</Tabs>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Functionality tests mounted with Enzyme', () => {
		test('Tabs component with 3 Tab children components happy path', () => {
			const component = mount(
				<Tabs>
					<Tab tabLabel="Tab 1 Label" linkClassName="tab-1-class">
						<div className="tab-1-content">Tab 1 Content</div>
					</Tab>

					<Tab tabLabel="Tab 2 Label" linkClassName="tab-2-class">
						<div className="tab-2-content">Tab 2 Content</div>
					</Tab>

					<Tab tabLabel="Tab 3 Label" linkClassName="tab-3-class">
						<div>Tab 3 Content Part I</div>
						<div>Tab 3 Content Part II</div>
						<div>Tab 3 Content Part III</div>
					</Tab>
				</Tabs>
			);
			expect(component.find('.Tabs__component').length).toBe(1);
			expect(component.find('.Tabs__navigation').length).toBe(1);
			expect(component.find('.Tab__navigation_item').length).toBe(3);
			expect(component.find('.Tab__navigation_item.tab-1-class').length).toBe(0);
			expect(component.find('.Tab__navigation_item.Tab--active').length).toBe(1);
			expect(component.find('.Tab__navigation_link').length).toBe(3);
			expect(component.find('.Tab__navigation_link.Tab--active').length).toBe(1);
			expect(component.find('.Tab__navigation_link.Tab--active.tab-1-class').length).toBe(1);
			expect(component.find('.Tab__navigation_link.Tab--active.tab-2-class').length).toBe(0);
			expect(component.find('.Tab__navigation_link.Tab--active.tab-3-class').length).toBe(0);
			expect(component.find('.Tabs__active_content').length).toBe(1);
			expect(component.find('.Tabs__active_content .tab-1-content').length).toBe(1);
			expect(component.find('.Tabs__active_content .tab-2-content').length).toBe(0);

			component.setState({ activeTabIndex: 1 });
			expect(component.find('.Tab__navigation_link.Tab--active.tab-1-class').length).toBe(0);
			expect(component.find('.Tab__navigation_link.Tab--active.tab-2-class').length).toBe(1);
			expect(component.find('.Tab__navigation_link.Tab--active.tab-3-class').length).toBe(0);
			expect(component.find('.Tabs__active_content .tab-1-content').length).toBe(0);
			expect(component.find('.Tabs__active_content .tab-2-content').length).toBe(1);

			component.setState({ activeTabIndex: 2 });
			expect(component.find('.Tab__navigation_link.Tab--active.tab-1-class').length).toBe(0);
			expect(component.find('.Tab__navigation_link.Tab--active.tab-2-class').length).toBe(0);
			expect(component.find('.Tab__navigation_link.Tab--active.tab-3-class').length).toBe(1);
			expect(component.find('.Tabs__active_content .tab-1-content').length).toBe(0);
			expect(component.find('.Tabs__active_content .tab-2-content').length).toBe(0);
		});

		test('Tabs component with 3 Tab children components non-happy path', () => {
			expect(true).toBe(false);
		});
	});
});
