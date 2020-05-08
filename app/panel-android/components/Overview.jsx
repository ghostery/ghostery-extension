/**
 * Overview Component
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
import TrackersChart from './content/TrackersChart';
import fromTrackersToChartData from '../utils/chart';

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
		const trackers = this.categories.map(category => ({
			id: category.id,
			numTotal: category.num_total,
		}));

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
