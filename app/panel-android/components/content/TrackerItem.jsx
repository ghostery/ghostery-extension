/**
 * TrackerItem Component
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
import PropTypes from 'prop-types';
import getUrlFromTrackerId from '../../utils/tracker-info';

export default class TrackerItem extends React.Component {
	get trackerSelectStatus() {
		const { type, tracker } = this.props;
		const { siteProps } = this.context;
		// Only for site trackers
		if (type === 'site-trackers') {
			if (siteProps.isTrusted) {
				return 'trusted';
			}

			if (siteProps.isRestricted) {
				return 'restricted';
			}
		}

		if (tracker.ss_allowed) {
			return 'trusted';
		}

		if (tracker.ss_blocked) {
			return 'restricted';
		}

		if (tracker.blocked) {
			return 'blocked';
		}

		return '';
	}

	get showMenu() {
		const { showMenu } = this.props;
		return showMenu;
	}

	get disabledStatus() {
		return ['trusted', 'restricted'].includes(this.trackerSelectStatus) ? 'disabled' : '';
	}

	clickButtonTrust = () => {
		const {
			tracker, categoryId, index, toggleMenu
		} = this.props;
		const { callGlobalAction } = this.context;
		const ss_allowed = !tracker.ss_allowed;

		callGlobalAction({
			actionName: 'trustRestrictBlockSiteTracker',
			actionData: {
				app_id: tracker.id,
				cat_id: categoryId,
				trust: ss_allowed,
				restrict: false,
				block: tracker.blocked, // Keep blocking
			}
		});
		toggleMenu(index); // Hide menu
	}

	clickButtonRestrict = () => {
		const {
			tracker, categoryId, index, toggleMenu
		} = this.props;
		const { callGlobalAction } = this.context;
		const ss_blocked = !tracker.ss_blocked;
		callGlobalAction({
			actionName: 'trustRestrictBlockSiteTracker',
			actionData: {
				app_id: tracker.id,
				cat_id: categoryId,
				restrict: ss_blocked,
				trust: false,
				block: tracker.blocked, // Keep blocking
			}
		});
		toggleMenu(index);
	}

	clickButtonBlock = (hideMenu = true) => {
		// onClick={(e) => { e.stopPropagation(); this.clickButtonBlock(false); }}
		const {
			tracker, type, categoryId, index, toggleMenu
		} = this.props;
		const { callGlobalAction } = this.context;
		if (this.disabledStatus) {
			return;
		}

		const blocked = !tracker.blocked;

		if (type === 'site-trackers') {
			callGlobalAction({
				actionName: 'trustRestrictBlockSiteTracker',
				actionData: {
					app_id: tracker.id,
					cat_id: categoryId,
					block: blocked,
					trust: false,
					restrict: false,
				}
			});
		} else {
			callGlobalAction({
				actionName: 'blockUnblockGlobalTracker',
				actionData: {
					app_id: tracker.id,
					cat_id: categoryId,
					block: blocked,
				}
			});
		}

		if (hideMenu) {
			toggleMenu(index);
		}
	}

	openTrackerLink = () => {
		const { tracker } = this.props;
		const url = getUrlFromTrackerId(tracker.id);
		const win = window.open(url, '_blank');
		win.focus();
	}

	toggleMenu = () => {
		const { index, toggleMenu } = this.props;
		toggleMenu(index);
	}

	render() {
		const { tracker, type } = this.props;
		return (
			<li>
				<div className={`tracker ${this.showMenu ? 'show-menu' : ''} ${this.trackerSelectStatus}`}>
					<button type="button" className="info" aria-label="Info" onClick={this.openTrackerLink} />
					<div onClick={this.toggleMenu} className="trackerName">
						<span>{tracker.name}</span>
						<span className="trackerSelect" />
					</div>

					<div className={`menu ${type}`}>
						<button type="button" className="trackerOption trust" onClick={this.clickButtonTrust}>
							{tracker.ss_allowed ? 'Untrust' : 'Trust'}
						</button>
						<button type="button" className="trackerOption restrict" onClick={this.clickButtonRestrict}>
							{tracker.ss_blocked ? 'Unrestrict' : 'Restrict'}
						</button>
						<button type="button" className={`trackerOption block ${this.disabledStatus}`} onClick={this.clickButtonBlock}>
							{tracker.blocked ? 'UnBlock' : 'Block'}
						</button>
					</div>
				</div>
			</li>
		);
	}
}

TrackerItem.propTypes = {
	toggleMenu: PropTypes.func.isRequired,
	index: PropTypes.number.isRequired,
	showMenu: PropTypes.bool,
	tracker: PropTypes.shape,
	categoryId: PropTypes.string,
	type: PropTypes.string,
};

TrackerItem.defaultProps = {
	showMenu: false,
	tracker: {},
	categoryId: '',
	type: '',
};

TrackerItem.contextTypes = {
	callGlobalAction: PropTypes.func,
	siteProps: PropTypes.shape,
};
