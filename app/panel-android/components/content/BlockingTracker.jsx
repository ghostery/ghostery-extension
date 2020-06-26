/**
 * BlockingTracker Component
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
import getUrlFromTrackerId from '../../utils/tracker-info';

class BlockingTracker extends React.Component {
	get trackerSelectStatus() {
		const { type, siteProps, tracker } = this.props;
		const { isTrusted, isRestricted } = siteProps;
		const { blocked, ss_allowed = false, ss_blocked = false } = tracker;

		if (type === 'site-trackers') {
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
		}

		if (blocked) {
			return 'blocked';
		}

		return '';
	}

	get selectDisabled() {
		const { type, siteProps } = this.props;
		const { isTrusted, isRestricted, isPaused } = siteProps;

		if (type === 'site-trackers') {
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
		const url = getUrlFromTrackerId(tracker.id);
		const tab = window.open(url, '_blank');
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

		if (type === 'site-trackers') {
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
		} else if (type === 'global-trackers') {
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

	renderTrackerSelect() {
		const trackerSelect = this.trackerSelectStatus;
		const trackerSelectClassNames = ClassNames('BlockingSelectButton', {
			BlockingSelectButton__blocked: trackerSelect === 'blocked',
			BlockingSelectButton__trusted: trackerSelect === 'trusted',
			BlockingSelectButton__restricted: trackerSelect === 'restricted',
		});

		return (
			<div className={trackerSelectClassNames} onClick={this.clickTrackerSelect} />
		);
	}

	renderBlockingSelectGroup() {
		const { type, open, tracker } = this.props;
		const { ss_allowed = false, ss_blocked = false, blocked } = tracker;
		const selectGroupClassNames = ClassNames('BlockingSelectGroup full-height',
			'flex-container flex-dir-row-reverse', {
				'BlockingSelectGroup--open': open,
				'BlockingSelectGroup--wide': type === 'site-trackers',
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
				{type === 'site-trackers' && (
					<div className="BlockingSelect BlockingSelect__restrict full-height flex-child-grow" onClick={this.clickRestrict}>
						{ss_blocked ? t('android_unrestrict') : t('android_restrict')}
					</div>
				)}
				{type === 'site-trackers' && (
					<div className="BlockingSelect BlockingSelect__trust full-height flex-child-grow" onClick={this.clickTrust}>
						{ss_allowed ? t('android_untrust') : t('android_trust')}
					</div>
				)}
			</div>
		);
	}

	render() {
		const { index, tracker, toggleTrackerSelectOpen } = this.props;
		const { name } = tracker;

		return (
			<div className="BlockingTracker flex-container align-middle full-height" onClick={() => { toggleTrackerSelectOpen(index); }}>
				<div className="BlockingTracker--noPointer">
					<div className="BlockingTracker__info" onClick={this.openTrackerInfoLink} />
				</div>
				<div className="BlockingTracker__name flex-child-grow">{name}</div>
				{this.renderTrackerSelect()}
				{this.renderBlockingSelectGroup()}
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
		'site-trackers',
		'global-trackers',
	]).isRequired,
	toggleTrackerSelectOpen: PropTypes.func.isRequired,
	open: PropTypes.bool.isRequired,
	siteProps: PropTypes.shape({
		isTrusted: PropTypes.bool.isRequired,
		isRestricted: PropTypes.bool.isRequired,
		isPaused: PropTypes.bool.isRequired,
	}).isRequired,
	callGlobalAction: PropTypes.func.isRequired,
};

export default BlockingTracker;
