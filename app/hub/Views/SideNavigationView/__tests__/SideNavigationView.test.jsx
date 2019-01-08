/**
 * Side Navigation View Test Component
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
import { MemoryRouter } from 'react-router';
import SideNavigationView from '../SideNavigationView';

describe('app/hub/Views/SideNavigationView component', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('side navigation view is rendered correctly', () => {
			const initialState = {
				menuItems: [
					{ href: '/', icon: 'home', text: 'Home' },
					{ href: '/setup', icon: 'setup', text: 'Setup' },
					{ href: '/tutorial', icon: 'tutorial', text: 'Tutorial' },
					{ href: '/plus', icon: 'plus', text: 'Plus' },
					{ href: '/rewards', icon: 'rewards', text: 'Rewards' },
					{ href: '/products', icon: 'products', text: 'Products' },
				],
				bottomItems: [
					{ id: 'create-account', href: '/create-account', text: 'Create Account' },
					{ id: 'login', href: '/log-in', text: 'Log In' },
					{ id: 'email', href: 'https://account.ghostery.com/', text: 'test@example.com' },
					{ id: 'logout', text: 'Log Out', clickHandler: () => {} },
				],
				disableNav: false,
			};

			const component = renderer.create(
				<MemoryRouter>
					<SideNavigationView {...initialState} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('side navigation view is rendered correctly when disabled', () => {
			const initialState = {
				menuItems: [
					{ href: '/', icon: 'home', text: 'Home' },
					{ href: '/setup', icon: 'setup', text: 'Setup' },
					{ href: '/tutorial', icon: 'tutorial', text: 'Tutorial' },
					{ href: '/plus', icon: 'plus', text: 'Plus' },
					{ href: '/rewards', icon: 'rewards', text: 'Rewards' },
					{ href: '/products', icon: 'products', text: 'Products' },
				],
				bottomItems: [
					{ id: 'create-account', href: '/create-account', text: 'Create Account' },
					{ id: 'login', href: '/log-in', text: 'Log In' },
					{ id: 'email', href: 'https://account.ghostery.com/', text: 'test@example.com' },
					{ id: 'logout', text: 'Log Out', clickHandler: () => {} },
				],
				disableNav: true,
			};

			const component = renderer.create(
				<MemoryRouter>
					<SideNavigationView {...initialState} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('More Snapshot tests with react-test-renderer, but for edge cases', () => {
		test('edge case where items are empty', () => {
			const initialState = {
				menuItems: [],
				bottomItems: [],
				disableNav: false,
			};

			const component = renderer.create(
				<MemoryRouter>
					<SideNavigationView {...initialState} />
				</MemoryRouter>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('the happy path of the component', () => {
			const initialState = {
				menuItems: [
					{ href: '/', icon: 'home', text: 'Home' },
					{ href: '/setup', icon: 'setup', text: 'Setup' },
					{ href: '/tutorial', icon: 'tutorial', text: 'Tutorial' },
					{ href: '/plus', icon: 'plus', text: 'Plus' },
					{ href: '/rewards', icon: 'rewards', text: 'Rewards' },
					{ href: '/products', icon: 'products', text: 'Products' },
				],
				bottomItems: [
					{ id: 'create-account', href: '/create-account', text: 'Create Account' },
					{ id: 'login', href: '/log-in', text: 'Log In' },
					{ id: 'email', href: 'https://account.ghostery.com/', text: 'test@example.com' },
					{ id: 'logout', text: 'Log Out', clickHandler: () => {} },
				],
				disableNav: false,
			};

			const component = shallow(<SideNavigationView {...initialState} />);
			expect(component.find('.SideNavigation').length).toBe(1);
			expect(component.find('.SideNavigation__top').length).toBe(1);
			expect(component.find('.SideNavigation__menu').length).toBe(1);
			expect(component.find('.SideNavigation__bottom').length).toBe(1);
			expect(component.find('.SideNavigation__item').length).toBe(initialState.menuItems.length + initialState.bottomItems.length);
			expect(component.find('.SideNavigation__menuItem').length).toBe(initialState.menuItems.length);
			expect(component.find('.SideNavigation__menuIcon').length).toBe(initialState.menuItems.length);
			expect(component.find('.SideNavigation__bottomItem').length).toBe(initialState.bottomItems.length);

			expect(component.find('.SideNavigation__top.disabled').length).toBe(0);
			expect(component.find('.SideNavigation__menuItem .disabled').length).toBe(0);
			expect(component.find('.SideNavigation__bottomItem .disabled').length).toBe(0);
			component.setProps({ disableNav: true });
			expect(component.find('.SideNavigation__top.disabled').length).toBe(1);
			expect(component.find('.SideNavigation__menuItem .disabled').length).toBe(initialState.menuItems.length);
			expect(component.find('.SideNavigation__bottomItem .disabled').length).toBe(initialState.bottomItems.length);
		});
	});
});
