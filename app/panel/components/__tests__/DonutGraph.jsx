/**
 * Donut Graph Test Component
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
import DonutGraph from '../BuildingBlocks/DonutGraph';


// Fake the translation function to only return the translation key
global.t = function(str) {
	return str;
};

describe('app/panel/components/DonutGraph.jsx', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('DonutGraph is rendered correctly when no props are passed', () => {
			expect(true).toBe(false);
		});
	});

	describe('Shallow snapshot tests rendered with Enzyme', () => {
		test('DonutGraph happy path', () => {});
	});
});
