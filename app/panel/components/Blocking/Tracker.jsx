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
import { ReactSVG } from 'react-svg';
import ClassNames from 'classnames';

import globals from '../../../../src/classes/Globals';
import { log } from '../../../../src/utils/common';
import { sendMessageInPromise } from '../../utils/msg';
import { renderKnownTrackerButtons, renderUnknownTrackerButtons } from './trackerButtonRenderHelpers';
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
		this.handleCliqzTrackerWhitelist = this.handleCliqzTrackerWhitelist.bind(this);
	}

	/**
	 * Lifecycle event.
	 */
	UNSAFE_componentWillMount() {
		this.updateTrackerClasses(this.props.tracker);
	}

	/**
	 * Lifecycle event.
	 */
	UNSAFE_componentWillReceiveProps(nextProps) {
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
			url: `https://${globals.APPS_SUB_DOMAIN}.ghostery.com/${this.props.language}/apps/${
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

	/**
	 * Implement handler for clicking on the trust or scrub SVGs for an unknown tracker
	 * Trigger actions which persist the new setting and notify user
	 * that the page should be reloaded.
	 */
	handleCliqzTrackerWhitelist() {
		const { tracker } = this.props;

		this.props.actions.updateCliqzModuleWhitelist(tracker);
		this.props.actions.showNotification({
			updated: `${tracker.name}-whitelisting-status-changed`,
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
			<div className="trk-cliqz-stats-outer-container">
				{(oneOrMoreCookies || oneOrMoreFingerprints) && (
					<div className="trk-cliqz-stats-container">
						{this._renderCliqzCookiesAndFingerprintsIcon()}
						{oneOrMoreCookies && this._renderCliqzCookieStat(cliqzCookieCount)}
						{oneOrMoreFingerprints && this._renderCliqzFingerprintStat(cliqzFingerprintCount)}
					</div>
				)}
				{oneOrMoreAds && (
					<div className="trk-cliqz-stats-container">
						{this._renderCliqzAdsIcon()}
						{this._renderCliqzAdStat(cliqzAdCount)}
					</div>
				)}
			</div>
		);
	}

	_renderCliqzCookiesAndFingerprintsIcon() { return this._renderCliqzStatsIcon('cookies-and-fingerprints'); }

	_renderCliqzAdsIcon() { return this._renderCliqzStatsIcon('ads'); }

	_renderCliqzStatsIcon(type) {
		const path = `/app/images/panel/tracker-detail-cliqz-${type}-icon.svg`;

		return (
			<ReactSVG src={path} className="trk-cliqz-stats-icon" />
		);
	}

	_renderCliqzCookieStat(count) { return this._renderCliqzStat(count, 'cookie'); }

	_renderCliqzFingerprintStat(count) { return this._renderCliqzStat(count, 'fingerprint'); }

	_renderCliqzAdStat(count) { return this._renderCliqzStat(count, 'ad'); }

	_renderCliqzStat(count, type) {
		const exactlyOne = count === 1;
		const label = exactlyOne ?
			t(`${type}`) :
			t(`${type}s`);
		const cssClass = `trk-cliqz-stat trk-cliqz-stat-${type}s-count`;

		return (
			<span className={cssClass}>
				{count}
				{' '}
				{label}
			</span>
		);
	}

	/**
	* Render a tracker in Blocking view.
	* @return {ReactComponent}   ReactComponent instance
	*/
	render() {
		const { tracker, isUnknown } = this.props;

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
		} else if (tracker.domains) {
			sources = tracker.domains.map((domain, index) => (
				<p className="trk-src-link unknown" key={index}>{domain}</p>
			));
		}

		const trackerNameClasses = ClassNames('trk-name', {
			'is-whitelisted': tracker.whitelisted && !tracker.siteRestricted,
		});

		return (
			<div className={`${this.state.trackerClasses} blocking-trk`}>
				<div className="row align-middle trk-header">
					<div className="columns shrink">
						<div className={`warning-image right${this.state.warningImageTitle ? ' t-tooltip-up-right' : ''}`} data-g-tooltip={this.state.warningImageTitle} />
					</div>
					<div className="columns collapse-left">
						<div
							className={trackerNameClasses}
							onClick={this.toggleDescription}
						>
							{tracker.name}
						</div>
						{!tracker.whitelisted && this._renderCliqzStatsContainer()}
					</div>
					<div className="columns shrink align-self-justify collapse-right">
						{!isUnknown && renderKnownTrackerButtons(
							this.props.tracker.ss_allowed,
							this.props.tracker.ss_blocked,
							this.clickTrackerTrust,
							this.clickTrackerRestrict,
							this.clickTrackerStatus,
						)}
						{isUnknown && tracker.type === 'antiTracking' && renderUnknownTrackerButtons(
							this.handleCliqzTrackerWhitelist,
							tracker.whitelisted,
							tracker.siteRestricted,
							tracker.type,
						)}
					</div>
				</div>
				{this.state.showMoreInfo && (
					<div className={`${!this.state.showMoreInfo ? 'hide' : ''} row trk-moreinfo`}>
						<div className="columns">
							{!isUnknown && (
								<div className="trk-description">
									{this.state.description}
									<div className={(!this.state.showTrackerLearnMore ? 'hide' : '')}>
										<a target="_blank" rel="noopener noreferrer" title={tracker.name} href={`https://${globals.APPS_SUB_DOMAIN}.ghostery.com/${this.props.language}/apps/${encodeURIComponent(tracker.name.replace(/\s+/g, '_').toLowerCase())}`}>
											{t('tracker_description_learn_more')}
										</a>
									</div>
								</div>
							)}
							<div className={`${!this.props.show_tracker_urls ? 'hide' : ''}`}>
								<div className="trk-srcs-title">{t('panel_tracker_found_sources_title')}</div>
								<div className="trk-srcs">{sources}</div>
							</div>
						</div>
					</div>
				)}
			</div>
		);
	}
}

Tracker.defaultProps = {
	tracker: {},
};

export default Tracker;
