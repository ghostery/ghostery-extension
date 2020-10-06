/**
 * Blocking Tracker Component
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
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import getSlugFromTrackerId from '../../utils/tracker-info';

class BlockingTracker extends React.Component {
	get trackerSelectStatus() {
		const { type, siteProps, tracker } = this.props;
		const { isTrusted, isRestricted } = siteProps;
		const {
			blocked,
			catId = '',
			ss_allowed = false,
			ss_blocked = false,
			warningSmartBlock = false,
		} = tracker;

		if (type === 'site') {
			if (warningSmartBlock) {
				return 'override-sb';
			}

			if (isTrusted) {
				return 'trusted';
			}

			if (isRestricted) {
				return 'restricted';
			}

			if (ss_allowed) {
				return 'trusted';
			}

			if (ss_blocked) {
				return 'restricted';
			}

			if (blocked) {
				return 'blocked';
			}

			if (catId !== '') {
				return catId;
			}
		}

		if (blocked) {
			return 'blocked';
		}

		return '';
	}

	get selectDisabled() {
		const { type, siteProps } = this.props;
		const { isTrusted, isRestricted, isPaused } = siteProps;

		if (type === 'site') {
			return isTrusted || isRestricted || isPaused;
		}

		return false;
	}

	get selectBlockDisabled() {
		const { tracker } = this.props;
		const { ss_allowed = false, ss_blocked = false } = tracker;

		return this.selectDisabled || ss_allowed || ss_blocked;
	}

	openTrackerInfoLink = (event) => {
		event.stopPropagation();
		const { tracker } = this.props;
		const slug = (tracker.wtm) ? tracker.wtm : getSlugFromTrackerId(tracker.id);
		const tab = window.open(`https://whotracks.me/trackers/${slug}.html`, '_blank');
		tab.focus();
	}

	clickBlock = () => {
		const {
			type,
			tracker,
			categoryId,
			callGlobalAction,
		} = this.props;
		const { id, blocked } = tracker;

		if (this.selectBlockDisabled) {
			return;
		}

		if (type === 'site') {
			callGlobalAction({
				actionName: 'trustRestrictBlockSiteTracker',
				actionData: {
					app_id: id,
					cat_id: categoryId,
					block: !blocked,
					trust: false,
					restrict: false,
				}
			});
		} else if (type === 'global') {
			callGlobalAction({
				actionName: 'blockUnblockGlobalTracker',
				actionData: {
					app_id: id,
					cat_id: categoryId,
					block: !blocked,
				}
			});
		}
	}

	clickRestrict = () => {
		const { tracker, categoryId, callGlobalAction } = this.props;
		const { id, blocked, ss_blocked = false } = tracker;

		if (this.selectDisabled) {
			return;
		}

		callGlobalAction({
			actionName: 'trustRestrictBlockSiteTracker',
			actionData: {
				app_id: id,
				cat_id: categoryId,
				restrict: !ss_blocked,
				trust: false,
				block: blocked, // Keep blocking
			}
		});
	}

	clickTrust = () => {
		const { tracker, categoryId, callGlobalAction } = this.props;
		const { id, blocked, ss_allowed = false } = tracker;

		if (this.selectDisabled) {
			return;
		}

		callGlobalAction({
			actionName: 'trustRestrictBlockSiteTracker',
			actionData: {
				app_id: id,
				cat_id: categoryId,
				restrict: false,
				trust: !ss_allowed,
				block: blocked, // Keep blocking
			}
		});
	}

	clickAnonymize = () => {
		const {	tracker, callGlobalAction } = this.props;

		if (this.selectDisabled) {
			return;
		}

		callGlobalAction({
			actionName: 'anonymizeSiteTracker',
			actionData: {
				unidentifiedTracker: tracker,
			}
		});
	}

	renderTrackerModified() {
		const { type, tracker } = this.props;
		const { cliqzAdCount, cliqzCookieCount, cliqzFingerprintCount } = tracker;

		if (type === 'global') {
			return null;
		}

		return (
			<div>
				{cliqzAdCount > 0 && (
					<span className="RequestModified RequestModified--ad">
						{`${cliqzAdCount} ${cliqzAdCount === 1 ? t('ad') : t('ads')}`}
					</span>
				)}
				{cliqzCookieCount > 0 && (
					<span className="RequestModified RequestModified--cookie">
						{`${cliqzCookieCount} ${cliqzCookieCount === 1 ? t('cookie') : t('cookies')}`}
					</span>
				)}
				{cliqzFingerprintCount > 0 && (
					<span className="RequestModified RequestModified--fingerprint">
						{`${cliqzFingerprintCount} ${cliqzFingerprintCount === 1 ? t('fingerprint') : t('fingerprints')}`}
					</span>
				)}
			</div>
		);
	}

	renderTrackerStatus() {
		const trackerSelect = this.trackerSelectStatus;
		const trackerSelectClassNames = ClassNames({
			OverrideSmartBlock: trackerSelect === 'override-sb',
			BlockingSelectButton: trackerSelect.indexOf('override-') === -1,
			BlockingSelectButton__blocked: trackerSelect === 'blocked',
			BlockingSelectButton__trusted: trackerSelect === 'trusted',
			BlockingSelectButton__restricted: trackerSelect === 'restricted',
		});

		return (
			<div className={trackerSelectClassNames} />
		);
	}

	renderUnidentifiedTrackerStatus() {
		const { siteProps, tracker } = this.props;
		const trackerSelect = this.trackerSelectStatus;
		const svgContainerClasses = ClassNames('UnidentifiedSVGContainer', {
			whitelisted: tracker.whitelisted && !siteProps.isRestricted,
			siteRestricted: siteProps.isRestricted,
		});
		const borderClassNames = ClassNames('border', {
			protected: trackerSelect === 'antiTracking',
			restricted: trackerSelect !== 'antiTracking',
		});
		const backgroundClassNames = ClassNames('background', {
			protected: trackerSelect === 'antiTracking',
			restricted: trackerSelect !== 'antiTracking',
		});

		return (
			<div className={svgContainerClasses}>
				<svg className="cliqz-tracker-trust" width="20px" height="20px" viewBox="0 0 20 20">
					<g transform="translate(1 1)" fill="none" fillRule="evenodd">
						<path className="border" stroke="#96C761" d="M-.5-.5h18.3v18.217H-.5z" />
						<path className="background" stroke="#FFF" fill="#96C761" d="M.5.5h16.3v16.217H.5z" />
						<svg width="20px" height="20px" viewBox="-2.75 -2.75 20 20">
							<circle className="trust-circle" stroke="#FFF" cx="5.875" cy="5.875" r="5.875" fillRule="evenodd" />
						</svg>
					</g>
				</svg>
				<svg className="cliqz-tracker-scrub" width="20px" height="20px" viewBox="0 0 20 20">
					<g transform="translate(1 1)" fill="none" fillRule="evenodd">
						<path className={borderClassNames} d="M-.5-.5h18.3v18.217H-.5z" />
						<path className={backgroundClassNames} d="M.5.5h16.3v16.217H.5z" />
						{trackerSelect === 'antiTracking' ? (
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 19.5 19.5">
								<g transform="translate(2.5 2.5)">
									<path className="shield" fill="none" fillRule="evenodd" stroke="#FFF" strokeWidth="1.4" d="M8.149 1.022a.505.505 0 0 0-.298 0l-6.404 1.7A.574.574 0 0 0 1 3.286c.03 4.56 2.472 8.792 6.672 11.624.09.06.209.089.328.089.12 0 .238-.03.328-.09 4.2-2.83 6.642-7.063 6.672-11.623a.574.574 0 0 0-.447-.566L8.15 1.022z" />
								</g>
							</svg>
						) : (
							<svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 20 20">
								<g fill="none" fillRule="evenodd" transform="translate(2 2)">
									<path className="shield" d="M10.101 1.922l3.183 3.473-.206 4.706-3.473 3.183-4.706-.206-3.183-3.473.206-4.706 3.473-3.183z" />
									<path className="shield" fill="#FFF" stroke="#FFF" d="M3.527 11.132c.416.417.83.833 1.247 1.246.03.03.09.046.137.046 1.424.003 2.847.003 4.272 0a.245.245 0 0 0 .154-.064c1.009-1.004 2.015-2.011 3.02-3.02a.244.244 0 0 0 .067-.154c.004-1.428.003-2.856.002-4.285 0-.039-.01-.09-.034-.116-.418-.424-.839-.845-1.255-1.263l-7.61 7.61m-.577-.572l7.608-7.609c-.408-.408-.821-.824-1.24-1.237a.21.21 0 0 0-.134-.047 937.737 937.737 0 0 0-4.272 0 .241.241 0 0 0-.156.062 1000.334 1000.334 0 0 0-3.03 3.029.211.211 0 0 0-.059.131 1227.38 1227.38 0 0 0 0 4.31.17.17 0 0 0 .04.113c.416.421.835.84 1.243 1.248M13.2 7.053c0 .769-.003 1.536.002 2.304a.536.536 0 0 1-.168.412c-1.091 1.086-2.18 2.175-3.266 3.265a.527.527 0 0 1-.4.168 997.623 997.623 0 0 0-4.644 0 .53.53 0 0 1-.4-.166C3.237 11.942 2.145 10.85 1.05 9.76a.508.508 0 0 1-.16-.389C.892 7.824.892 6.276.889 4.727c0-.162.049-.286.163-.4 1.095-1.09 2.187-2.181 3.276-3.275.11-.11.23-.163.387-.163 1.553.003 3.105.003 4.658 0 .158 0 .278.05.388.161 1.093 1.097 2.188 2.191 3.285 3.285a.498.498 0 0 1 .156.377c-.004.78-.002 1.56-.002 2.341" />
								</g>
							</svg>
						)}
					</g>
				</svg>
			</div>
		);
	}

	renderSmartBlockOverflow() {
		const { open, tracker } = this.props;
		const { warningSmartBlock } = tracker;
		const selectGroupClassNames = ClassNames('OverrideText full-height',
			'flex-container align-center-middle', {
				'OverrideText--open': open,
			});
		const text = (warningSmartBlock && warningSmartBlock === 'blocked') ?
			t('panel_tracker_warning_smartblock_tooltip') :
			t('panel_tracker_warning_smartunblock_tooltip');

		return (
			<div className={selectGroupClassNames}>
				<span>{text}</span>
			</div>
		);
	}

	renderBlockingOverflow() {
		const {
			type,
			open,
			tracker,
			settings,
		} = this.props;
		const { ss_allowed = false, ss_blocked = false, blocked } = tracker;
		const { toggle_individual_trackers = false } = settings;

		const selectGroupClassNames = ClassNames('BlockingSelectGroup full-height',
			'flex-container flex-dir-row-reverse', {
				'BlockingSelectGroup--open': open,
				'BlockingSelectGroup--wide': type === 'site' && toggle_individual_trackers,
				'BlockingSelectGroup--disabled': this.selectDisabled,
			});
		const selectBlockClassNames = ClassNames('BlockingSelect BlockingSelect__block',
			'full-height flex-child-grow', {
				'BlockingSelect--disabled': this.selectBlockDisabled,
			});

		return (
			<div className={selectGroupClassNames}>
				<div className={selectBlockClassNames} onClick={this.clickBlock}>
					{blocked ? t('android_unblock') : t('android_block')}
				</div>
				{type === 'site' && toggle_individual_trackers && (
					<div className="BlockingSelect BlockingSelect__restrict full-height flex-child-grow" onClick={this.clickRestrict}>
						{ss_blocked ? t('android_unrestrict') : t('android_restrict')}
					</div>
				)}
				{type === 'site' && toggle_individual_trackers && (
					<div className="BlockingSelect BlockingSelect__trust full-height flex-child-grow" onClick={this.clickTrust}>
						{ss_allowed ? t('android_untrust') : t('android_trust')}
					</div>
				)}
			</div>
		);
	}

	renderUnidentifiedOverflow() {
		const {
			open,
			tracker,
		} = this.props;
		const { whitelisted } = tracker;

		const selectGroupClassNames = ClassNames('BlockingSelectGroup full-height',
			'flex-container flex-dir-row-reverse', {
				'BlockingSelectGroup--open': open,
				'BlockingSelectGroup--disabled': this.selectDisabled,
			});

		return (
			<div className={selectGroupClassNames}>
				<div className="BlockingSelect BlockingSelect__anonymize full-height flex-child-grow" onClick={this.clickAnonymize}>
					{whitelisted ? t('android_anonymize') : t('android_trust')}
				</div>
			</div>
		);
	}

	renderTrackerOverflow() {
		const trackerSelect = this.trackerSelectStatus;
		if (trackerSelect === 'antiTracking' || trackerSelect === 'adBlock') {
			return this.renderUnidentifiedOverflow();
		}
		if (trackerSelect === 'override-sb') {
			return this.renderSmartBlockOverflow();
		}

		return this.renderBlockingOverflow();
	}

	render() {
		const trackerSelect = this.trackerSelectStatus;
		const { index, tracker, toggleTrackerSelectOpen } = this.props;
		const { name } = tracker;

		return (
			<div className="BlockingTracker flex-container align-middle full-height" onClick={() => { toggleTrackerSelectOpen(index); }}>
				<div className="BlockingTracker--noPointer">
					<div className="BlockingTracker__info" onClick={this.openTrackerInfoLink} />
				</div>
				<div className="BlockingTracker__name flex-child-grow">
					<div>{name}</div>
					{this.renderTrackerModified()}
				</div>
				{(trackerSelect === 'antiTracking' || trackerSelect === 'adBlock') ? this.renderUnidentifiedTrackerStatus() : this.renderTrackerStatus()}
				{this.renderTrackerOverflow()}
			</div>
		);
	}
}

BlockingTracker.propTypes = {
	index: PropTypes.number.isRequired,
	tracker: PropTypes.shape({
		id: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.number,
		]).isRequired,
		name: PropTypes.string.isRequired,
		ss_allowed: PropTypes.bool,
		ss_blocked: PropTypes.bool,
		blocked: PropTypes.bool.isRequired,
	}).isRequired,
	categoryId: PropTypes.string.isRequired,
	type: PropTypes.oneOf([
		'site',
		'global',
	]).isRequired,
	toggleTrackerSelectOpen: PropTypes.func.isRequired,
	open: PropTypes.bool.isRequired,
	siteProps: PropTypes.shape({
		isTrusted: PropTypes.bool.isRequired,
		isRestricted: PropTypes.bool.isRequired,
		isPaused: PropTypes.bool.isRequired,
	}).isRequired,
	settings: PropTypes.shape({}).isRequired,
	callGlobalAction: PropTypes.func.isRequired,
};

export default BlockingTracker;
