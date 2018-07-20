/**
 * TrackersChart Component
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
import PropTypes from 'prop-types';
import ChartSVG from './ChartSVG';

class TrackersChart extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			config: {
				radius: 100,
			}
		};
	}

	render() {
		return (
			<div className="trackers-chart">
				<ChartSVG paths={this.props.paths} radius={this.state.config.radius} />
				<p className="trackers-num">
					<span>{this.props.num}</span> <span>Trackers found</span>
				</p>
			</div>
		);
	}
}

TrackersChart.propTypes = {
	paths: PropTypes.arrayOf(PropTypes.object),
	num: PropTypes.number,
};

TrackersChart.defaultProps = {
	paths: [],
	num: 0,
};

export default TrackersChart;
