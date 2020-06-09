/**
 * Path Component
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

const INTERVAL = 1000; // Define the maximum rendering time for this path

export default class Path extends React.Component {
	constructor(props) {
		super(props);
		this.myRef = React.createRef();
		this.timer = null;
	}

	static polarToCartesian(centerX, centerY, radius, angleInDegrees) {
		const angleInRadians = (angleInDegrees - 90) * (Math.PI / 180.0);

		return {
			x: centerX + (radius * Math.cos(angleInRadians)),
			y: centerY + (radius * Math.sin(angleInRadians))
		};
	}

	static describeArc(x, y, radius, startAngle, endAngle) {
		const start = Path.polarToCartesian(x, y, radius, startAngle);
		const end = Path.polarToCartesian(x, y, radius, endAngle);

		const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

		const d = [
			'M', start.x, start.y,
			'A', radius, radius, 0, largeArcFlag, 1, end.x, end.y
		].join(' ');

		return d;
	}

	componentDidMount() {
		const node = this.myRef.current;
		node.style.setProperty('--stroke-length', `${node.getTotalLength()}`);
		// Check and call props.handler() if the animationEnd event doesn't get fired somehow
		this.timer = setInterval(() => {
			clearInterval(this.timer); // Run this only once
			const { handler } = this.props;
			handler();
		}, INTERVAL);
	}

	componentWillUnmount() {
		clearInterval(this.timer);
	}

	onAnimationEndHandler = () => {
		clearInterval(this.timer);
		const { handler } = this.props;
		handler();
	}

	render() {
		const { radius, path } = this.props;
		const { start, category } = path;
		// Fix error for single path
		const end = path.end === 360 ? 359.9999 : path.end;

		const d = Path.describeArc(0, 0, radius, start, end);

		return (
			<path
				d={d}
				data-category={category}
				className="path"
				ref={this.myRef}
				onAnimationEnd={this.onAnimationEndHandler}
			/>
		);
	}
}

Path.propTypes = {
	radius: PropTypes.number.isRequired,
	path: PropTypes.object, // eslint-disable-line react/forbid-prop-types
	handler: PropTypes.func.isRequired,
};

Path.defaultProps = {
	path: {},
};
