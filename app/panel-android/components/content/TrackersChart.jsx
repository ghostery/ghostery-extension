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
