/**
 * Summary Test Component
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
import ReactDOM from 'react-dom'; // Needed to override findDOMNode fn in ../Tooltip.jsx
import Summary from '../Summary';

global.t = function(str) {
	return str;
};

// Mock function to prevent errors in Tooltip.jsx
ReactDOM.findDOMNode = jest.fn();
ReactDOM.findDOMNode.mockReturnValue({
	parentNode: {
		addEventListener: function () {},
	},
});

// Initial State taken from ../Summary.jsx
const initialState = {
	alertCounts: {
		total: 0,
	},
	pageHost: '',
	pageUrl: '',
	paused_blocking: false,
	siteNotScanned: false,
	trackerCounts: {
		allowed: 0,
		blocked: 0,
	},
	tab_id: 0,
};

it('renders the initial state correctly', () => {
	const component = renderer.create(<Summary {...initialState} />).toJSON();
	expect(component).toMatchSnapshot();
});
