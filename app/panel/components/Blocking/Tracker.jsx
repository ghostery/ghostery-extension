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

import React from 'react';
import ClassNames from 'classnames';

import ThemeContext from '../../contexts/ThemeContext';
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
	static contextType = ThemeContext;

	/**
	 *	Refactoring UNSAFE_componentWillMount into Constructor
	 *	Stats:
	 *		Constructor runtime before refactor: 0.037ms
	 *		Constructor + UNSAFE_componentWillMount runtime before refactor: 0.415ms
	 *		Constructor runtime after refactor: 0.215ms
	 *
	 *	Refactoring UNSAFE_componentWillMount into componentDidMount
	 *	Stats:
	 *		Constructor runtime after refactor: 0.020ms
	 *		Constructor + componentDidMount runtime after refactor: 14.205ms
	 *
	 *	Conclusion: Refactor using componentDidMount
	 */
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
	componentDidMount() {
		const { tracker } = this.props;
		this.updateTrackerClasses(tracker);
	}

	/**
	 * Lifecycle event.
	 */
	static getDerivedStateFromProps(nextProps) {
		return Tracker.computeTrackerClasses(nextProps.tracker);
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
		const { tracker, language } = this.props;
		this.setState(prevState => ({ showMoreInfo: !prevState.showMoreInfo }));

		const { description } = this.state;
		if (description) {
			return;
		}

		this.setState({ description: t('tracker_description_getting') });

		sendMessageInPromise('getTrackerDescription', {
			url: `${globals.APPS_BASE_URL}/${language}/apps/${
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
	 * Set dynamic classes on .blocking-trk to state.
	 * @param  {Object} tracker    tracker object
	 */
	updateTrackerClasses(tracker) {
		const {
			trackerClasses,
			warningImageTitle
		} = Tracker.computeTrackerClasses(tracker);

		this.setState({ trackerClasses, warningImageTitle });
	}

	/**
	 * Compute dynamic classes on .blocking-trk and return it as an object.
	 * @param  {Object} tracker    tracker object
	 */
	static computeTrackerClasses(tracker) {
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

		return {
			trackerClasses: classes.join(' '),
			warningImageTitle: updated_title,
		};
	}

	/**
	 * Implement handler for clicking on the tracker global block/unblock checkbox.
	 * Trigger action which persists new tracker blocked state and spawns
	 * re-rendering of the checkbox. It also shows notification to inform
	 * user that the page should be reloaded.
	 */
	clickTrackerStatus() {
		const {
			actions,
			tracker,
			paused_blocking,
			sitePolicy,
			smartBlockActive,
			smartBlock,
			cat_id,
		} = this.props;
		const blocked = !tracker.blocked;

		if (paused_blocking || sitePolicy) {
			return;
		}

		actions.updateTrackerBlocked({
			smartBlockActive,
			smartBlock,
			app_id: tracker.id,
			cat_id,
			blocked,
		});

		actions.showNotification({
			updated: `${tracker.id}_blocked`,
			reload: true,
		});
	}

	/**
	 * Implement handler for clicking on the tracker site-specific trust icon.
	 * Trigger actions which persist the new setting and notify user
	 * that the page should be reloaded.
	 */
	clickTrackerTrust() {
		const { actions, tracker, cat_id } = this.props;
		const ss_allowed = !tracker.ss_allowed;
		actions.updateTrackerTrustRestrict({
			app_id: tracker.id,
			cat_id,
			trust: ss_allowed,
			restrict: false,
		});

		actions.showNotification({
			updated: `${tracker.id}_ss_allowed`,
			reload: true,
		});
	}

	/**
	 * Implement handler for clicking on the tracker site-specific block icon.
	 * Trigger actions which persist the new setting and notify user
	 * that the page should be reloaded.
	 */
	clickTrackerRestrict() {
		const { actions, tracker, cat_id } = this.props;
		const ss_blocked = !tracker.ss_blocked;
		actions.updateTrackerTrustRestrict({
			app_id: tracker.id,
			cat_id,
			trust: false,
			restrict: ss_blocked,
		});

		actions.showNotification({
			updated: `${tracker.id}_ss_blocked`,
			reload: true,
		});
	}

	/**
	 * Implement handler for clicking on the trust or scrub SVGs for an unknown tracker
	 * Trigger actions which persist the new setting and notify user
	 * that the page should be reloaded.
	 */
	handleCliqzTrackerWhitelist() {
		const { actions, tracker } = this.props;

		actions.updateCliqzModuleWhitelist(tracker);
		actions.showNotification({
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
						{oneOrMoreCookies && Tracker._renderCliqzCookieStat(cliqzCookieCount)}
						{oneOrMoreFingerprints && Tracker._renderCliqzFingerprintStat(cliqzFingerprintCount)}
					</div>
				)}
				{oneOrMoreAds && (
					<div className="trk-cliqz-stats-container">
						{this._renderCliqzAdsIcon()}
						{Tracker._renderCliqzAdStat(cliqzAdCount)}
					</div>
				)}
			</div>
		);
	}

	_renderCliqzCookiesAndFingerprintsIcon() {
		return (
			<svg className={`trk-cliqz-stats-icon cookies-and-fingerprints-icon ${this.context}`} width="15" height="10" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
				<path fillRule="evenodd" strokeWidth=".96" d="M5.085 1.013a.288.288 0 0 0-.17 0l-3.66.97A.328.328 0 0 0 1 2.308c.017 2.606 1.413 5.024 3.813 6.642.05.034.119.051.187.051a.344.344 0 0 0 .187-.051C7.587 7.33 8.983 4.913 9 2.307a.328.328 0 0 0-.255-.323l-3.66-.971z" />
			</svg>
		);
	}

	_renderCliqzAdsIcon() {
		return (
			<svg className={`trk-cliqz-stats-icon ads-icon ${this.context}`} width="15" height="10" viewBox="0 0 11 11" xmlns="http://www.w3.org/2000/svg">
				<g fillRule="evenodd">
					<path className="inner-background" d="M7.49 1.234L9.922 3.89l-.157 3.6L7.11 9.922l-3.6-.157L1.078 7.11l.157-3.6L3.89 1.078z" />
					<path d="M2.788 8.54c.315.315.628.63.944.943.023.023.067.035.103.035 1.077.001 2.153.002 3.23-.001.04 0 .09-.02.117-.048a820.63 820.63 0 0 0 2.285-2.285.184.184 0 0 0 .05-.116c.003-1.08.003-2.16.002-3.24-.001-.03-.008-.068-.026-.088-.316-.321-.635-.64-.95-.956L2.789 8.54m-.436-.433l5.754-5.754c-.308-.309-.621-.623-.937-.936a.16.16 0 0 0-.102-.036 709.213 709.213 0 0 0-3.231 0c-.04 0-.09.02-.118.048-.765.762-1.53 1.525-2.291 2.29a.16.16 0 0 0-.045.1 928.271 928.271 0 0 0 0 3.26c0 .029.01.065.03.085.314.318.631.634.94.943m7.752-2.652c0 .581-.002 1.162.002 1.743a.405.405 0 0 1-.127.31 879.44 879.44 0 0 0-2.47 2.47.398.398 0 0 1-.303.128c-1.17-.003-2.341-.003-3.512 0a.4.4 0 0 1-.302-.126A884.3 884.3 0 0 0 .915 7.503a.385.385 0 0 1-.121-.294c.002-1.17.002-2.342 0-3.513 0-.122.036-.216.123-.303.827-.824 1.653-1.65 2.477-2.477a.388.388 0 0 1 .293-.123c1.174.002 2.348.002 3.523 0 .119 0 .21.038.293.122.827.83 1.655 1.657 2.484 2.484.081.08.12.17.119.285-.004.59-.002 1.181-.002 1.771" />
				</g>
			</svg>
		);
	}

	static _renderCliqzCookieStat(count) { return Tracker._renderCliqzStat(count, 'cookie'); }

	static _renderCliqzFingerprintStat(count) { return Tracker._renderCliqzStat(count, 'fingerprint'); }

	static _renderCliqzAdStat(count) { return Tracker._renderCliqzStat(count, 'ad'); }

	static _renderCliqzStat(count, type) {
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
		const {
			tracker, isUnknown, language, show_tracker_urls
		} = this.props;
		const {
			trackerClasses,
			description,
			warningImageTitle,
			showMoreInfo,
			showTrackerLearnMore,
		} = this.state;

		let sources;
		if (tracker.sources) {
			sources = tracker.sources.map(source => (
				<a
					target="_blank"
					rel="noopener noreferrer"
					className="trk-src-link"
					title={source.src}
					key={source.request_id}
					href={`${globals.GCACHE_BASE_URL}/${encodeURIComponent(language)}/gcache/?n=${encodeURIComponent(tracker.name)}&s=${encodeURIComponent(source.src)}&v=2&t=${source.type}`}
				>
					{ source.src }
				</a>
			));
		} else if (tracker.domains) {
			sources = tracker.domains.map(domain => (
				<p className="trk-src-link unknown" key={domain}>{domain}</p>
			));
		}

		const trackerNameClasses = ClassNames('trk-name', {
			'is-whitelisted': tracker.whitelisted && !tracker.siteRestricted,
		});

		return (
			<div className={`${trackerClasses} blocking-trk`}>
				<div className="row align-middle trk-header">
					<div className="columns shrink">
						<div className={`warning-image right${warningImageTitle ? ' t-tooltip-up-right' : ''}`} data-g-tooltip={warningImageTitle} />
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
							tracker.ss_allowed,
							tracker.ss_blocked,
							this.clickTrackerTrust,
							this.clickTrackerRestrict,
							this.clickTrackerStatus,
						)}
						{isUnknown && renderUnknownTrackerButtons(
							this.handleCliqzTrackerWhitelist,
							tracker.whitelisted,
							tracker.siteRestricted,
							tracker.type,
							this.context
						)}
					</div>
				</div>
				{showMoreInfo && (
					<div className={`${!showMoreInfo ? 'hide' : ''} row trk-moreinfo`}>
						<div className="columns">
							{!isUnknown && (
								<div className="trk-description">
									{description}
									<div className={(!showTrackerLearnMore ? 'hide' : '')}>
										<a target="_blank" rel="noopener noreferrer" title={tracker.name} href={`${globals.APPS_BASE_URL}/${language}/apps/${encodeURIComponent(tracker.name.replace(/\s+/g, '_').toLowerCase())}`}>
											{t('tracker_description_learn_more')}
										</a>
									</div>
								</div>
							)}
							<div className={`${!show_tracker_urls ? 'hide' : ''}`}>
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
