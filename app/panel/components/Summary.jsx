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
import DonutGraph from './DonutGraph';
import SelectButton from './SelectButton';
import Tooltip from './Tooltip';
import NotScanned from './NotScanned';
import globals from '../../../src/classes/Globals';
import { updateSummaryBlockingCount } from '../utils/blocking';

const { BROWSER_INFO } = globals;
const { IS_CLIQZ } = globals;
/**
 * @class Implement Summary view.
 * @memberof PanelClasses
 */
class Summary extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			trackerLatencyTotal: '',
			disableBlocking: false,
		};

		// event bindings
		this.clickGhosteryPause = this.clickGhosteryPause.bind(this);
		this.clickSitePolicy = this.clickSitePolicy.bind(this);
		this.clickTrackersBlocked = this.clickTrackersBlocked.bind(this);
		this.clickTrackersAlerts = this.clickTrackersAlerts.bind(this);
		this.clickMapTheseTrackers = this.clickMapTheseTrackers.bind(this);
		this.toggleExpert = this.toggleExpert.bind(this);
		this.openDrawer = this.openDrawer.bind(this);

		this.pauseOptions = [
			{ name: t('pause_30_min'), val: 30 },
			{ name: t('pause_1_hour'), val: 60 },
			{ name: t('pause_24_hours'), val: 1440 },
		];
	}
	/**
	 * Lifecycle event.
	 */
	componentWillMount() {
		this.setTrackerLatency(this.props);
		this.updateSiteNotScanned(this.props);
	}
	/**
	 * Lifecycle event.
	 */
	componentWillReceiveProps(nextProps) {
		// triggered by update to the redux store
		this.setTrackerLatency(nextProps);
		this.updateSiteNotScanned(nextProps);
		if (nextProps.alertCounts.total !== this.props.alertCounts.total) {
			this.updateTrackerCountAlert(nextProps);
		}
		// Set page title for Firefox for Android
		window.document.title = `Ghostery's findings for ${this.props.pageUrl}`;
	}
	/**
	* Calculate pageLatency and set to state
	* @param {Object}	props	nextProps
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
	 * Open feature drawer
	 * @param  {Object} event clicking on feature button event
	 */
	openDrawer(event) {
		if (this.state.disableBlocking || this.props.paused_blocking || this.props.sitePolicy !== false) { return; }

		const type = event.target.value;
		switch (type) {
			case 'antiTrackBtn': {
				if (!IS_CLIQZ) {
					this.props.actions.openDrawer('enable_anti_tracking');
				}
				break;
			}
			case 'adBlockBtn': {
				if (!IS_CLIQZ) {
					this.props.actions.openDrawer('enable_ad_block');
				}
				break;
			}
			case 'smartBlockBtn': {
				this.props.actions.openDrawer('enable_smart_block');
				break;
			}
			default: {
				break;
			}
		}
	}
	/**
	 * Wrapper of toggleExpert call
	 */
	toExpert = () => {
		if (!this.props.is_expert) {
			this.toggleExpert();
		}
	}
	/**
	 * Toggle between simple and detail (expert) views
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
	* Disable controls for a site that cannot be scanned by
	* Ghostery or has not yet been scanned.
	* @param {Object}	props	nextProps
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
	* Trigger actions which display notifications
	* about slow or non-secure trackers.
	* @param {Object}	props	nextProps
	*/
	updateTrackerCountAlert(props) {
		const { alertCounts } = props;

		if (alertCounts.total) {
			// Set notification on Panel View
			if (alertCounts.compatibility) {
				if (BROWSER_INFO.name === 'edge') {
					let text = t('panel_tracker_breaking_page');
					text = text.replace('$1', alertCounts.compatibility);
					text = text.replace('$2', (alertCounts.compatibility === 1) ? t('tracker_signular') : t('tracker_plural'));
					props.actions.showNotification({
						classes: 'hideous',
						filter: 'compatibility',
						text,
					});
				} else {
					props.actions.showNotification({
						classes: 'hideous',
						filter: 'compatibility',
						text: t(
							'panel_tracker_breaking_page',
							[alertCounts.compatibility,
								(alertCounts.compatibility === 1) ? t('tracker_signular') : t('tracker_plural')],
						),
					});
				}
			} else if (BROWSER_INFO.name === 'edge') {
				let text = t('panel_tracker_slow_non_secure');
				text = text.replace('$1', alertCounts.total - alertCounts.compatibility);
				text = text.replace('$2', (alertCounts.total - alertCounts.compatibility === 1) ? t('tracker_signular') : t('tracker_plural'));
				props.actions.showNotification({
					classes: 'hideous',
					filter: 'slow',
					text,
				});
			} else {
				props.actions.showNotification({
					classes: 'hideous',
					filter: 'slow',
					text: t(
						'panel_tracker_slow_non_secure',
						[alertCounts.total - alertCounts.compatibility,
							(alertCounts.total - alertCounts.compatibility === 1) ? t('tracker_signular') : t('tracker_plural')],
					),
				});
			}
		}
	}
	/**
	* Implement handler for clicks on the 'trust' and 'restrict' buttons
	* @param  {Object} event 	click event
	*/
	clickSitePolicy(event) {
		const { ghosteryPaused, sitePolicy } = this.props;
		const targetClasses = event.currentTarget.classList || [];
		const type = targetClasses.contains('controls-trust') ? 'whitelist' : 'blacklist';
		let updated_site_policy;

		if (this.state.disableBlocking || ghosteryPaused) {
			return;
		}

		if (type === 'whitelist') {
			sendMessage('ping', 'trust_site');
			updated_site_policy = (sitePolicy === 1 || !sitePolicy) ? 2 : false;
		} else {
			sendMessage('ping', 'restrict_site');
			updated_site_policy = (sitePolicy === 2 || !sitePolicy) ? 1 : false;
		}

		this.props.actions.updateSitePolicy({
			type,
		});

		this.props.actions.filterTrackers({ type: 'trackers', name: 'all' });

		this.props.actions.showNotification({
			updated: type,
			reload: true,
		});
	}

	/**
	* Implement handler for clicks on the 'pause' button. Trigger appropriate actions.
	*/
	clickGhosteryPause(time) {
		const ghosteryPaused = this.props.paused_blocking;
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
		});
	}
	/**
	* Implement handler for clicking on the blocked tracker count. Trigger a filter action.
	*/
	clickTrackersBlocked(event) {
		const { sitePolicy } = this.props;

		if (sitePolicy === 1) {
			this.props.actions.filterTrackers({ type: 'trackers', name: 'all' });
		} else {
			this.props.actions.filterTrackers({ type: 'trackers', name: 'blocked' });
		}
	}
	/**
	* Implement handler for clicking on the slow and/or non-secure tracker count. Trigger a filter action.
	*/
	clickTrackersAlerts(event) {
		this.props.actions.filterTrackers({ type: 'trackers', name: 'warning' });
	}

	/**
	* Implement handler for clicking 'Map These Trackers' which opens Evidon page.
	*/
	clickMapTheseTrackers() {
		sendMessage('ping', 'live_scan');
		sendMessage('openNewTab', {
			url: `https:\/\/www.evidon.com/solutions/trackermap/?url=${this.props.pageUrl}&utm_source=Ghostery&utm_medium=referral&utm_term=&utm_content=&utm_campaign=GhosteryMapTrackers`,
			tab_id: +this.state.tab_id,
			become_active: true,
		});
		window.close(); // for firefox
	}
	/**
	 * Render Summary view.
	 * @return {ReactComponent}   ReactComponent instance
	 */
	render() {
		const showBody = (!this.props.is_expanded || !this.props.is_expert);
		const buttonDisabled = (this.state.disableBlocking || this.props.paused_blocking || this.props.sitePolicy !== false);
		const alertText = this.props.paused_blocking ? t('enable_when_paused') : (this.props.sitePolicy === 1) ? t('enable_when_blacklisted') : (this.props.sitePolicy === 2) ? t('enable_when_whitelisted') : this.state.disableBlocking ? t('enable_when_not_scanned') : '';
		const getTooltipClass = () => ((!this.props.is_expert && 'top')
				|| ((this.props.is_expert && this.props.is_expanded) && 'right'));

		const summaryClassNames = [
			this.props.is_expanded && this.props.is_expert ? 'expanded' : '',
			this.props.is_expert || this.props.is_android ? 'expert' : 'simple',
			this.state.disableBlocking ? 'not-scanned' : '',
		];
		const loadInfoClasses = ClassNames('columns small-12 medium-4 text-left load-info g-tooltip', {
			fast: +this.state.trackerLatencyTotal < 5,
			slow: +this.state.trackerLatencyTotal > 10,
		});
		return (
			<div id="content-summary" className={summaryClassNames.join(' ')}>
				<button className="button hollow toggleExpert g-tooltip" onClick={this.toggleExpert}>
					<Tooltip
						header={this.props.is_expert ? t('tooltip_simple') : t('tooltip_expert')}
						position={this.props.is_expert ? 'right' : 'left'}
					/>
				</button>
				{(!this.props.is_expanded || !this.props.is_expert) &&
					<div className="row align-center">
						<div className="columns">
							<DonutGraph
								categories={this.props.categories}
								sitePolicy={this.props.sitePolicy}
								pausedBlocking={this.props.paused_blocking}
								trackerCounts={this.props.trackerCounts}
								isExpert={this.props.is_expert}
								actions={this.props.actions}
								toExpert={this.toExpert}
							/>
						</div>
					</div>
				}

				<div className="row tracker-count-total-expanded-expert">
					<div className="columns small-12 text-center">
						{this.props.trackerCounts.allowed + this.props.trackerCounts.blocked || 0}
					</div>
				</div>

				<div id="tracker-host" className="row">
					<div className="columns text-center">
						{this.props.pageHost}
					</div>
				</div>

				{ this.state.disableBlocking ?
					<NotScanned />
					:
					<div className="row info align-center">
						<div className="columns small-12 medium-4 text-right align-center block-info g-tooltip" onClick={this.clickTrackersBlocked}>
							<span className="text">{t('summary_blocked')}:&nbsp;</span>
							<span className="value">{this.props.trackerCounts.blocked}</span>
							{ !showBody &&
								<Tooltip
									position="right"
									header={t('summary_blocked')}
								/>
							}
						</div>
						<div className="columns small-12 medium-3 text-center alert-info g-tooltip" onClick={this.clickTrackersAlerts} >
							<span className="text" style={{ visibility: this.props.alertCounts.total === 0 ? 'hidden' : 'visible' }}>{ (this.props.alertCounts.total === 1) ? t('summary_alert') : t('summary_alerts') }:&nbsp;</span>
							<span className="value" style={{ visibility: this.props.alertCounts.total === 0 ? 'hidden' : 'visible' }}>{this.props.alertCounts.total}</span>
							{ !showBody &&
								<Tooltip
									position="right"
									header={t('page_load')}
								/>
							}
						</div>
						<div className={loadInfoClasses}>
							<span className="text">{ t('page_load') }:&nbsp;</span>
							<span className="value">{this.state.trackerLatencyTotal ? `${this.state.trackerLatencyTotal} ${t('settings_seconds')}` : '–'}</span>
							{ !showBody &&
							<Tooltip
								position="right"
								header={t('page_load')}
							/>
							}
						</div>
					</div>
				}

				<div id="controls" className="row">
					<div className="columns">
						<div id="cliqz-controls">
							<div className="row text-center">
								<div className="columns medium-4 gx-tooltip">
									<Tooltip
										header={t('tooltip_anti_track')}
										body={showBody && (IS_CLIQZ ? t('tooltip_body_in_cliqz') : t('tooltip_anti_track_body'))}
										position={`${showBody ? 'top' : 'right'} top-right`}
										showNotification={this.props.actions.showNotification}
										disabled={IS_CLIQZ || buttonDisabled}
										alertText={IS_CLIQZ ? '' : alertText}
									/>
									<button value="antiTrackBtn" onClick={this.openDrawer} className={`${(this.state.disableBlocking || this.props.paused_blocking || this.props.sitePolicy !== false || IS_CLIQZ ? 'disabled' : '')} ${(this.props.enable_anti_tracking ? 'active' : '')} button controls-trust cliqz-control-btn anti-track-btn`} />
								</div>
								<div className="columns medium-4 gx-tooltip">
									<Tooltip
										header={t('tooltip_ad_block')}
										body={showBody && (IS_CLIQZ ? t('tooltip_body_in_cliqz') : t('tooltip_ad_block_body'))}
										position={showBody ? 'top' : 'right'}
										showNotification={this.props.actions.showNotification}
										disabled={IS_CLIQZ || buttonDisabled}
										alertText={IS_CLIQZ ? '' : alertText}
									/>
									<button value="adBlockBtn" onClick={this.openDrawer} className={`${(this.state.disableBlocking || this.props.paused_blocking || this.props.sitePolicy !== false || IS_CLIQZ ? 'disabled' : '')} ${(this.props.enable_ad_block ? 'active' : '')} button controls-restrict cliqz-control-btn ad-block-btn`} />
								</div>
								<div className="columns medium-4 gx-tooltip">
									<Tooltip
										header={t('tooltip_smart_block')}
										body={showBody && t('tooltip_smart_block_body')}
										position={`${showBody ? 'top' : 'right'} top-left`}
										showNotification={this.props.actions.showNotification}
										disabled={buttonDisabled}
										alertText={alertText}
									/>
									<button value="smartBlockBtn" onClick={this.openDrawer} className={`${(this.state.disableBlocking || this.props.paused_blocking || this.props.sitePolicy !== false ? 'disabled' : '')} ${(this.props.enable_smart_block ? 'active' : '')} button controls-pause cliqz-control-btn smart-block-btn`} />
								</div>
							</div>
						</div>
						<div id="ghostery-controls">
							<div className="row align-center text-center">
								<div className="columns shrink g-tooltip">
									<Tooltip header={t('tooltip_trust')} position={showBody ? 'top' : 'right'} />
									<button onClick={this.clickSitePolicy} className={`${(this.state.disableBlocking || this.props.paused_blocking ? 'disabled' : '')} ${(this.props.sitePolicy === 2 ? 'active' : '')} button hollow blocking-controls controls-trust`}>
										<div className="icon" />
										<span className="title">{ t('summary_trust_site') }</span>
										<span className="undo">{ t('summary_undo') }</span>
									</button>
								</div>
								<div className="columns shrink g-tooltip">
									<Tooltip header={t('tooltip_restrict')} position={showBody ? 'top' : 'right'} />
									<button onClick={this.clickSitePolicy} className={`${(this.state.disableBlocking || this.props.paused_blocking ? 'disabled' : '')} ${(this.props.sitePolicy === 1 ? 'active' : '')} button hollow blocking-controls controls-restrict`}>
										<div className="icon" />
										<span className="title">{ t('summary_restrict_site') }</span>
										<span className="undo">{ t('summary_undo') }</span>
									</button>
								</div>
								<div className="columns shrink g-tooltip">
									<Tooltip header={this.props.paused_blocking ? t('tooltip_resume') : t('tooltip_pause')} position={showBody ? 'top' : 'right'} />
									<SelectButton
										active={this.props.paused_blocking}
										iconClass="icon"
										label={t('summary_pause_ghostery')}
										altLabel={t('summary_resume_ghostery')}
										callback={this.clickGhosteryPause}
										menuItems={this.pauseOptions}
										selectedItemValue={this.props.paused_blocking_timeout / 60000}
									/>
								</div>
							</div>
						</div>
						{(this.props.is_expert && !this.props.is_expanded) &&
							<div className="map-trackers" onClick={this.clickMapTheseTrackers}>{ t('summary_map_these_trackers') }</div>
						}
					</div>
				</div>
			</div>
		);
	}
}

export default Summary;