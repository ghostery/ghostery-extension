/**
 * Panel Component
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
import Tabs from './content/Tabs';
import Tab from './content/Tab';
import Overview from './Overview';
import FixedMenu from './content/FixedMenu';
import SiteTrackers from './SiteTrackers';
import GlobalTrackers from './GlobalTrackers';
import TrackersChart from './content/TrackersChart';
import {
	getPanelData, getSummaryData, getSettingsData, getBlockingData
} from '../actions/panelActions';
import { getCliqzModuleData } from '../actions/cliqzActions';
import handleAllActions from '../actions/handler';
import { fromTrackersToChartData } from '../utils/chart';

export default class Panel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			panel: {},
			summary: {},
			settings: {},
			blocking: {},
			cliqzModuleData: {},
		};
	}

	getChildContext = () => ({
		siteProps: this.siteProps,
		callGlobalAction: this.callGlobalAction,
	});

	componentDidMount() {
		const tabId = new URLSearchParams(window.location.search).get('tabId');
		this.setPanelState(tabId);
		this.setSummaryState(tabId);
		this.setSettingsState();
		this.setBlockingState(tabId);
		this.setCliqzDataState(tabId);
	}

	get siteCategories() {
		return this.state.blocking.categories || [];
	}

	get globalCategories() {
		return this.state.settings.categories || [];
	}

	get chartData() {
		const trackers = this.siteCategories.map(category => ({
			id: category.id,
			numTotal: category.num_total,
		}));

		return fromTrackersToChartData(trackers);
	}

	get siteProps() {
		const hostName = this.state.summary.pageHost || '';
		const pageHost = hostName.toLowerCase().replace(/^(http[s]?:\/\/)?(www\.)?/, '');

		const siteWhitelist = this.state.summary.site_whitelist || [];
		const siteBlacklist = this.state.summary.site_blacklist || [];

		const isTrusted = siteWhitelist.indexOf(pageHost) !== -1;
		const isRestricted = siteBlacklist.indexOf(pageHost) !== -1;
		const isPaused = this.state.summary.paused_blocking;

		const nTrackersBlocked = (this.state.summary.trackerCounts || {}).blocked || 0;

		return {
			hostName, pageHost, isTrusted, isRestricted, isPaused, nTrackersBlocked
		};
	}

	setPanelState = (tabId) => {
		getPanelData(tabId).then((data) => {
			this.setState({
				panel: data.panel,
			});
		});
	}

	setSummaryState = (tabId) => {
		getSummaryData(tabId).then((data) => {
			this.setState({
				summary: data,
			});
		});
	}

	setSettingsState = () => {
		getSettingsData().then((data) => {
			this.setState({
				settings: data,
			});
		});
	}

	setBlockingState = (tabId) => {
		getBlockingData(tabId).then((data) => {
			this.setState({
				blocking: data,
			});
		});
	}

	setCliqzDataState = (tabId) => {
		getCliqzModuleData(tabId).then((data) => {
			this.setState({
				cliqzModuleData: data,
			});
		});
	}

	setGlobalState = (updated) => {
		const newState = {};
		Object.keys(updated).forEach((key) => {
			newState[key] = Object.assign({}, this.state[key], updated[key]);
		});

		this.setState(newState);
	}

	callGlobalAction = ({ actionName, actionData = {} }) => {
		const updated = handleAllActions({ actionName, actionData, state: this.state });
		if (Object.keys(updated).length !== 0) {
			this.setGlobalState(updated);
		}
	}

	render() {
		return (
			<div>
				<div className={`chart-wrapper ${this.siteProps.isPaused ? 'paused' : ''}`}>
					<TrackersChart
						paths={this.chartData.arcs}
						num={this.chartData.sum}
					/>
					<p>{this.siteProps.hostName}</p>
					<p className="trackers-blocked-num">
						<span className="number">
							{this.siteProps.nTrackersBlocked}
							{' '}
						</span>
						Trackers blocked
					</p>
				</div>
				<Tabs>
					<Tab tabLabel="Overview" linkClassName="custom-link">
						<Overview categories={this.siteCategories} />
						<FixedMenu panel={this.state.panel} cliqzModuleData={this.state.cliqzModuleData} />
					</Tab>

					<Tab tabLabel="Site Trackers" linkClassName="custom-link">
						<SiteTrackers categories={this.siteCategories} />
					</Tab>

					<Tab tabLabel="Global Trackers" linkClassName="custom-link">
						<GlobalTrackers categories={this.globalCategories} />
					</Tab>
				</Tabs>
			</div>
		);
	}
}

Panel.childContextTypes = {
	siteProps: PropTypes.shape,
	callGlobalAction: PropTypes.func,
};
