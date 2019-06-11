/**
 * Tracker Component
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

/* eslint react/no-array-index-key: 0 */

import React from 'react';
import ReactSVG from 'react-svg';
import globals from '../../../../src/classes/Globals';
import { log } from '../../../../src/utils/common';
import { sendMessageInPromise } from '../../utils/msg';
/**
 * @class Implement Tracker component which represents single tracker
 * in the Blocking view.
 * @memberOf BlockingComponents
 */
class Tracker extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			description: '',
			showMoreInfo: false,
			showTrackerLearnMore: false,
			trackerClasses: '',
			warningImageTitle: '',
		};

		// click bindings
		this.toggleDescription = this.toggleDescription.bind(this);
		this.clickTrackerStatus = this.clickTrackerStatus.bind(this);
		this.clickTrackerTrust = this.clickTrackerTrust.bind(this);
		this.clickTrackerRestrict = this.clickTrackerRestrict.bind(this);
	}
	/**
	 * Lifecycle event.
	 */
	componentWillMount() {
		this.updateTrackerClasses(this.props.tracker);
	}
	/**
	 * Lifecycle event.
	 */
	componentWillReceiveProps(nextProps) {
		this.updateTrackerClasses(nextProps.tracker);
	}
	/**
	 * React hook used to optimise re-rendering of the list of trackers.
	 * @param  {Object} nextProps	changed props
	 * @param  {Object} nextState   changed state
	 * @return {boolean}            true means proceed with rendering
	 */
	shouldComponentUpdate(nextProps) {
		const { tracker } = nextProps;
		if (!tracker || Object.keys(tracker).length === 0) {
			return false;
		}
		return true;
	}
	/**
	 * Implement handler for clicking on the tracker title
	 * which shows/hides tracker description. On show it retrieves
	 * description from https://apps.ghostery.com and sets it in state.
	 */
	toggleDescription() {
		const { tracker } = this.props;
		this.setState({ showMoreInfo: !this.state.showMoreInfo });

		if (this.state.description) {
			return;
		}

		this.setState({ description: t('tracker_description_getting') });

		sendMessageInPromise('getTrackerDescription', {
			url: `https:\/\/${globals.APPS_SUB_DOMAIN}.ghostery.com/${this.props.language}/apps/${
				encodeURIComponent(tracker.name.replace(/\s+/g, '_').toLowerCase())}?format=json`,
		}).then((data) => {
			if (data) {
				const truncate = (data.length > 200) ? `${data.substr(0, 199)}...` : data;
				this.setState({ description: truncate });
				this.setState({ showTrackerLearnMore: true });
			} else {
				this.setState({ description: t('tracker_description_none_found') });
			}
		}).catch((err) => {
			log('Error loading tracker description', err);
			this.setState({ description: t('tracker_description_none_found') });
		});
	}
	/**
	 * Set dynamic classes on .blocking-trk and save it in state.
	 * @param  {Object} tracker    tracker object
	 */
	updateTrackerClasses(tracker) {
		const classes = [];
		let updated_title = '';

		classes.push((!tracker.shouldShow) ? 'hide' : '');
		classes.push((tracker.blocked) ? 'blocked' : '');
		classes.push((tracker.ss_allowed) ? 'individual-trust' : '');
		classes.push((tracker.ss_blocked) ? 'individual-restrict' : '');
		classes.push((tracker.warningCompatibility || tracker.warningInsecure || tracker.warningSlow || tracker.warningSmartBlock) ? 'warning' : '');
		if (tracker.warningSmartBlock) {
			classes.push(tracker.warningSmartBlock === 'blocked' ? 'smart-blocked' : 'smart-unblocked');
		} else {
			classes.push((tracker.warningCompatibility) ? 'compatibility' : '');
			classes.push((tracker.warningInsecure) ? 'insecure' : '');
			classes.push((tracker.warningSlow) ? 'slow' : '');
		}

		// Create tooltips for tracker alerts
		if (tracker.warningSmartBlock) {
			updated_title = tracker.warningSmartBlock === 'blocked' ? t('panel_tracker_warning_smartblock_tooltip') : t('panel_tracker_warning_smartunblock_tooltip');
		} else if (tracker.warningCompatibility) {
			updated_title = t('panel_tracker_warning_compatibility_tooltip');
		} else if (tracker.warningInsecure && tracker.warningSlow) {
			updated_title = t('panel_tracker_warning_slow_nonsecure_tooltip');
		} else if (tracker.warningInsecure) {
			updated_title = t('panel_tracker_warning_nonsecure_tooltip');
		} else if (tracker.warningSlow) {
			updated_title = t('panel_tracker_warning_slow_tooltip');
		}

		this.setState({
			trackerClasses: classes.join(' '),
			warningImageTitle: updated_title,
		});
	}
	/**
	 * Implement handler for clicking on the tracker global block/unblock checkbox.
	 * Trigger action which persists new tracker blocked state and spawns
	 * re-rendering of the checkbox. It also shows notification to inform
	 * user that the page should be reloaded.
	 */
	clickTrackerStatus() {
		const blocked = !this.props.tracker.blocked;

		if (this.props.paused_blocking || this.props.sitePolicy) {
			return;
		}

		this.props.actions.updateTrackerBlocked({
			smartBlockActive: this.props.smartBlockActive,
			smartBlock: this.props.smartBlock,
			app_id: this.props.tracker.id,
			cat_id: this.props.cat_id,
			blocked,
		});

		this.props.actions.showNotification({
			updated: `${this.props.tracker.id}_blocked`,
			reload: true,
		});
	}

	/**
	 * Implement handler for clicking on the tracker site-specific trust icon.
	 * Trigger actions which persist the new setting and notify user
	 * that the page should be reloaded.
	 */
	clickTrackerTrust() {
		const ss_allowed = !this.props.tracker.ss_allowed;
		this.props.actions.updateTrackerTrustRestrict({
			app_id: this.props.tracker.id,
			cat_id: this.props.cat_id,
			trust: ss_allowed,
			restrict: false,
		});

		this.props.actions.showNotification({
			updated: `${this.props.tracker.id}_ss_allowed`,
			reload: true,
		});
	}

	/**
	 * Implement handler for clicking on the tracker site-specific block icon.
	 * Trigger actions which persist the new setting and notify user
	 * that the page should be reloaded.
	 */
	clickTrackerRestrict() {
		const ss_blocked = !this.props.tracker.ss_blocked;
		this.props.actions.updateTrackerTrustRestrict({
			app_id: this.props.tracker.id,
			cat_id: this.props.cat_id,
			trust: false,
			restrict: ss_blocked,
		});

		this.props.actions.showNotification({
			updated: `${this.props.tracker.id}_ss_blocked`,
			reload: true,
		});
	}

	_renderCliqzStatsContainer() {
		const { tracker } = this.props;
		const { cliqzAdCount, cliqzCookieCount, cliqzFingerprintCount } = tracker;

		const oneOrMoreCookies = cliqzCookieCount >= 1;
		const oneOrMoreFingerprints = cliqzFingerprintCount >= 1;
		const oneOrMoreAds = cliqzAdCount >= 1;

		return (
			<div className="trk-cliqz-stats-container">
				{(oneOrMoreCookies || oneOrMoreFingerprints) && this._renderCookiesAndFingerprintsIcon()}
				{oneOrMoreCookies && this._renderCliqzCookieStat(cliqzCookieCount)}
				{oneOrMoreFingerprints && this._renderCliqzFingerprintStat(cliqzFingerprintCount)}
				{(oneOrMoreCookies || oneOrMoreFingerprints) && oneOrMoreAds && this._renderDivider()}
				{oneOrMoreAds && this._renderAdsIcon()}
				{oneOrMoreAds && this._renderCliqzAdStat(cliqzAdCount)}
			</div>
		);
	}
	_renderCookiesAndFingerprintsIcon() {
		return (
			<ReactSVG path="/app/images/panel/tracker-detail-cliqz-cookies-and-fingerprints-icon.svg" className="trk-cliqz-stat-cookies-and-fingerprints-icon-svg" />
		);
	}
	_renderAdsIcon() {
		return (
			<ReactSVG path="/app/images/panel/tracker-detail-cliqz-ads-icon.svg" className="trk-cliqz-stat-ads-icon-svg" />
		);
	}
	_renderDivider() { return (<span className="trk-cliqz-stat-divider">|</span>); }
	_renderCliqzCookieStat(count) { return this._renderCliqzStat(count, 'cookie'); }
	_renderCliqzFingerprintStat(count) { return this._renderCliqzStat(count, 'fingerprint'); }
	_renderCliqzAdStat(count) { return this._renderCliqzStat(count, 'ad'); }
	_renderCliqzStat(count, type) {
		const exactlyOne = count === 1;
		const label = exactlyOne ?
			t(`tracker_detail_cliqz_${type}`) :
			t(`tracker_detail_cliqz_${type}s`);
		const cssClass = `trk-cliqz-stat trk-cliqz-stat-${type}s-count`;

		return (
			<span className={cssClass}>{count} {label}</span>
		);
	}

	/**
	* Render a tracker in Blocking view.
	* @return {ReactComponent}   ReactComponent instance
	*/
	render() {
		const { tracker } = this.props;
		let sources;

		if (tracker.sources) {
			sources = tracker.sources.map((source, index) => (
				<a
					target="_blank"
					rel="noopener noreferrer"
					className="trk-src-link"
					title={source.src}
					key={index}
					href={`https://${encodeURIComponent(globals.GCACHE_SUB_DOMAIN)}.ghostery.com/${encodeURIComponent(this.props.language)}/gcache/?n=${encodeURIComponent(tracker.name)}&s=${encodeURIComponent(source.src)}&v=2&t=${source.type}`}
				>
					{ source.src }
				</a>
			));
		}
		return (
			<div className={`${this.state.trackerClasses} blocking-trk`}>
				<div className="row align-middle trk-header">
					<div className="columns shrink">
						<div className={`warning-image right${this.state.warningImageTitle ? ' t-tooltip-up-right' : ''}`} data-g-tooltip={this.state.warningImageTitle} />
					</div>
					<div className="columns collapse-left">
						<div className="trk-name" onClick={this.toggleDescription}>{ tracker.name }</div>
						{this._renderCliqzStatsContainer()}
					</div>
					<div className="columns shrink align-self-justify collapse-right">
						<div className="svg-container">
							<span className="t-tooltip-up-left" data-g-tooltip={this.props.tracker.ss_allowed ? t('summary_undo') : t('panel_tracker_trust_tooltip')}>
								<svg className="blocking-icons trust" onClick={this.clickTrackerTrust} width="20px" height="20px" viewBox="0 0 20 20">
									<g transform="translate(1 1)" fill="none" fillRule="evenodd">
										<path className="border" d="M-.5-.5h18.3v18.217H-.5z" />
										<path className="background" d="M.5.5h16.3v16.217H.5z" />
										<svg width="20px" height="20px" viewBox="-2.75 -2.75 20 20">
											<circle className="trust-circle" cx="5.875" cy="5.875" r="5.875" fillRule="evenodd" />
										</svg>
									</g>
								</svg>
							</span>
							<span className="t-tooltip-up-left" data-g-tooltip={this.props.tracker.ss_blocked ? t('summary_undo') : t('panel_tracker_restrict_tooltip')} >
								<svg className="blocking-icons restrict" onClick={this.clickTrackerRestrict} width="20px" height="20px" viewBox="0 0 20 20">
									<g transform="translate(1 1)" fill="none" fillRule="evenodd">
										<path className="border" d="M-.5-.5h18.3v18.217H-.5z" />
										<path className="background" d="M.5.5h16.3v16.217H.5z" />
										<svg width="20px" height="20px" viewBox="-2 -2 20 20">
											<g className="restrict-circle" transform="translate(1 1)" fillRule="evenodd">
												<path d="M1.958 1.958l7.834 7.834" />
												<circle cx="5.753" cy="5.753" r="5.753" />
											</g>
										</svg>
									</g>
								</svg>
							</span>
							<span className={(!this.props.tracker.ss_blocked && !this.props.tracker.ss_allowed) ? 't-tooltip-up-left' : ''} data-g-tooltip={t('panel_tracker_block_tooltip')} >
								<svg className="blocking-icons status" onClick={() => { if (this.props.tracker.ss_allowed || this.props.tracker.ss_blocked) { return; } this.clickTrackerStatus(); }} width="20px" height="20px" viewBox="0 0 20 20">
									<g transform="translate(1 1)" fill="none" fillRule="evenodd">
										<path className="border" d="M-.5-.5h18.3v18.217H-.5z" />
										<path className="background" d="M.5.5h16.3v16.217H.5z" />
										<svg width="20px" height="20px" viewBox="-2.5 -2.5 20 20">
											<path className="check" d="M8.062 6l3.51-3.51c.57-.57.57-1.493 0-2.063-.57-.57-1.495-.57-2.063 0L6 3.937 2.49.428c-.57-.57-1.493-.57-2.063 0-.57.57-.57 1.494 0 2.064L3.937 6 .426 9.51c-.57.57-.57 1.493 0 2.063.57.57 1.494.57 2.063 0L6 8.063l3.51 3.508c.57.57 1.493.57 2.063 0 .57-.57.57-1.493 0-2.062L8.063 6z" fillRule="nonzero" />
										</svg>
										<svg width="20px" height="20px" viewBox="-2.75 -2.75 20 20">
											<circle className="trust-circle" cx="5.875" cy="5.875" r="5.875" fillRule="evenodd" />
										</svg>
										<svg width="20px" height="20px" viewBox="-2 -2 20 20">
											<g className="restrict-circle" transform="translate(1 1)" fillRule="evenodd">
												<path d="M1.958 1.958l7.834 7.834" />
												<circle cx="5.753" cy="5.753" r="5.753" />
											</g>
										</svg>
									</g>
								</svg>
							</span>
						</div>
					</div>
				</div>
				{
					this.state.showMoreInfo &&
					<div className={`${!this.state.showMoreInfo ? 'hide' : ''} row trk-moreinfo`}>
						<div className="columns">
							<div className="trk-description">
								{ this.state.description }
								<div className={(!this.state.showTrackerLearnMore ? 'hide' : '')}>
									<a target="_blank" rel="noopener noreferrer" title={tracker.name} href={`https://${globals.APPS_SUB_DOMAIN}.ghostery.com/${this.props.language}/apps/${encodeURIComponent(tracker.name.replace(/\s+/g, '_').toLowerCase())}`}>
										{ t('tracker_description_learn_more') }
									</a>
								</div>
							</div>
							<div className={`${!this.props.show_tracker_urls ? 'hide' : ''}`}>
								<div className="trk-srcs-title">{ t('panel_tracker_found_sources_title') }</div>
								<div className="trk-srcs">{ sources }</div>
							</div>
						</div>
					</div>
				}
			</div>
		);
	}
}

Tracker.defaultProps = {
	tracker: {},
};

export default Tracker;
