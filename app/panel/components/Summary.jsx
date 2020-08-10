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
import { ReactSVG } from 'react-svg';
import ClassNames from 'classnames';
import Tooltip from './Tooltip';
import DynamicUIPortContext from '../contexts/DynamicUIPortContext';
import { sendMessage } from '../utils/msg';
import globals from '../../../src/classes/Globals';
import {
	CliqzFeature,
	DonutGraph,
	GhosteryFeature,
	NotScanned,
	PauseButton
} from './BuildingBlocks';

const {
	IS_CLIQZ,
	BLACKLISTED, WHITELISTED,
} = globals;

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
		};

		// Event Bindings
		this.clickCliqzFeature = this.clickCliqzFeature.bind(this);
		this.clickDonut = this.clickDonut.bind(this);
		this.clickPauseButton = this.clickPauseButton.bind(this);
		this.clickSitePolicy = this.clickSitePolicy.bind(this);
		this.clickTrackersBlocked = this.clickTrackersBlocked.bind(this);
		this.clickTrackersCount = this.clickTrackersCount.bind(this);
		this.clickUpgradeBannerOrGoldPlusIcon = this.clickUpgradeBannerOrGoldPlusIcon.bind(this);
		this.showRewardsListView = this.showRewardsListView.bind(this);
		this.showStatsView = this.showStatsView.bind(this);
		this.toggleExpert = this.toggleExpert.bind(this);
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
	static getDerivedStateFromProps(nextProps) {
		const trackerLatencyTotal = Summary._computeTrackerLatency(nextProps);
		const disableBlocking = Summary._computeSiteNotScanned(nextProps);

		// Set page title for Firefox for Android
		window.document.title = `Ghostery's findings for ${nextProps.pageUrl}`;

		return { trackerLatencyTotal, disableBlocking };
	}

	/**
	 * Calculates total tracker latency
	 * @param {Object} props Summary's props, either this.props or nextProps.
	 */
	static _computeTrackerLatency(props) {
		const { performanceData } = props;
		let pageLatency = 0;

		// calculate and display page speed
		if (performanceData) {
			const { timing } = performanceData;
			const { loadEventEnd, navigationStart } = timing;
			// format number of decimal places to use
			const unfixedLatency = Number(loadEventEnd - navigationStart) / 1000;
			if (unfixedLatency >= 100) { // > 100 no decimal
				pageLatency = unfixedLatency.toFixed();
			} else if (unfixedLatency >= 10 && unfixedLatency < 100) { // 100 > 10 use one decimal
				pageLatency = unfixedLatency.toFixed(1);
			} else if (unfixedLatency < 10 && unfixedLatency >= 0) { // < 10s use two decimals
				pageLatency = unfixedLatency.toFixed(2);
			}
			return pageLatency;
			// reset page load value if page is reloaded while panel is open
		}
		return null;
	}

	/**
	 * Compute whether controls should be disabled.
	 * @param {Object} props Summary's props, either this.props or nextProps.
	 */
	static _computeSiteNotScanned(props) {
		const { siteNotScanned, categories } = props;
		const pageUrl = props.pageUrl || '';

		if (siteNotScanned || !categories || pageUrl.search(/http|chrome-extension|moz-extension|ms-browser-extension|newtab|chrome:\/\/startpage\//) === -1) {
			return true;
		}
		return false;
	}

	/**
	 * Lifecycle event
	 */
	componentDidMount() {
		this._setTrackerLatency(this.props);
		this._updateSiteNotScanned(this.props);

		this._dynamicUIPort = this.context;
		this._dynamicUIPort.onMessage.addListener(this.handlePortMessage);
		this._dynamicUIPort.postMessage({ name: 'SummaryComponentDidMount' });
	}

	/**
	 * Lifecycle event
	 */
	componentWillUnmount() {
		this._dynamicUIPort.postMessage({ name: 'SummaryComponentWillUnmount' });
		this._dynamicUIPort.onMessage.removeListener(this.handlePortMessage);
	}

	/**
	 * Handles clicking on Cliqz Features: AntiTracking, AdBlocking, SmartBlocking
	 * @param {Object} options options including:
	 * 													feature: enable_anti_tracking, enable_ad_block, enable_smart_block
	 * 													status: whether the feature should be turned on or off
	 * 													text: the text for the notification.
	 */
	clickCliqzFeature(options) {
		const { actions } = this.props;
		const { feature, status, text } = options;
		actions.showNotification({
			updated: feature,
			reload: true,
			text,
		});
		actions.toggleCliqzFeature(feature, status);
	}

	/**
	 * Handles clicking on any part of the Donut graph
	 * @param  {Object} data Properties of the click and resulting filter
	 */
	clickDonut(data) {
		const { actions, is_expert } = this.props;
		if (!is_expert) { this.toggleExpert(); }
		actions.filterTrackers(data);
	}

	/**
	 * Handles clicking on the Pause Ghostery button.
	 * @param  {number} time Optional number of minutes after which Ghostery should un-pause.
	 */
	clickPauseButton(time) {
		const { actions, paused_blocking } = this.props;
		const ghosteryPaused = paused_blocking;
		const text = ghosteryPaused ? t('alert_ghostery_resumed') : t('alert_ghostery_paused');
		sendMessage('ping', ghosteryPaused ? 'resume' : 'pause');
		if (typeof time === 'number') {
			sendMessage('ping', 'pause_snooze');
		}

		actions.updateGhosteryPaused({
			ghosteryPaused: (typeof time === 'number' ? true : !ghosteryPaused),
			time: time * 60000,
		});
		actions.filterTrackers({ type: 'trackers', name: 'all' });
		actions.showNotification({
			updated: 'ghosteryPaused',
			reload: true,
			text,
		});
	}

	/**
	 * Handles clicking on Ghostery Features: Trust Site, Restrict Site
	 * @param  {String} button The button that was clicked: trust, restrict
	 */
	clickSitePolicy(button) {
		const { actions, sitePolicy } = this.props;
		let type;
		let text;
		let classes;

		if (button === 'trust') {
			sendMessage('ping', 'trust_site');
			type = 'whitelist';
			text = (sitePolicy === WHITELISTED) ? t('alert_site_trusted_off') : t('alert_site_trusted');
			classes = (sitePolicy === WHITELISTED) ? 'warning' : 'success';
		} else if (button === 'restrict') {
			sendMessage('ping', 'restrict_site');
			type = 'blacklist';
			text = (sitePolicy === BLACKLISTED) ? t('alert_site_restricted_off') : t('alert_site_restricted');
			classes = (sitePolicy === BLACKLISTED) ? 'warning' : 'alert';
		} else {
			return;
		}

		actions.updateSitePolicy({
			type,
		});

		actions.filterTrackers({ type: 'trackers', name: 'all' });

		actions.showNotification({
			updated: type,
			reload: true,
			classes,
			text,
		});
	}

	/**
	 * Handles clicking on Trackers Blocked. Triggers a filter action
	 */
	clickTrackersBlocked() {
		const { actions, sitePolicy, is_expert } = this.props;

		if (!is_expert) { return; }

		if (sitePolicy === BLACKLISTED) {
			actions.filterTrackers({ type: 'trackers', name: 'all' });
		} else {
			actions.filterTrackers({ type: 'trackers', name: 'blocked' });
		}
	}

	/**
	 * Handles clicking on the total trackers count on the condensed view
	 */
	clickTrackersCount() {
		const { actions } = this.props;
		actions.filterTrackers({ type: 'trackers', name: 'all' });
	}

	/**
	 * Handles clicking on the green upgrade banner or gold subscriber badge
	 */
	clickUpgradeBannerOrGoldPlusIcon() {
		const { history, user } = this.props;
		sendMessage('ping', 'plus_panel_from_badge');

		history.push(this._hasPremiumAccess() || this._hasPlusAccess() ? '/subscription/info' : `/subscribe/${!!user}`);
	}

	/**
	 * Show the Rewards view
	 * Used to handle user clicking on the Rewards Navicon
	 */
	showRewardsListView() {
		this.toggleExpert('rewards/list');
	}

	/**
	 * Show the Stats view
	 * Used to handle user clicking on the Stats Navicon
	 */
	showStatsView() {
		const { history } = this.props;
		history.push('/stats');
	}

	/**
	 * Toggle between Simple and Detailed Views.
	 */
	toggleExpert(subview = 'blocking') {
		const { actions, history, is_expert } = this.props;
		actions.toggleExpert();
		if (is_expert) {
			history.push('/');
		} else {
			history.push(`/detail/${subview}`);
		}
	}

	/**
	 * Calculates total tracker latency and sets it to state
	 * @param {Object} props Summary's props, either this.props or nextProps.
	 */
	_setTrackerLatency(props) {
		const { performanceData } = this.props;
		const trackerLatencyTotal = Summary._computeTrackerLatency(props);

		if (props.performanceData || performanceData !== props.performanceData) {
			this.setState({ trackerLatencyTotal });
		}
	}

	/**
	 * Disable controls when Ghostery cannot or has not yet scanned a page.
	 * @param {Object} props Summary's props, either this.props or nextProps.
	 */
	_updateSiteNotScanned(props) {
		const disableBlocking = Summary._computeSiteNotScanned(props);
		this.setState({ disableBlocking });
	}

	/**
	 * Handles messages from dynamic UI port to background
	 * @param {Object}	msg		updated findings sent from the background by PanelData
	 */
	handlePortMessage(msg) {
		const { actions } = this.props;
		if (msg.to !== 'summary' || !msg.body) { return; }

		const { body } = msg;

		if (body.adBlock || body.antiTracking) {
			actions.updateCliqzModuleData(body);
		} else {
			actions.updateSummaryData(body);
		}
	}

	_hasPlusAccess() {
		const { user } = this.props;

		return user && user.plusAccess;
	}

	_hasPremiumAccess() {
		const { user } = this.props;

		return user && user.premiumAccess;
	}

	_pageHost() {
		const { pageHost } = this.props;
		return pageHost || 'page_host';
	}

	_hidePageHost(host = null) {
		const pageHost = host || this._pageHost();

		return (pageHost.split('.').length < 2);
	}

	_adBlockBlocked() {
		const {
			adBlock,
			enable_ad_block,
		} = this.props;

		return (enable_ad_block && adBlock && adBlock.trackerCount) || 0;
	}

	_antiTrackUnsafe() {
		const {
			antiTracking,
			enable_anti_tracking,
		} = this.props;

		return (enable_anti_tracking && antiTracking && antiTracking.trackerCount) || 0;
	}

	_requestsModifiedCount() {
		return this._antiTrackUnsafe() + this._adBlockBlocked();
	}

	_totalTrackersFound() {
		const { trackerCounts } = this.props;

		return (trackerCounts.allowed + trackerCounts.blocked + this._requestsModifiedCount()) || 0;
	}

	_sbBlocked() {
		const { smartBlock, trackerCounts } = this.props;

		let sbBlocked = (smartBlock && smartBlock.blocked && Object.keys(smartBlock.blocked).length) || 0;
		if (sbBlocked === trackerCounts.sbBlocked) {
			sbBlocked = 0;
		}

		return sbBlocked;
	}

	_sbAllowed() {
		const { smartBlock, trackerCounts } = this.props;

		let sbAllowed = (smartBlock && smartBlock.unblocked && Object.keys(smartBlock.unblocked).length) || 0;
		if (sbAllowed === trackerCounts.sbAllowed) {
			sbAllowed = 0;
		}

		return sbAllowed;
	}

	_sbAdjust() {
		const { enable_smart_block } = this.props;

		return enable_smart_block && ((this._sbBlocked() - this._sbAllowed()) || 0);
	}

	_totalTrackersBlockedCount() {
		const {
			paused_blocking,
			sitePolicy,
			trackerCounts
		} = this.props;

		let totalTrackersBlockedCount;
		if (paused_blocking || sitePolicy === WHITELISTED) {
			totalTrackersBlockedCount = 0;
		} else if (sitePolicy === BLACKLISTED) {
			totalTrackersBlockedCount = trackerCounts.blocked + trackerCounts.allowed || 0;
		} else {
			totalTrackersBlockedCount = trackerCounts.blocked + this._sbAdjust() || 0;
		}

		return totalTrackersBlockedCount;
	}

	_isCondensed() {
		const { is_expanded, is_expert } = this.props;

		return (is_expert && is_expanded);
	}

	_isPageLoadFast() {
		const { trackerLatencyTotal } = this.state;
		return trackerLatencyTotal < 5;
	}

	_isPageLoadSlow() {
		const { trackerLatencyTotal } = this.state;
		return trackerLatencyTotal > 10;
	}

	_isPageLoadMedium() {
		return !this._isPageLoadFast() && !this._isPageLoadSlow();
	}

	_isCliqzInactive() {
		const { paused_blocking, sitePolicy } = this.props;
		const { disableBlocking } = this.state;

		return paused_blocking || sitePolicy || disableBlocking || IS_CLIQZ;
	}

	_isSmartBlockingInactive() {
		const { paused_blocking, sitePolicy } = this.props;
		const { disableBlocking } = this.state;

		return paused_blocking || sitePolicy || disableBlocking;
	}

	/**
	 * Render helper for the donut
	 * @return {JSX} JSX for rendering the donut
	 */
	_renderDonut() {
		const {
			categories,
			adBlock,
			antiTracking,
			is_expert,
			paused_blocking,
			sitePolicy,
		} = this.props;

		return (
			<div className="Summary__donutContainer">
				<DonutGraph
					categories={categories}
					adBlock={adBlock}
					antiTracking={antiTracking}
					renderRedscale={sitePolicy === BLACKLISTED}
					renderGreyscale={paused_blocking}
					totalCount={this._totalTrackersFound()}
					ghosteryFeatureSelect={sitePolicy}
					isSmall={is_expert}
					clickDonut={this.clickDonut}
				/>
			</div>
		);
	}

	/**
	 * Render helper for the page host readout
	 * @return {JSX} JSX for rendering the page host readout
	 */
	_renderPageHostReadout() {
		const pageHost = this._pageHost();
		const pageHostContainerClassNames = ClassNames('Summary__pageHostContainer', {
			invisible: this._hidePageHost(pageHost),
		});

		return (
			<div className={pageHostContainerClassNames}>
				<span className="SummaryPageHost">{pageHost}</span>
			</div>
		);
	}

	/**
	 * Render helper for the total trackers found readout shown in condensed view
	 * @return {JSX} JSX for rendering the condensed view total trackers found readout
	 */
	_renderTotalTrackersFound() {
		return (
			<div className="Summary__totalTrackerCountContainer clickable" onClick={this.clickTrackersCount}>
				<span className="Summary__totalTrackerCount g-tooltip">
					{this._totalTrackersFound()}
					<Tooltip
						header={t('panel_tracker_total_tooltip')}
						position="right"
					/>
				</span>
			</div>
		);
	}

	/**
	 * Render helper for the total trackers blocked readout
	 * @return {JSX} JSX for rendering the total trackers blocked readout
	 */
	_renderTotalTrackersBlocked() {
		const { is_expert } = this.props;

		const totalTrackersBlockedContainerClassNames = ClassNames('Summary__pageStatContainer', {
			clickable: is_expert,
		});
		const totalTrackersBlockedClassNames = ClassNames('SummaryPageStat', 'total-trackers-blocked', {
			'SummaryPageStat--condensed-view': this._isCondensed(),
		});

		return (
			<div className={totalTrackersBlockedContainerClassNames} onClick={this.clickTrackersBlocked}>
				<div className={totalTrackersBlockedClassNames}>
					<span className="SummaryPageStat__label">
						{t('trackers_blocked')}
						{' '}
					</span>
					<span className="SummaryPageStat__value">
						{this._totalTrackersBlockedCount()}
					</span>
				</div>
			</div>
		);
	}

	_renderTotalRequestsModified() {
		const { is_expert } = this.props;

		const totalRequestsModifiedClassNames = ClassNames('SummaryPageStat', 'g-tooltip', 'total-requests-modified', {
			'SummaryPageStat--condensed-view': this._isCondensed(),
		});

		return (
			<div className="Summary__pageStatContainer">
				<div className={totalRequestsModifiedClassNames}>
					<span className="SummaryPageStat__label">
						{t('requests_modified')}
						{' '}
					</span>
					<span className="SummaryPageStat__value">
						{this._requestsModifiedCount()}
					</span>
					<Tooltip body={t('requests_modified_tooltip')} position={is_expert ? 'right' : 'top'} />
				</div>
			</div>
		);
	}

	_renderPageLoadTime() {
		const { trackerLatencyTotal } = this.state;

		const pageLoadTimeClassNames = ClassNames('SummaryPageStat', {
			'page-load-time-slow': this._isPageLoadSlow(),
			'page-load-time-medium': this._isPageLoadMedium(),
			'page-load-time-fast': this._isPageLoadFast(),
			'SummaryPageStat--condensed-view': this._isCondensed(),
		});

		return (
			<div className="Summary__pageStatContainer">
				<div className={pageLoadTimeClassNames}>
					<span className="SummaryPageStat__label">
						{t('page_load')}
						{' '}
					</span>
					<span className="SummaryPageStat__value">
						{trackerLatencyTotal ? `${trackerLatencyTotal} ${t('settings_seconds')}` : '-'}
					</span>
				</div>
			</div>
		);
	}

	_renderGhosteryFeature(type, ...modifiers) {
		const {
			is_expert,
			paused_blocking,
			sitePolicy,
		} = this.props;
		const { disableBlocking } = this.state;
		const isCondensed = this._isCondensed();
		const containerClassNames = ClassNames('Summary__ghosteryFeatureContainer', modifiers);

		return (
			<div className={containerClassNames}>
				<GhosteryFeature
					handleClick={this.clickSitePolicy}
					type={type}
					sitePolicy={sitePolicy}
					blockingPausedOrDisabled={paused_blocking || disableBlocking}
					showText={!this._isCondensed()}
					tooltipPosition={is_expert ? 'right' : 'top'}
					short={is_expert && !isCondensed}
					narrow={isCondensed}
				/>
			</div>
		);
	}

	_renderPauseButton() {
		const {
			is_expert,
			paused_blocking,
			paused_blocking_timeout,
		} = this.props;

		return (
			<div className="Summary__pauseButtonContainer">
				<PauseButton
					isPaused={paused_blocking}
					isPausedTimeout={paused_blocking_timeout}
					clickPause={this.clickPauseButton}
					dropdownItems={this.pauseOptions}
					isCentered={is_expert}
					isCondensed={this._isCondensed()}
				/>
			</div>
		);
	}

	_renderCliqzAntiTracking() {
		const {
			enable_anti_tracking,
			is_expert,
			current_theme,
		} = this.props;
		const isCondensed = this._isCondensed();

		return (
			<div className="Summary__cliqzFeatureContainer">
				<CliqzFeature
					clickButton={this.clickCliqzFeature}
					type="anti_track"
					active={enable_anti_tracking}
					cliqzInactive={this._isCliqzInactive()}
					isSmaller={is_expert && !isCondensed}
					isCondensed={isCondensed}
					isTooltipHeader={is_expert}
					isTooltipBody={!isCondensed}
					tooltipPosition={isCondensed ? 'right' : is_expert ? 'top top-right' : 'top'}
					current_theme={current_theme}
				/>
			</div>
		);
	}

	_renderCliqzAdBlock() {
		const {
			enable_ad_block,
			is_expert,
			current_theme,
		} = this.props;
		const isCondensed = this._isCondensed();

		return (
			<div className="Summary__cliqzFeatureContainer">
				<CliqzFeature
					clickButton={this.clickCliqzFeature}
					type="ad_block"
					active={enable_ad_block}
					cliqzInactive={this._isCliqzInactive()}
					isSmaller={is_expert && !isCondensed}
					isCondensed={is_expert && isCondensed}
					isTooltipHeader={is_expert}
					isTooltipBody={!isCondensed}
					tooltipPosition={isCondensed ? 'right' : 'top'}
					current_theme={current_theme}
				/>
			</div>
		);
	}

	_renderCliqzSmartBlock() {
		const {
			enable_smart_block,
			is_expert,
			current_theme,
		} = this.props;
		const isCondensed = this._isCondensed();

		return (
			<div className="Summary__cliqzFeatureContainer">
				<CliqzFeature
					clickButton={this.clickCliqzFeature}
					type="smart_block"
					active={enable_smart_block}
					cliqzInactive={this._isSmartBlockingInactive()}
					isSmaller={is_expert && !isCondensed}
					isCondensed={isCondensed}
					isTooltipHeader={is_expert}
					isTooltipBody={!isCondensed}
					tooltipPosition={isCondensed ? 'right' : is_expert ? 'top top-left' : 'top'}
					current_theme={current_theme}
				/>
			</div>
		);
	}

	/**
	 * Render helper for the stats navicon
	 * @return {JSX} JSX for rendering the stats navicon
	 */
	_renderStatsNavicon() {
		const { is_expert } = this.props;
		const statsNaviconClassNames = ClassNames(
			'Summary__statsNavicon',
			'Summary__statsNavicon--absolutely-positioned',
			'g-tooltip',
			{
				hide: is_expert,
			}
		);

		return (
			<div className={statsNaviconClassNames} onClick={this.showStatsView}>
				<ReactSVG src="../../app/images/panel/graph.svg" />
				<Tooltip body={t('historical_stats')} position="left" />
			</div>
		);
	}

	/**
	 * Render helper for the rewards navicon that displays in the simple version of the view
	 * @return {JSX} JSX for rendering the rewards navicon
	 */
	_renderRewardsNavicon() {
		const { is_expert } = this.props;
		const rewardsNaviconClassNames = ClassNames(
			'Summary__rewardsNavicon',
			'Summary__rewardsNavicon--absolutely-positioned',
			'g-tooltip',
			{
				hide: is_expert,
			}
		);

		return (
			<div className={rewardsNaviconClassNames} onClick={this.showRewardsListView}>
				<ReactSVG src="../../app/images/panel/rewards-icon.svg" />
				<Tooltip body={t('ghostery_rewards')} position="left" />
			</div>
		);
	}

	/**
	 * Render helper for the plus upgrade banner or subscriber icon
	 * @return {JSX} JSX for rendering the plus upgrade banner or subscriber icon
	 */
	_renderPlusUpgradeBannerOrSubscriberIcon() {
		const { is_expert, current_theme, user } = this.props;

		const hasPremiumAccess = user && user.premiumAccess;
		const hasPlusAccess = user && user.plusAccess;
		const upgradeBannerClassNames = ClassNames('UpgradeBanner', {
			'UpgradeBanner--normal': !is_expert,
			'UpgradeBanner--small': is_expert,
		});

		return (
			<div onClick={this.clickUpgradeBannerOrGoldPlusIcon}>
				{hasPremiumAccess && (
					<div className="Summary__subscriberBadgeContainer">
						<div className={`SubscriberBadge ${current_theme}`}>
							<ReactSVG src="/app/images/panel/premium-badge-icon.svg" className="gold-plus-icon" />
						</div>
					</div>
				)}

				{hasPlusAccess && !hasPremiumAccess && (
					<div className="Summary__subscriberBadgeContainer">
						<div className={`SubscriberBadge ${current_theme}`}>
							<ReactSVG src="/app/images/panel/plus-badge-icon.svg" className="gold-plus-icon" />
						</div>
					</div>
				)}

				{(!hasPlusAccess && !hasPremiumAccess) && (
					<div className="Summary__upgradeBannerContainer">
						<div className={upgradeBannerClassNames}>
							<span className="UpgradeBanner__text">{t('subscription_upgrade_to')}</span>
							<ReactSVG src="/app/images/panel/upgrade-banner-plus.svg" className="UpgradeBanner__plus" />
						</div>
					</div>
				)}
			</div>
		);
	}

	/**
	* React's required render function. Returns JSX
	* @return {JSX} JSX for rendering the Summary View of the panel
	*/
	render() {
		const {
			enable_offers,
			is_expert,
			is_expanded,
			current_theme
		} = this.props;
		const { disableBlocking } = this.state;
		const isCondensed = this._isCondensed();
		const summaryClassNames = ClassNames('Summary', {
			'Summary--simple': !is_expert,
			'Summary--expert': is_expert && !is_expanded,
			'Summary--condensed': isCondensed,
		});
		const foregroundClassNames = ClassNames('Summary__foreground', {
			active: current_theme === 'palm-theme'
					|| current_theme === 'leaf-theme',
		});

		return (
			<div className={summaryClassNames}>
				<div className="Summary__opacityOverlay" />
				<div className={foregroundClassNames}>
					{!isCondensed && disableBlocking && (<NotScanned isSmall={is_expert} />)}
					{!isCondensed && !disableBlocking && this._renderDonut()}
					{!isCondensed && !disableBlocking && this._renderPageHostReadout()}

					{isCondensed && !disableBlocking && this._renderTotalTrackersFound()}

					<div className="Summary__pageStatsContainer">
						{!disableBlocking && this._renderTotalTrackersBlocked()}
						{!disableBlocking && this._renderTotalRequestsModified()}
						{!disableBlocking && this._renderPageLoadTime()}
					</div>

					{isCondensed && disableBlocking && (
						<div className="Summary__spaceTaker" />
					)}

					<div className="Summary__ghosteryFeaturesContainer">
						{this._renderGhosteryFeature('trust')}
						{this._renderGhosteryFeature('restrict', 'Summary__ghosteryFeatureContainer--middle')}
						{this._renderPauseButton()}
					</div>
					<div className="Summary__cliqzFeaturesContainer">
						{this._renderCliqzAntiTracking()}
						{this._renderCliqzAdBlock()}
						{this._renderCliqzSmartBlock()}
					</div>
					{this._renderStatsNavicon()}
					{enable_offers && this._renderRewardsNavicon()}

					{!isCondensed && this._renderPlusUpgradeBannerOrSubscriberIcon()}
				</div>
			</div>
		);
	}
}

export default Summary;
