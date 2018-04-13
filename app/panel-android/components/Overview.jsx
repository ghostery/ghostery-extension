import React from 'react';
import PropTypes from 'prop-types';
import TrackersChart from './content/TrackersChart';
import { fromTrackersToChartData } from '../utils/chart';

export default class Overview extends React.Component {

	get isTrusted() {
		return this.context.siteProps.isTrusted;
	}

	get isRestricted() {
		return this.context.siteProps.isRestricted;
	}

	get isPaused() {
		return this.context.siteProps.isPaused;
	}

	get categories() {
		return this.props.categories || [];
	}

	get chartData() {
		const trackers = this.categories.map(category =>
			({
				id: category.id,
				numTotal: category.num_total,
			})
		);

		return fromTrackersToChartData(trackers);
	}

	get hostName() {
		return this.context.siteProps.hostName;
	}

	get nTrackersBlocked() {
		return this.context.siteProps.nTrackersBlocked;
	}

	handleTrustButtonClick = () => {
		this.context.callGlobalAction({
			actionName: 'handleTrustButtonClick',
		});
	}

	handleRestrictButtonClick = () => {
		this.context.callGlobalAction({
			actionName: 'handleRestrictButtonClick',
		});
	}

	handlePauseButtonClick = () => {
		this.context.callGlobalAction({
			actionName: 'handlePauseButtonClick',
		});
	}

	render() {
		return (
			<div className="overview">
				<div className={`chart-wrapper ${this.isPaused ? 'paused' : ''}`}>
					<TrackersChart
						paths={this.chartData.arcs}
						num={this.chartData.sum}
					/>
					<p>{this.hostName}</p>
					<p className="trackers-blocked-num"><span className="number">{this.nTrackersBlocked}</span> Trackers blocked</p>
				</div>

				<div className="buttons-wrapper row">
					<div className="small-12">
						<button
							className={`button trust-site-btn ${this.isTrusted ? 'changed' : ''}`}
							onClick={this.handleTrustButtonClick}
						>
							<span>Trust Site</span>
						</button>
					</div>
					<div className="small-12">
						<button
							className={`button restrict-site-btn ${this.isRestricted ? 'changed' : ''}`}
							onClick={this.handleRestrictButtonClick}
						>
							<span>Restrict Site</span>
						</button>
					</div>
					<div className="small-12">
						<button
							className={`button pause-resume-btn ${this.isPaused ? 'changed' : ''}`}
							onClick={this.handlePauseButtonClick}
						>
							<span>Pause Ghostery</span>
							<span>Resume Ghostery</span>
						</button>
					</div>
				</div>
			</div>
		)
	}
}

Overview.propTypes = {
	handleClick: PropTypes.func,
	categories: PropTypes.array,
};

Overview.contextTypes = {
	siteProps: PropTypes.object,
	callGlobalAction: PropTypes.func,
};
