/**
 * ChartSVG Component
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
import Path from './Path';

const INTERVAL = 500; // Define the maximum waiting time to render the chart

export default class ChartSVG extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			nItem: 1,
		};

		this.timer = null;
	}

	componentDidMount() {
		this.timer = setInterval(() => this.checkAndRenderChart(), INTERVAL);
	}

	componentWillUnmount() {
		clearInterval(this.timer);
	}

	increaseN = () => {
		let currentN = this.state.nItem;
		if (currentN < this.props.paths.length) {
			this.setState({
				nItem: currentN += 1,
			});
		}
	}

	// Force rendering the whole chart if the animationEnd event doesn't get fired somehow
	checkAndRenderChart = () => {
		clearInterval(this.timer); // Run this function only once

		if (this.state.nItem < this.props.paths.length) {
			this.setState({
				nItem: this.props.paths.length,
			});
		}
	}

	render() {
		const { radius } = this.props;
		let paths = this.props.paths.slice(0, this.state.nItem).map((element, index) => (
			// eslint-disable-next-line react/no-array-index-key
			<Path	key={index}	path={element} radius={radius} handler={this.increaseN}	/>
		));

		if (paths.length === 0) {
			// When there is no tracker
			const defaultElement = {
				start: 0,
				end: 360,
				category: 'default',
			};

			paths = (
				<Path
					path={defaultElement}
					radius={radius}
					handler={this.increaseN}
				/>
			);
		}

		return (
			<svg id="circle" xmlns="http://www.w3.org/2000/svg" version="1.1" width="100%" height="100%" viewBox="-20 -20 240 240">
				<g>
					{paths}
				</g>
			</svg>
		);
	}
}

ChartSVG.propTypes = {
	paths: PropTypes.arrayOf(PropTypes.object),
	radius: PropTypes.number.isRequired,
};

ChartSVG.defaultProps = {
	paths: [],
};
