/**
 * Summary Component
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
import ReactSVG from 'react-svg';
import ClassNames from 'classnames';
import Tooltip from './Tooltip';
import NavButton from './BuildingBlocks/NavButton';
import { DynamicUIPortContext } from '../contexts/DynamicUIPortContext';
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
	static contextType = DynamicUIPortContext;

	constructor(props) {
		super(props);
		this.state = {
			trackerLatencyTotal: 0,
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
		this.handlePortMessage = this.handlePortMessage.bind(this);

		this.pauseOptions = [
			{ name: t('pause_30_min'), name_condensed: t('pause_30_min_condensed'), val: 30 },
			{ name: t('pause_1_hour'), name_condensed: t('pause_1_hour_condensed'), val: 60 },
			{ name: t('pause_24_hours'), name_condensed: t('pause_24_hours_condensed'), val: 1440 },
		];
	}

	/**
	 * Lifecycle event
	 */
	componentDidMount() {
		this.setTrackerLatency(this.props);
		this.updateSiteNotScanned(this.props);

		this._dynamicUIPort = this.context;
		this._dynamicUIPort.onMessage.addListener(this.handlePortMessage);
		this._dynamicUIPort.postMessage({ name: 'SummaryComponentDidMount' });
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
	 * Lifecycle event
	 */
	componentWillUnmount() {
		this._dynamicUIPort.postMessage({ name: 'SummaryComponentWillUnmount' });
		this._dynamicUIPort.onMessage.removeListener(this.handlePortMessage);
	}

	/**
	 * Calculates total tracker latency and sets it to state
	 * @param {Object} props Summary's props, either this.props or nextProps.
	 */
	setTrackerLatency(props) {
		const { performanceData } = props;
		let pageLatency = 0;
		let unfixedLatency = 0;

		// calculate and display page speed
		if (performanceData) {
			const { timing } = performanceData;
			// format number of decimal places to use
			unfixedLatency = Number(timing.loadEventEnd - timing.navigationStart) / 1000;
			if (unfixedLatency >= 100) { // > 100 no decimal
				pageLatency = (Number(timing.loadEventEnd - timing.navigationStart) / 1000).toFixed();
			} else if (unfixedLatency >= 10 && unfixedLatency < 100) { // 100 > 10 use one decimal
				pageLatency = (Number(timing.loadEventEnd - timing.navigationStart) / 1000).toFixed(1);
			} else if (unfixedLatency < 10 && unfixedLatency >= 0) { // < 10s use two decimals
				pageLatency = (Number(timing.loadEventEnd - timing.navigationStart) / 1000).toFixed(2);
			}
			this.setState({ trackerLatencyTotal: pageLatency });
		// reset page load value if page is reloaded while panel is open
		} else if (this.props.performanceData && !performanceData) {
			this.setState({ trackerLatencyTotal: pageLatency });
		}
	}

	/**
	 * Handles messages from dynamic UI port to background
	 */
	handlePortMessage(msg) {
		if (msg.to !== 'summary' || !msg.body) { return; }

		const { body } = msg;

		if (body.adblock || body.antitracking) {
			this.props.actions.updateCliqzModuleData(body);
		} else {
			this.props.actions.updateSummaryData(body);
		}
	}

	/**
	 * Disable controls when Ghostery cannot or has not yet scanned a page.
	 * @param {Object} props Summary's props, either this.props or nextProps.
	 */
	updateSiteNotScanned(props) {
		const { siteNotScanned, categories } = props;
		const pageUrl = props.pageUrl || '';

		if (siteNotScanned || !categories || pageUrl.search(/http|chrome-extension|moz-extension|ms-browser-extension|newtab|chrome:\/\/startpage\//) === -1) {
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

	clickRequestsModified() {
		console.error('Summary#clickRequestsModified invoked');
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
	 * Handles clicking on the green upgrade banner or gold subscriber badge
	 */
	clickUpgradeBannerOrGoldPlusIcon = () => {
		// TODO check whether this is the message we want to be sending now
		sendMessage('ping', 'plus_panel_from_badge');
		const { user } = this.props;
		const plusSubscriber = user && user.subscriptionsPlus;
		this.props.history.push(plusSubscriber ? '/subscription/info' : `/subscribe/${!!user}`);
	}

	/**
	* React's required render function. Returns JSX
	* @return {JSX} JSX for rendering the Summary View of the panel
	*/
	render() {
		const { abPause } = this.state;
		const {
			is_expert,
			is_expanded,
			enable_anti_tracking,
			enable_ad_block,
			enable_smart_block,
			antiTracking,
			adBlock,
			smartBlock,
			paused_blocking,
			sitePolicy,
			trackerCounts,
			user
		} = this.props;
		const plusSubscriber = user && user.subscriptionsPlus;
		const showCondensed = is_expert && is_expanded;
		const antiTrackUnsafe = enable_anti_tracking && antiTracking && antiTracking.totalUnsafeCount || 0;
		const adBlockBlocked = enable_ad_block && adBlock && adBlock.totalCount || 0;
		let sbBlocked = smartBlock && smartBlock.blocked && Object.keys(smartBlock.blocked).length || 0;
		const pageHost = this.props.pageHost || 'page_host';
		const hidePageHost = (pageHost.split('.').length < 2);
		if (sbBlocked === trackerCounts.sbBlocked) {
			sbBlocked = 0;
		}
		let sbAllowed = smartBlock && smartBlock.unblocked && Object.keys(smartBlock.unblocked).length || 0;
		if (sbAllowed === trackerCounts.sbAllowed) {
			sbAllowed = 0;
		}
		const sbAdjust = enable_smart_block && (sbBlocked - sbAllowed) || 0;

		const summaryClassNames = ClassNames('', {
			expert: is_expert,
			condensed: showCondensed,
			'ab-pause': abPause,
		});

		const blockedTrackersClassNames = ClassNames('blocked-trackers', {
			clickable: is_expert,
		});
		const modifiedRequestsClassNames = ClassNames('modified-requests', {
			clickable: is_expert,
		});
		const pageLoadClassNames = ClassNames('page-load', {
			fast: this.state.trackerLatencyTotal < 5,
			slow: this.state.trackerLatencyTotal > 10,
		});

		const summaryViewStatsButton = ClassNames('stats-button', {
			hide: is_expert
		});

		let trackersBlockedCount;
		if (paused_blocking || sitePolicy === 2) {
			trackersBlockedCount = 0;
		} else if (sitePolicy === 1) {
			trackersBlockedCount = trackerCounts.blocked + trackerCounts.allowed + antiTrackUnsafe + adBlockBlocked || 0;
		} else {
			trackersBlockedCount = trackerCounts.blocked + antiTrackUnsafe + adBlockBlocked + sbAdjust || 0;
		}

		const pageHostClassNames = ClassNames('page-host', {
			invisible: hidePageHost
		});

		const pauseButtonComponent = (
			<PauseButton
				isPaused={this.props.paused_blocking}
				isPausedTimeout={this.props.paused_blocking_timeout}
				clickPause={this.clickPauseButton}
				dropdownItems={this.pauseOptions}
				isAbPause={abPause}
				isCentered={is_expert}
				isCondensed={showCondensed}
			/>);

		const pauseButton = (
			<div className="pause-button-container">
				pauseButtonComponent
			</div>
		);

		const totalTrackersFound = (
			<div className="total-tracker-count clickable" onClick={this.clickTrackersCount}>
				<span className="summary-total-tracker-count g-tooltip">
					{this.props.trackerCounts.allowed + this.props.trackerCounts.blocked + antiTrackUnsafe + adBlockBlocked || 0}
					<Tooltip
						header={t('panel_tracker_total_tooltip')}
						position="right"
					/>
				</span>
			</div>
		);

		const donut = (
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
		);

		const totalTrackersBlocked = (
			<div className={blockedTrackersClassNames} onClick={this.clickTrackersBlocked}>
				<span className="text">{t('trackers_blocked')} </span>
				<span className="value">
					{trackersBlockedCount}
				</span>
			</div>
		);

		const totalRequestsModified = (
			<div className={modifiedRequestsClassNames} onClick={this.clickRequestsModified}>
				<span className="text">Bananas Modified </span>
				<span className="value">
					{86}
				</span>
			</div>
		);

		const pageLoadTime = (
			<div className={pageLoadClassNames}>
				<span className="text">{t('page_load')} </span>
				<span className="value">
					{this.state.trackerLatencyTotal ? `${this.state.trackerLatencyTotal} ${t('settings_seconds')}` : '-'}
				</span>
			</div>
		);

		// Trust, Restrict, Pause
		const ghosteryFeatures = (
			<div className="ghostery-features-container">
				<GhosteryFeatures
					clickButton={this.clickSitePolicy}
					sitePolicy={this.props.sitePolicy}
					isAbPause={abPause}
					isStacked={is_expert}
					isInactive={this.props.paused_blocking || this.state.disableBlocking}
					isCondensed={showCondensed}
				/>

				{!abPause && pauseButtonComponent}
			</div>
		);

		// Enhanced Anti-Tracking, Enhanced Ad Blocking, Smart Blocking
		const cliqzFeatures = (
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
		);

		const statsNavButton = (<NavButton path="/stats" imagePath="../../app/images/panel/graph.svg" classNames={summaryViewStatsButton} />);

		const plusUpgradeBannerOrSubscriberIcon = (
			<div onClick={this.clickUpgradeBannerOrGoldPlusIcon}>
				{plusSubscriber &&
					<ReactSVG path="/app/images/panel/gold-plus-icon.svg" className="gold-plus-icon" />
				}

				{!plusSubscriber && is_expert &&
					<div>
						<ReactSVG path="/app/images/panel/green-upgrade-banner-small.svg" className="green-upgrade-banner" />
						<span className="green-upgrade-banner-text-small">{t('subscription_upgrade_to')}</span>
					</div>
				}

				{!plusSubscriber && !is_expert &&
					<div>
						<ReactSVG path="/app/images/panel/green-upgrade-banner.svg" className="green-upgrade-banner" />
						<span className="green-upgrade-banner-text">{t('subscription_upgrade_to')}</span>
					</div>
				}
			</div>
		);

		return (
			<div id="content-summary" className={summaryClassNames}>
				{abPause && pauseButton}

				{!showCondensed && this.state.disableBlocking && (<NotScanned isSmall={is_expert} />)}
				{!showCondensed && abPause && !this.state.disableBlocking && is_expert && (
					<div className={pageHostClassNames}>
						{pageHost}
					</div>
				)}
				{!showCondensed && !this.state.disableBlocking && donut}
				{!showCondensed && !this.state.disableBlocking && (!abPause || !is_expert) && (
					<div className={pageHostClassNames}>
						{pageHost}
					</div>
				)}

				{showCondensed && !this.state.disableBlocking && totalTrackersFound}

				{!this.state.disableBlocking &&
					<div className="page-stats">
						{totalTrackersBlocked}
						{totalRequestsModified}
						{pageLoadTime}
					</div>
				}

				{showCondensed && this.state.disableBlocking && is_expert && (
					<div className="not-scanned-expert-condensed-space-taker" />
				)}

				{ghosteryFeatures}
				{cliqzFeatures}
				{statsNavButton}

				{!showCondensed && plusUpgradeBannerOrSubscriberIcon}
			</div>
		);
	}
}

export default Summary;
