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
		// Only for site trackers
		if (this.props.type === 'site-trackers') {
			if (this.context.siteProps.isTrusted) {
				return 'trusted';
			}

			if (this.context.siteProps.isRestricted) {
				return 'restricted';
			}
		}

		if (this.props.tracker.ss_allowed) {
			return 'trusted';
		}

		if (this.props.tracker.ss_blocked) {
			return 'restricted';
		}

		if (this.props.tracker.blocked) {
			return 'blocked';
		}

		return '';
	}

	get showMenu() {
		return this.props.showMenu;
	}

	get disabledStatus() {
		return ['trusted', 'restricted'].includes(this.trackerSelectStatus) ? 'disabled' : '';
	}

	clickButtonTrust = () => {
		const ss_allowed = !this.props.tracker.ss_allowed;

		this.context.callGlobalAction({
			actionName: 'trustRestrictBlockSiteTracker',
			actionData: {
				app_id: this.props.tracker.id,
				cat_id: this.props.categoryId,
				trust: ss_allowed,
				restrict: false,
				block: this.props.tracker.blocked, // Keep blocking
			}
		});
		this.props.toggleMenu(this.props.index); // Hide menu
	}

	clickButtonRestrict = () => {
		const ss_blocked = !this.props.tracker.ss_blocked;
		this.context.callGlobalAction({
			actionName: 'trustRestrictBlockSiteTracker',
			actionData: {
				app_id: this.props.tracker.id,
				cat_id: this.props.categoryId,
				restrict: ss_blocked,
				trust: false,
				block: this.props.tracker.blocked, // Keep blocking
			}
		});
		this.props.toggleMenu(this.props.index);
	}

	clickButtonBlock = (hideMenu = true) => {
		// onClick={(e) => { e.stopPropagation(); this.clickButtonBlock(false); }}
		if (this.disabledStatus) {
			return;
		}

		const blocked = !this.props.tracker.blocked;

		if (this.props.type === 'site-trackers') {
			this.context.callGlobalAction({
				actionName: 'trustRestrictBlockSiteTracker',
				actionData: {
					app_id: this.props.tracker.id,
					cat_id: this.props.categoryId,
					block: blocked,
					trust: false,
					restrict: false,
				}
			});
		} else {
			this.context.callGlobalAction({
				actionName: 'blockUnblockGlobalTracker',
				actionData: {
					app_id: this.props.tracker.id,
					cat_id: this.props.categoryId,
					block: blocked,
				}
			});
		}

		if (hideMenu) {
			this.props.toggleMenu(this.props.index);
		}
	}

	openTrackerLink = () => {
		const url = getUrlFromTrackerId(this.props.tracker.id);
		const win = window.open(url, '_blank');
		win.focus();
	}

	toggleMenu = () => {
		this.props.toggleMenu(this.props.index);
	}

	render() {
		return (
			<li>
				<div className={`tracker ${this.showMenu ? 'show-menu' : ''} ${this.trackerSelectStatus}`}>
					<button className="info" onClick={this.openTrackerLink} />
					<div onClick={this.toggleMenu} className="trackerName">
						<span>{this.props.tracker.name}</span>
						<span className="trackerSelect" />
					</div>

					<div className={`menu ${this.props.type}`}>
						<button className="trackerOption trust" onClick={this.clickButtonTrust}>
							{this.props.tracker.ss_allowed ? 'Untrust' : 'Trust'}
						</button>
						<button className="trackerOption restrict" onClick={this.clickButtonRestrict}>
							{this.props.tracker.ss_blocked ? 'Unrestrict' : 'Restrict'}
						</button>
						<button className={`trackerOption block ${this.disabledStatus}`} onClick={this.clickButtonBlock}>
							{this.props.tracker.blocked ? 'UnBlock' : 'Block'}
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
	tracker: PropTypes.object, // eslint-disable-line react/forbid-prop-types
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
	siteProps: PropTypes.object,
};
