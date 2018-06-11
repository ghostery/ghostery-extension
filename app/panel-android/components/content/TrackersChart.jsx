import React from 'react';
import PropTypes from 'prop-types';

class Path extends React.Component {
	constructor(props) {
		super(props);
		this.myRef = React.createRef();
	}

	polarToCartesian(centerX, centerY, radius, angleInDegrees) {
		const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

		return {
			x: centerX + (radius * Math.cos(angleInRadians)),
			y: centerY + (radius * Math.sin(angleInRadians))
		};
	}

	describeArc(x, y, radius, startAngle, endAngle) {
		const start = this.polarToCartesian(x, y, radius, startAngle);
		const end = this.polarToCartesian(x, y, radius, endAngle);

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
	}

	render() {
		let radius = this.props.radius;
		let start = this.props.path.start;
		// Fix error for single path
		let end = this.props.path.end === 360 ? 359.9999 : this.props.path.end;
		let category = this.props.path.category;

		const d = this.describeArc(0, 0, radius, start, end);

		return (
			<path
				d={d}
				data-category={category}
				className="path"
				ref={this.myRef}
				onAnimationEnd={this.props.handler}
			>
			</path>
		)
	}
}

Path.propTypes = {
	radius: PropTypes.number,
	path: PropTypes.object,
	handler: PropTypes.func,
};

class SVG extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			nItem: 1,
		}
	}

	increaseN = () => {
		let currentN = this.state.nItem;
		if (currentN < this.props.paths.length) {
			this.setState({
				nItem: currentN += 1,
			});
		}
	}

	render() {
		const radius = this.props.radius;
		let paths = this.props.paths.slice(0, this.state.nItem).map((element, index) => {
			return (
				<Path
					key={index}
					path={element}
					radius={radius}
					handler = {this.increaseN}
				/>
			);
		});

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
					handler = {this.increaseN}
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

SVG.propTypes = {
	paths: PropTypes.array,
	radius: PropTypes.number,
};

class TrackersChart extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			config: {
				radius: 100,
			}
		}
	}

	render() {
		return (
			<div className="trackers-chart">
				<SVG paths={this.props.paths} radius={this.state.config.radius} />
				<p className="trackers-num">
					<span>{this.props.num}</span> <span>Trackers found</span>
				</p>
			</div>
		);
	}
}

TrackersChart.propTypes = {
	paths: PropTypes.array,
	num: PropTypes.number,
};

export default TrackersChart;
