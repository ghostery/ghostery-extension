/**
 * Products View Test Component
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
import ProductsView from '../ProductsView';

describe('app/hub/Views/ProductsView component', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('products view is rendered correctly', () => {
			const component = renderer.create(
				<ProductsView />
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('the happy path of the component', () => {
			const component = shallow(<ProductsView />);
			expect(component.find('.ProductsView').length).toBe(1);
			expect(component.find('.ProductsView--rowPaddingTop').length).toBe(2);
			expect(component.find('.ProductsView__headerTitle').length).toBe(1);
			expect(component.find('.ProductsView__headerDescription').length).toBe(1);
			expect(component.find('.ProductsView__mainPromoTitle').length).toBe(1);
			expect(component.find('.ProductsView__mainPromoDescription').length).toBe(1);
			expect(component.find('.ProductsView__storeImageContainer').length).toBe(2);
			expect(component.find('.ProductsView__imageAppStore').length).toBe(2);
			expect(component.find('.ProductsView__imagePlayStore').length).toBe(1);
			expect(component.find('.ProductsView__secondaryPromo').length).toBe(2);
			expect(component.find('.ProductsView__secondaryPromoImage').length).toBe(2);
			expect(component.find('.ProductsView__secondaryPromoTitle').length).toBe(2);
			expect(component.find('.ProductsView__secondaryPromoDescription').length).toBe(2);
		});
	});
});
