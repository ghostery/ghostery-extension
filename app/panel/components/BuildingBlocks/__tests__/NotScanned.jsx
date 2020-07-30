/**
 * Not Scanned Test Component
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
import NotScanned from '../NotScanned';

// Fake the translation function to only return the translation key
global.t = function(str) {
	return str;
};

describe('app/panel/components/NotScanned.jsx', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('NotScanned is rendered correctly when no props are passed', () => {
			const component = renderer.create(
				<NotScanned />
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('NotScanned is rendered correctly when small', () => {
			const component = renderer.create(
				<NotScanned isSmall />
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});
});
