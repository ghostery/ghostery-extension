/**
 * Overview Component
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
import PropTypes from 'prop-types';
import TrackersChart from './content/TrackersChart';
import fromTrackersToChartData from '../utils/chart';

class Overview extends React.Component {
	get isTrusted() {
		const { siteProps } = this.context;
		return siteProps.isTrusted;
	}

	get isRestricted() {
		const { siteProps } = this.context;
		return siteProps.isRestricted;
	}

	get isPaused() {
		const { siteProps } = this.context;
		return siteProps.isPaused;
	}

	get categories() {
		const { categories } = this.props;
		return categories || [];
	}

	get chartData() {
		const trackers = this.categories.map(category => ({
			id: category.id,
			numTotal: category.num_total,
		}));

		return fromTrackersToChartData(trackers);
	}

	get hostName() {
		const { siteProps } = this.context;
		return siteProps.hostName;
	}

	get nTrackersBlocked() {
		const { siteProps } = this.context;
		return siteProps.nTrackersBlocked;
	}

	handleTrustButtonClick = () => {
		const { callGlobalAction } = this.context;
		callGlobalAction({
			actionName: 'handleTrustButtonClick',
		});
	}

	handleRestrictButtonClick = () => {
		const { callGlobalAction } = this.context;
		callGlobalAction({
			actionName: 'handleRestrictButtonClick',
		});
	}

	handlePauseButtonClick = () => {
		const { callGlobalAction } = this.context;
		callGlobalAction({
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
					<p className="trackers-blocked-num">
						<span className="number">
							{this.nTrackersBlocked}
							{' '}
						</span>
						Trackers blocked
					</p>
				</div>

				<div className="buttons-wrapper row">
					<div className="small-12">
						<button
							type="button"
							className={`button trust-site-btn ${this.isTrusted ? 'changed' : ''} ${this.isPaused ? 'paused' : ''}`}
							onClick={this.handleTrustButtonClick}
						>
							<span>Trust Site</span>
						</button>
					</div>
					<div className="small-12">
						<button
							type="button"
							className={`button restrict-site-btn ${this.isRestricted ? 'changed' : ''} ${this.isPaused ? 'paused' : ''}`}
							onClick={this.handleRestrictButtonClick}
						>
							<span>Restrict Site</span>
						</button>
					</div>
					<div className="small-12">
						<button
							type="button"
							className={`button pause-resume-btn ${this.isPaused ? 'changed' : ''}`}
							onClick={this.handlePauseButtonClick}
						>
							<span>Pause Ghostery</span>
							<span>Resume Ghostery</span>
						</button>
					</div>
				</div>
			</div>
		);
	}
}

Overview.propTypes = {
	categories: PropTypes.arrayOf(PropTypes.shape),
};

Overview.defaultProps = {
	categories: [],
};

Overview.contextTypes = {
	siteProps: PropTypes.shape,
	callGlobalAction: PropTypes.func,
};

export default Overview;
