/**
 * ChartSVG Component
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
import PropTypes from 'prop-types';
import Path from './Path';

export default class ChartSVG extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			nItem: 1,
		};
	}

	increaseN = () => {
		const { paths } = this.props;
		const { nItem } = this.state;
		let currentN = nItem;
		if (currentN < paths.length) {
			this.setState({
				nItem: currentN += 1,
			});
		}
	}

	render() {
		const { paths, radius } = this.props;
		const { nItem } = this.state;
		let computedPaths = paths.slice(0, nItem).map((element, index) => (
			// eslint-disable-next-line react/no-array-index-key
			<Path key={index} path={element} radius={radius} handler={this.increaseN}	/>
		));

		if (computedPaths.length === 0) {
			// When there is no tracker
			const defaultElement = {
				start: 0,
				end: 360,
				category: 'default',
			};

			computedPaths = (
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
					{computedPaths}
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
