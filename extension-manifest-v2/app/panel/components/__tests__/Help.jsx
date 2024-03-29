/**
 * Help Test Component
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
import Help from '../Help';

jest.mock('../../utils/msg', () => ({
	openSupportPage: () => {},
}));

describe('app/panel/components/Help.jsx', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('Help panel is rendered correctly', () => {
			const component = renderer.create(
				<Help />
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});
});
