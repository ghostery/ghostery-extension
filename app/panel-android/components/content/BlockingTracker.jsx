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
		const { ss_allowed, ss_blocked, blocked } = tracker;

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
		const { ss_allowed, ss_blocked } = tracker;

		return this.selectDisabled || ss_allowed || ss_blocked;
	}

	// clickButtonTrust = () => {
	// 	const {
	// 		tracker, categoryId, index, toggleMenu, callGlobalAction
	// 	} = this.props;
	// 	const ss_allowed = !tracker.ss_allowed;
	//
	// 	callGlobalAction({
	// 		actionName: 'trustRestrictBlockSiteTracker',
	// 		actionData: {
	// 			app_id: tracker.id,
	// 			cat_id: categoryId,
	// 			trust: ss_allowed,
	// 			restrict: false,
	// 			block: tracker.blocked, // Keep blocking
	// 		}
	// 	});
	// 	toggleMenu(index); // Hide menu
	// }
	//
	// clickButtonRestrict = () => {
	// 	const {
	// 		tracker, categoryId, index, toggleMenu, callGlobalAction
	// 	} = this.props;
	// 	const ss_blocked = !tracker.ss_blocked;
	// 	callGlobalAction({
	// 		actionName: 'trustRestrictBlockSiteTracker',
	// 		actionData: {
	// 			app_id: tracker.id,
	// 			cat_id: categoryId,
	// 			restrict: ss_blocked,
	// 			trust: false,
	// 			block: tracker.blocked, // Keep blocking
	// 		}
	// 	});
	// 	toggleMenu(index);
	// }
	//
	// clickButtonBlock = (hideMenu = true) => {
	// 	// onClick={(e) => { e.stopPropagation(); this.clickButtonBlock(false); }}
	// 	const {
	// 		tracker, type, categoryId, index, toggleMenu, callGlobalAction
	// 	} = this.props;
	// 	if (this.disabledStatus) {
	// 		return;
	// 	}
	//
	// 	const blocked = !tracker.blocked;
	//
	// 	if (type === 'site-trackers') {
	// 		callGlobalAction({
	// 			actionName: 'trustRestrictBlockSiteTracker',
	// 			actionData: {
	// 				app_id: tracker.id,
	// 				cat_id: categoryId,
	// 				block: blocked,
	// 				trust: false,
	// 				restrict: false,
	// 			}
	// 		});
	// 	} else {
	// 		callGlobalAction({
	// 			actionName: 'blockUnblockGlobalTracker',
	// 			actionData: {
	// 				app_id: tracker.id,
	// 				cat_id: categoryId,
	// 				block: blocked,
	// 			}
	// 		});
	// 	}
	//
	// 	if (hideMenu) {
	// 		toggleMenu(index);
	// 	}
	// }

	openTrackerInfoLink = (event) => {
		event.stopPropagation();
		const { tracker } = this.props;
		const url = getUrlFromTrackerId(tracker.id);
		const tab = window.open(url, '_blank');
		tab.focus();
	}

	renderTrackerSelect() {
		const trackerSelect = this.trackerSelectStatus;
		const trackerSelectClassNames = ClassNames('BlockingSelectButton', {
			BlockingSelectButton__blocked: trackerSelect === 'blocked',
			BlockingSelectButton__trusted: trackerSelect === 'trusted',
			BlockingSelectButton__restricted: trackerSelect === 'restricted',
		});

		return (
			<div className={trackerSelectClassNames} />
		);
	}

	render() {
		const {
			index,
			tracker,
			open,
			toggleTrackerSelectOpen,
		} = this.props;
		const { name } = tracker;

		return (
			<div className="BlockingTracker flex-container align-middle full-height" onClick={() => { toggleTrackerSelectOpen(index); }}>
				<div className="BlockingTracker--noPointer">
					<div className="BlockingTracker__info" onClick={this.openTrackerInfoLink} />
				</div>
				<div className="BlockingTracker__name flex-child-grow">{name}</div>
				{this.renderTrackerSelect()}
				{open && (
					<span>im open</span>
				)}
			</div>
		);

		// 		<div className={`tracker ${this.showMenu ? 'show-menu' : ''} ${this.trackerSelectStatus}`}>
		// 			<button type="button" className="info" aria-label="Info" onClick={this.openTrackerLink} />
		// 			<div onClick={this.toggleMenu} className="trackerName">
		// 				<span>{tracker.name}</span>
		// 				<span className="trackerSelect" />
		// 			</div>
		//
		// 			<div className={`menu ${type}`}>
		// 				<button type="button" className="trackerOption trust" onClick={this.clickButtonTrust}>
		// 					{tracker.ss_allowed ? 'Untrust' : 'Trust'}
		// 				</button>
		// 				<button type="button" className="trackerOption restrict" onClick={this.clickButtonRestrict}>
		// 					{tracker.ss_blocked ? 'Unrestrict' : 'Restrict'}
		// 				</button>
		// 				<button type="button" className={`trackerOption block ${this.disabledStatus}`} onClick={this.clickButtonBlock}>
		// 					{tracker.blocked ? 'UnBlock' : 'Block'}
		// 				</button>
		// 			</div>
		// 		</div>
	}
}

BlockingTracker.propTypes = {
	index: PropTypes.number.isRequired,
	tracker: PropTypes.shape({
		id: PropTypes.number.isRequired,
		name: PropTypes.string.isRequired,
		ss_allowed: PropTypes.bool.isRequired,
		ss_blocked: PropTypes.bool.isRequired,
		blocked: PropTypes.bool.isRequired,
	}).isRequired,
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
	// callGlobalAction: PropTypes.func.isRequired,
};

export default BlockingTracker;
