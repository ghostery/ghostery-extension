/**
 * Panel Android Component
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
import ClassNames from 'classnames';
import Tabs from './content/Tabs';
import Tab from './content/Tab';
import OverviewTab from './content/OverviewTab';
import {
	NotScanned,
	DonutGraph,
	GhosteryFeature,
	PauseButton,
	CliqzFeature
} from '../../panel/components/BuildingBlocks';
import {
	getPanelData, getSummaryData, getSettingsData, getBlockingData
} from '../actions/panelActions';
import getCliqzModuleData from '../actions/cliqzActions';
import handleAllActions from '../actions/handler';
import globals from '../../../src/classes/Globals';

const {
	IS_CLIQZ,
	WHITELISTED, BLACKLISTED
} = globals;

class PanelAndroid extends React.Component {
	constructor(props) {
		super(props);

		// ToDo: Maybe do this better
		this.state = {
			panel: {},
			summary: {},
			settings: {},
			blocking: {},
			cliqzModuleData: {},
		};

		this.pauseOptions = [
			{ name: t('pause_30_min'), val: 30 },
			{ name: t('pause_1_hour'), val: 60 },
			{ name: t('pause_24_hours'), val: 1440 },
		];
	}

	componentDidMount() {
		const tabId = new URLSearchParams(window.location.search).get('tabId');
		// ToDo: Do this better as well
		this.setPanelState(tabId);
		this.setSummaryState(tabId);
		this.setSettingsState();
		this.setBlockingState(tabId);
		this.setCliqzDataState(tabId);
	}

	get siteNotScanned() {
		const { blocking, summary } = this.state;
		const { pageUrl = '', siteNotScanned } = blocking;
		const { categories } = summary;

		if (siteNotScanned || !categories || pageUrl.search(/http|chrome-extension|moz-extension|ms-browser-extension|newtab|chrome:\/\/startpage\//) === -1) {
			return true;
		}
		return false;
	}

	get adBlockBlocked() {
		const { cliqzModuleData, panel } = this.state;
		const { adBlock } = cliqzModuleData;
		const { enable_ad_block } = panel;

		return (enable_ad_block && adBlock && adBlock.trackerCount) || 0;
	}

	get antiTrackUnsafe() {
		const { cliqzModuleData, panel } = this.state;
		const { antiTracking } = cliqzModuleData;
		const { enable_anti_tracking } = panel;

		return (enable_anti_tracking && antiTracking && antiTracking.trackerCount) || 0;
	}

	get trackersFound() {
		const { summary } = this.state;
		const { trackerCounts } = summary;

		return (trackerCounts && (trackerCounts.allowed + trackerCounts.blocked)) || 0;
	}

	get smartBlockBlocked() {
		const { panel, summary } = this.state;
		const { smartBlock } = panel;
		const { trackerCounts = {} } = summary;

		let sbBlocked = (smartBlock && smartBlock.blocked && Object.keys(smartBlock.blocked).length) || 0;
		if (sbBlocked === trackerCounts.sbBlocked) {
			sbBlocked = 0;
		}

		return sbBlocked;
	}

	get smartBlockAllowed() {
		const { panel, summary } = this.state;
		const { smartBlock } = panel;
		const { trackerCounts = {} } = summary;

		let sbAllowed = (smartBlock && smartBlock.unblocked && Object.keys(smartBlock.unblocked).length) || 0;
		if (sbAllowed === trackerCounts.sbAllowed) {
			sbAllowed = 0;
		}

		return sbAllowed;
	}

	get smartBlockAdjust() {
		const { panel } = this.state;
		const { enable_smart_block } = panel;

		return enable_smart_block && ((this.smartBlockBlocked - this.smartBlockAllowed) || 0);
	}

	get trackersBlockedCount() {
		const { summary } = this.state;
		const { paused_blocking, sitePolicy, trackerCounts = {} } = summary;

		let totalTrackersBlockedCount;
		if (paused_blocking || sitePolicy === WHITELISTED) {
			totalTrackersBlockedCount = 0;
		} else if (sitePolicy === BLACKLISTED) {
			totalTrackersBlockedCount = trackerCounts.blocked + trackerCounts.allowed || 0;
		} else {
			totalTrackersBlockedCount = trackerCounts.blocked + this.smartBlockAdjust || 0;
		}

		return totalTrackersBlockedCount;
	}

	get requestsModifiedCount() {
		return this.adBlockBlocked + this.antiTrackUnsafe;
	}

	setPanelState = (tabId) => {
		getPanelData(tabId).then((data) => {
			this.setState({ panel: data.panel });
		});
	}

	setSummaryState = (tabId) => {
		getSummaryData(tabId).then((data) => {
			this.setState({ summary: data });
		});
	}

	setSettingsState = () => {
		getSettingsData().then((data) => {
			this.setState({ settings: data });
		});
	}

	setBlockingState = (tabId) => {
		getBlockingData(tabId).then((data) => {
			this.setState({ blocking: data });
		});
	}

	setCliqzDataState = (tabId) => {
		getCliqzModuleData(tabId).then((data) => {
			this.setState({ cliqzModuleData: data });
		});
	}

	setGlobalState = (updated) => {
		const newState = {};
		Object.keys(updated).forEach((key) => {
			newState[key] = { ...this.state[key], ...updated[key] }; // eslint-disable-line react/destructuring-assignment
		});

		this.setState(newState);
	}

	callGlobalAction = ({ actionName, actionData = {} }) => {
		const updated = handleAllActions({ actionName, actionData, state: this.state });
		if (Object.keys(updated).length !== 0) {
			this.setGlobalState(updated);
		}
	}

	handleTrustButtonClick = () => {
		this.callGlobalAction({
			actionName: 'handleTrustButtonClick',
		});
	}

	handleRestrictButtonClick = () => {
		this.callGlobalAction({
			actionName: 'handleRestrictButtonClick',
		});
	}

	handlePauseButtonClick = () => {
		this.callGlobalAction({
			actionName: 'handlePauseButtonClick',
		});
	}

	handleCliqzFeatureClick = ({ feature, status }) => {
		this.callGlobalAction({
			actionName: 'cliqzFeatureToggle',
			actionData: {
				currentState: status,
				type: feature,
			},
		});
	}

	_renderNotScanned() {
		if (this.siteNotScanned) {
			return (
				<NotScanned isSmall />
			);
		}

		return false;
	}

	_renderDonut() {
		const {
			blocking,
			cliqzModuleData,
			summary,
		} = this.state;
		const { categories } = blocking;
		const { adBlock, antiTracking } = cliqzModuleData;
		const { sitePolicy, paused_blocking } = summary;

		return (
			<DonutGraph
				categories={categories}
				adBlock={adBlock}
				antiTracking={antiTracking}
				renderRedscale={sitePolicy === BLACKLISTED}
				renderGreyscale={paused_blocking}
				totalCount={this.requestsModifiedCount + this.trackersFound}
				ghosteryFeatureSelect={sitePolicy}
			/>
		);
	}

	_renderPageHost() {
		const { summary } = this.state;
		const { pageHost = 'page_host' } = summary;
		const pageHostClassNames = ClassNames('OverviewTab__PageHostText', {
			invisible: (pageHost.split('.').length < 2),
		});

		return (
			<span className={pageHostClassNames}>{pageHost}</span>
		);
	}

	_renderTotalTrackersBlocked() {
		return (
			<div className="OverviewTab__PageStat">
				<span>
					{t('trackers_blocked')}
					{' '}
				</span>
				<span className="OverviewTab__PageStat--red">
					{this.trackersBlockedCount}
				</span>
			</div>
		);
	}

	_renderTotalRequestsModified() {
		return (
			<div className="OverviewTab__PageStat">
				<span>
					{t('requests_modified')}
					{' '}
				</span>
				<span className="OverviewTab__PageStat--blue">
					{this.requestsModifiedCount}
				</span>
			</div>
		);
	}

	_renderGhosteryFeatures() {
		const { summary } = this.state;
		const { paused_blocking, paused_blocking_timeout, sitePolicy } = summary;
		const disableBlocking = this.siteNotScanned;

		return (
			<div className="flex-container flex-dir-column align-middle">
				<div>
					<GhosteryFeature
						handleClick={this.handleTrustButtonClick}
						type="trust"
						sitePolicy={sitePolicy}
						blockingPausedOrDisabled={paused_blocking || disableBlocking}
						showText
						tooltipPosition={false}
						short
						narrow={false}
					/>
				</div>
				<div className="OverviewTab__GhosteryFeature--ExtraMargins">
					<GhosteryFeature
						handleClick={this.handleRestrictButtonClick}
						type="restrict"
						sitePolicy={sitePolicy}
						blockingPausedOrDisabled={paused_blocking || disableBlocking}
						showText
						tooltipPosition={false}
						short
						narrow={false}
					/>
				</div>
				<div>
					<PauseButton
						isPaused={paused_blocking}
						isPausedTimeout={paused_blocking_timeout}
						clickPause={this.handlePauseButtonClick}
						dropdownItems={this.pauseOptions}
						isCentered
						isCondensed={false}
					/>
				</div>
			</div>
		);
	}

	_renderCliqzFeatures() {
		const { panel, summary } = this.state;
		const { enable_anti_tracking, enable_ad_block, enable_smart_block } = panel;
		const { paused_blocking, sitePolicy } = summary;
		const disableBlocking = this.siteNotScanned;

		return (
			<div>
				<div className="OverviewTab__CliqzFeature">
					<CliqzFeature
						clickButton={this.handleCliqzFeatureClick}
						type="anti_track"
						active={enable_anti_tracking}
						cliqzInactive={paused_blocking || sitePolicy || disableBlocking || IS_CLIQZ}
						isSmaller
					/>
				</div>
				<div className="OverviewTab__CliqzFeature">
					<CliqzFeature
						clickButton={this.handleCliqzFeatureClick}
						type="ad_block"
						active={enable_ad_block}
						cliqzInactive={paused_blocking || sitePolicy || disableBlocking || IS_CLIQZ}
						isSmaller
					/>
				</div>
				<div className="OverviewTab__CliqzFeature">
					<CliqzFeature
						clickButton={this.handleCliqzFeatureClick}
						type="smart_block"
						active={enable_smart_block}
						cliqzInactive={paused_blocking || sitePolicy || disableBlocking}
						isSmaller
					/>
				</div>
			</div>
		);
	}

	render() {
		return (
			<div>
				<Tabs>
					<Tab tabLabel={t('android_tab_overview')} linkClassName="Tab__label">
						<OverviewTab
							notScanned={this._renderNotScanned()}
							donutGraph={this._renderDonut()}
							pageHost={this._renderPageHost()}
							trackersBlocked={this._renderTotalTrackersBlocked()}
							requestsModified={this._renderTotalRequestsModified()}
							ghosteryFeatures={this._renderGhosteryFeatures()}
							cliqzFeatures={this._renderCliqzFeatures()}
						/>
					</Tab>

					<Tab tabLabel={t('android_tab_site_blocking')} linkClassName="Tab__label">
						Bloink Fallon
					</Tab>

					<Tab tabLabel={t('android_tab_global_blocking')} linkClassName="Tab__label">
						Gerald Fascini
					</Tab>
				</Tabs>
			</div>
		);
	}
}

export default PanelAndroid;
