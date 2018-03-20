/**
 * Donut Graph Test Component
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
import DonutGraph from '../BuildingBlocks/DonutGraph';

// Fake the translation function to only return the translation key
global.t = function (str) {
	return str;
};

const initialState = {
	categories: [
		{ id: 'advertising', name: 'Advertising', num_total: 1 },
		{ id: 'customer_interaction', name: 'Customer Interaction', num_total: 1 },
		{ id: 'site_analytics', name: 'Site Analytics', num_total: 1 },
	],
	renderRedscale: false,
	renderGreyscale: false,
	totalCount: 3,
	isSmall: false,
	clickDonut: () => {},
};

it('renders the initial state correctly', () => {
	const component = renderer.create(<DonutGraph {...initialState} />).toJSON();
	expect(component).toMatchSnapshot();
});
