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
			const initialState = {
				onAndroidClick: () => {},
				onIosClick: () => {},
				onLiteClick: () => {},
			};

			const component = renderer.create(
				<ProductsView {...initialState} />
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('the happy path of the component', () => {
			const initialState = {
				onAndroidClick: jest.fn(),
				onIosClick: jest.fn(),
				onLiteClick: jest.fn(),
			};

			const component = shallow(<ProductsView {...initialState} />);
			expect(component.find('.ProductsView').length).toBe(1);
			expect(component.find('.ProductsView--rowPaddingTop').length).toBe(2);
			expect(component.find('.ProductsView__headerTitle').length).toBe(1);
			expect(component.find('.ProductsView__headerDescription').length).toBe(1);
			expect(component.find('.ProductsView__mainPromoTitle').length).toBe(1);
			expect(component.find('.ProductsView__mainPromoDescription').length).toBe(1);
			expect(component.find('.ProductsView__storeImageContainer').length).toBe(2);
			expect(component.find('.ProductsView__imageAppStoreIos').length).toBe(1);
			expect(component.find('.ProductsView__imageAppStoreMac').length).toBe(1);
			expect(component.find('.ProductsView__imagePlayStore').length).toBe(1);
			expect(component.find('.ProductsView__secondaryPromo').length).toBe(2);
			expect(component.find('.ProductsView__secondaryPromoImage').length).toBe(2);
			expect(component.find('.ProductsView__secondaryPromoTitle').length).toBe(2);
			expect(component.find('.ProductsView__secondaryPromoDescription').length).toBe(2);

			expect(initialState.onAndroidClick.mock.calls.length).toBe(0);
			component.find('.ProductsView__storeImageContainer a[href="https://play.google.com/store/apps/details?id=com.ghostery.android.ghostery"]').simulate('click');
			expect(initialState.onAndroidClick.mock.calls.length).toBe(1);

			expect(initialState.onIosClick.mock.calls.length).toBe(0);
			component.find('.ProductsView__storeImageContainer a[href="https://itunes.apple.com/us/app/ghostery-privacy-browser/id472789016?mt=8"]').simulate('click');
			expect(initialState.onIosClick.mock.calls.length).toBe(1);

			expect(initialState.onLiteClick.mock.calls.length).toBe(0);
			component.find('.ProductsView__storeImageContainer a[href="https://itunes.apple.com/us/app/ghostery-lite/id1436953057"]').simulate('click');
			expect(initialState.onLiteClick.mock.calls.length).toBe(1);
		});
	});
});
