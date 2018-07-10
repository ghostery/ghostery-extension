/**
 * Summary Component
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

import React, { Component } from 'react';
import ClassNames from 'classnames';
import { sendMessage } from '../utils/msg';
import globals from '../../../src/classes/Globals';
import {
	CliqzFeatures,
	DonutGraph,
	GhosteryFeatures,
	NotScanned,
	PauseButton
} from './BuildingBlocks';

const { IS_CLIQZ } = globals;
const AB_PAUSE_BUTTON = false;

/**
 * @class Implements the Summary View, which is displayed as the entire panel
 * as the Simple View or condensed as part of the Detailed View. Summary View
 * displays site information, aggregate tracker data, and options for toggling
 * Ghostery and Cliqz features.
 * @memberof PanelClasses
 */
class Summary extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			trackerLatencyTotal: '',
			disableBlocking: false,
			abPause: AB_PAUSE_BUTTON,
		};

		// Event Bindings
		this.toggleExpert = this.toggleExpert.bind(this);
		this.clickPauseButton = this.clickPauseButton.bind(this);
		this.clickDonut = this.clickDonut.bind(this);
		this.clickTrackersCount = this.clickTrackersCount.bind(this);
		this.clickTrackersBlocked = this.clickTrackersBlocked.bind(this);
		this.clickSitePolicy = this.clickSitePolicy.bind(this);
		this.clickCliqzFeature = this.clickCliqzFeature.bind(this);
		this.clickMapTheseTrackers = this.clickMapTheseTrackers.bind(this);

		this.pauseOptions = [
			{ name: t('pause_30_min'), name_condensed: t('pause_30_min_condensed'), val: 30 },
			{ name: t('pause_1_hour'), name_condensed: t('pause_1_hour_condensed'), val: 60 },
			{ name: t('pause_24_hours'), name_condensed: t('pause_24_hours_condensed'), val: 1440 },
		];
	}

	/**
	 * Lifecycle event
	 */
	componentWillMount() {
		this.setTrackerLatency(this.props);
		this.updateSiteNotScanned(this.props);
	}

	/**
	 * Lifecycle event
	 */
	componentDidMount() {
		this.props.actions.getCliqzModuleData();
	}

	/**
	 * Lifecycle event
	 */
	componentWillReceiveProps(nextProps) {
		this.setTrackerLatency(nextProps);
		this.updateSiteNotScanned(nextProps);

		// Set page title for Firefox for Android
		window.document.title = `Ghostery's findings for ${this.props.pageUrl}`;
	}

	/**
	 * Calculates total tracker latency and sets it to state
	 * @param {Object} props Summary's props, either this.props or nextProps.
	 */
	setTrackerLatency(props) {
		const { performanceData } = props;
		let pageLatency = '';
		let unfixedLatency = '';

		// calculate and display page speed
		if (performanceData) {
			const { timing } = performanceData;
			// format number of decimal places to use
			unfixedLatency = Number(timing.loadEventEnd - timing.navigationStart) / 1000;
			if (unfixedLatency >= 100) { // > 100 no decimal
				pageLatency = (Number(timing.loadEventEnd - timing.navigationStart) / 1000).toFixed();
			} else if (unfixedLatency >= 10 && unfixedLatency < 100) { // 100 > 10 use one decimal
				pageLatency = (Number(timing.loadEventEnd - timing.navigationStart) / 1000).toFixed(1);
			} else if (unfixedLatency < 10) { // < 10s use two decimals
				pageLatency = (Number(timing.loadEventEnd - timing.navigationStart) / 1000).toFixed(2);
			}
			this.setState({ trackerLatencyTotal: `${pageLatency}` });
		}
	}

	/**
	 * Disable controls when Ghostery cannot or has not yet scanne a page.
	 * @param {Object} props Summary's props, either this.props or nextProps.
	 */
	updateSiteNotScanned(props) {
		const { siteNotScanned, categories } = props;
		const pageUrl = props.pageUrl || '';

		if (siteNotScanned || !categories || pageUrl.search('http') === -1) {
			this.setState({ disableBlocking: true });
		} else {
			this.setState({ disableBlocking: false });
		}
	}

	/**
	 * Handles clicking on the Pause Ghostery button.
	 * @param  {Int} time Optional number of minutes after which Ghostery should un-pause.
	 */
	clickPauseButton(time) {
		const ghosteryPaused = this.props.paused_blocking;
		const text = ghosteryPaused ? t('alert_ghostery_resumed') : t('alert_ghostery_paused');
		sendMessage('ping', ghosteryPaused ? 'resume' : 'pause');
		if (typeof time === 'number') {
			sendMessage('ping', 'pause_snooze');
		}

		this.props.actions.updateGhosteryPaused({
			ghosteryPaused: (typeof time === 'number' ? true : !ghosteryPaused),
			time: time * 60000,
		});
		this.props.actions.filterTrackers({ type: 'trackers', name: 'all' });
		this.props.actions.showNotification({
			updated: 'ghosteryPaused',
			reload: true,
			text,
		});
	}

	/**
	 * Handles clicking on any part of the Donut graph
	 * @param  {Object} data Properties of the click and resulting filter
	 */
	clickDonut(data) {
		if (!this.props.is_expert) {
			this.toggleExpert();
		}
		this.props.actions.filterTrackers(data);
	}

	/**
	 * Handles clicking on the total trackers count on the condensed view
	 */
	clickTrackersCount() {
		this.props.actions.filterTrackers({ type: 'trackers', name: 'all' });
	}

	/**
	 * Toggle between Simple and Detailed Views.
	 */
	toggleExpert() {
		this.props.actions.toggleExpert();
		if (this.props.is_expert) {
			this.props.history.push('/');
		} else {
			this.props.history.push('/detail');
		}
	}

	/**
	 * Handles clicking on Trackers Blocked. Triggers a filter action
	 */
	clickTrackersBlocked() {
		const { sitePolicy, is_expert } = this.props;
		if (is_expert) {
			if (sitePolicy === 1) {
				this.props.actions.filterTrackers({ type: 'trackers', name: 'all' });
			} else {
				this.props.actions.filterTrackers({ type: 'trackers', name: 'blocked' });
			}
		}
	}


	/**
	 * Handles clicking on Ghostery Features: Trust Site, Restrict Site, Custom Settings
	 * @param  {String} button The button that was clicked: trust, restrict, custom
	 */
	clickSitePolicy(button) {
		const { paused_blocking, sitePolicy } = this.props;
		let type;
		let text;
		let classes;

		if (this.state.disableBlocking || paused_blocking) {
			return;
		}

		if (button === 'trust' || (button === 'custom' && sitePolicy === 2)) {
			sendMessage('ping', 'trust_site');
			type = 'whitelist';
			text = (sitePolicy === 2) ? t('alert_site_trusted_off') : t('alert_site_trusted');
			classes = (sitePolicy === 2) ? 'warning' : 'success';
		} else if (button === 'restrict' || (button === 'custom' && sitePolicy === 1)) {
			sendMessage('ping', 'restrict_site');
			type = 'blacklist';
			text = (sitePolicy === 1) ? t('alert_site_restricted_off') : t('alert_site_restricted');
			classes = (sitePolicy === 1) ? 'warning' : 'alert';
		} else {
			return;
		}

		this.props.actions.updateSitePolicy({
			type,
		});

		this.props.actions.filterTrackers({ type: 'trackers', name: 'all' });

		this.props.actions.showNotification({
			updated: type,
			reload: true,
			classes,
			text,
		});
	}

	/**
	 * Handles clicking on Cliqz Features: AntiTracking, AdBlocking, SmartBlocking
	 * @param {Object} options options including:
	 * 													feature: enable_anti_tracking, enable_ad_block, enable_smart_block
	 * 													status: whether the feature should be turned on or off
	 * 													text: the text for the notification.
	 */
	clickCliqzFeature(options) {
		const { feature, status, text } = options;
		this.props.actions.showNotification({
			updated: feature,
			reload: true,
			text,
		});
		this.props.actions.toggleCliqzFeature(feature, status);
	}

	/**
	 * Handles clicking on Map These Trackers, which opens Evidon page.
	 */
	clickMapTheseTrackers() {
		if (this.state.disableBlocking) { return; }
		sendMessage('ping', 'live_scan');
		sendMessage('openNewTab', {
			url: `https:\/\/www.evidon.com/solutions/trackermap/?url=${this.props.pageUrl}&utm_source=Ghostery&utm_medium=referral&utm_term=&utm_content=&utm_campaign=GhosteryMapTrackers`,
			tab_id: +this.state.tab_id,
			become_active: true,
		});
		window.close(); // for firefox
	}

	/**
	* React's required render function. Returns JSX
	* @return {JSX} JSX for rendering the Summary View of the panel
	*/
	render() {
		const { abPause } = this.state;
		const { is_expert, is_expanded, paused_blocking } = this.props;
		const showCondensed = is_expert && is_expanded;
		const antiTrackUnsafe = this.props.antiTracking && this.props.antiTracking.totalUnsafeCount || 0;
		const adBlockBlocked = this.props.adBlock && this.props.adBlock.totalCount || 0;

		const summaryClassNames = ClassNames('', {
			expert: is_expert,
			condensed: showCondensed,
			'ab-pause': abPause,
		});

		const blockedTrackersClassNames = ClassNames('blocked-trackers', {
			clickable: is_expert,
			paused: paused_blocking,
		});
		const pageLoadClassNames = ClassNames('page-load', {
			fast: +this.state.trackerLatencyTotal < 5,
			slow: +this.state.trackerLatencyTotal > 10,
		});
		const mapTheseTrackersClassNames = ClassNames('map-these-trackers', {
			clickable: !this.state.disableBlocking,
			'not-clickable': this.state.disableBlocking
		});

		return (
			<div id="content-summary" className={summaryClassNames}>
				{abPause && (
					<div className="pause-button-container">
						<PauseButton
							isPaused={this.props.paused_blocking}
							isPausedTimeout={this.props.paused_blocking_timeout}
							clickPause={this.clickPauseButton}
							dropdownItems={this.pauseOptions}
							isAbPause={abPause}
							isCentered={is_expert}
							isCondensed={showCondensed}
						/>
					</div>
				)}

				{this.state.disableBlocking && !showCondensed && (
					<NotScanned isSmall={is_expert} />
				)}

				{abPause && !this.state.disableBlocking && is_expert && !showCondensed && (
					<div className="page-host">
						{this.props.pageHost}
					</div>
				)}

				{!this.state.disableBlocking && !showCondensed && (
					<div className="donut-graph-container">
						<DonutGraph
							categories={this.props.categories}
							renderRedscale={this.props.sitePolicy === 1}
							renderGreyscale={this.props.paused_blocking}
							totalCount={this.props.trackerCounts.allowed + this.props.trackerCounts.blocked + antiTrackUnsafe + adBlockBlocked || 0}
							ghosteryFeatureSelect={this.props.sitePolicy}
							isSmall={is_expert}
							clickDonut={this.clickDonut}
						/>
					</div>
				)}
				{!this.state.disableBlocking && showCondensed && (
					<div className="total-tracker-count clickable" onClick={this.clickTrackersCount}>
						{this.props.trackerCounts.allowed + this.props.trackerCounts.blocked || 0}
					</div>
				)}

				{!this.state.disableBlocking && (!abPause || !is_expert) && !showCondensed && (
					<div className="page-host">
						{this.props.pageHost}
					</div>
				)}

				{!this.state.disableBlocking && (
					<div className="page-stats">
						<div className={blockedTrackersClassNames} onClick={this.clickTrackersBlocked}>
							<span className="text">{t('trackers_blocked')} </span>
							<span className="value">
								{this.props.trackerCounts.blocked + antiTrackUnsafe + adBlockBlocked || 0}
							</span>
						</div>
						<div className={pageLoadClassNames}>
							<span className="text">{t('page_load')} </span>
							<span className="value">
								{this.state.trackerLatencyTotal ? `${this.state.trackerLatencyTotal} ${t('settings_seconds')}` : '-'}
							</span>
						</div>
					</div>
				)}

				{this.state.disableBlocking && is_expert && showCondensed && (
					<div className="not-scanned-expert-condensed-space-taker" />
				)}

				<div className="ghostery-features-container">
					<GhosteryFeatures
						clickButton={this.clickSitePolicy}
						sitePolicy={this.props.sitePolicy}
						isAbPause={abPause}
						isStacked={is_expert}
						isInactive={this.props.paused_blocking || this.state.disableBlocking}
						isCondensed={showCondensed}
					/>

					{!abPause && (
						<PauseButton
							isPaused={this.props.paused_blocking}
							isPausedTimeout={this.props.paused_blocking_timeout}
							clickPause={this.clickPauseButton}
							dropdownItems={this.pauseOptions}
							isAbPause={abPause}
							isCentered={is_expert}
							isCondensed={showCondensed}
						/>
					)}
				</div>

				<div className="cliqz-features-container">
					<CliqzFeatures
						clickButton={this.clickCliqzFeature}
						antiTrackingActive={this.props.enable_anti_tracking}
						antiTracking={this.props.antiTracking}
						adBlockingActive={this.props.enable_ad_block}
						adBlocking={this.props.adBlock}
						smartBlockingActive={this.props.enable_smart_block}
						smartBlocking={this.props.smartBlock}
						isInactive={this.props.paused_blocking || this.props.sitePolicy || this.state.disableBlocking || IS_CLIQZ}
						isSmaller={is_expert}
						isCondensed={showCondensed}
					/>
				</div>

				{is_expert && !showCondensed && (
					<div className={mapTheseTrackersClassNames} onClick={this.clickMapTheseTrackers}>
						{ t('summary_map_these_trackers') }
					</div>
				)}

			</div>
		);
	}
}

export default Summary;
