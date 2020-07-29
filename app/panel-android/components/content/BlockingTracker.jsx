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
		// TODO here switch to Anti track icon
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

	renderUnknownOverflow() {
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

	renderTrackerOverflow() {
		const trackerSelect = this.trackerSelectStatus;
		if (trackerSelect === 'antiTracking' || trackerSelect === 'adBlock') {
			return this.renderUnknownOverflow();
		}
		if (trackerSelect === 'override-sb') {
			return this.renderSmartBlockOverflow();
		}

		return this.renderBlockingOverflow();
	}

	render() {
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
				{this.renderTrackerStatus()}
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
