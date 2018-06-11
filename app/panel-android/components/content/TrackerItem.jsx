import React from 'react';
import PropTypes from 'prop-types';
import getUrlFromTrackerId from '../../utils/tracker-info';

export default class TrackerItem extends React.Component {

	toggleMenu = () => {
		this.props.toggleMenu(this.props.index);
	}

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

	clickButtonTrust = () => {
		const ss_allowed = !this.props.tracker.ss_allowed;

		this.context.callGlobalAction({
			actionName: 'trustRestrictBlockSiteTracker',
			actionData: {
				app_id: this.props.tracker.id,
				cat_id: this.props.categoryId,
				trust: ss_allowed,
				restrict: false,
				block: false,
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
				block: false,
			}
		});
		this.props.toggleMenu(this.props.index);
	}

	clickButtonBlock = () => {
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
		this.props.toggleMenu(this.props.index);
	}

	get showMenu() {
		return this.props.showMenu; /* && !this.context.siteProps.isTrusted && !this.context.siteProps.isRestricted; */
	}

	openTrackerLink = () => {
		const url = getUrlFromTrackerId(this.props.tracker.id);
		console.log('url', url);
		const win = window.open(url, '_blank');
		win.focus();
	}

	render() {
		return (
			<div className={`tracker ${this.showMenu ? 'show-menu' : ''} ${this.trackerSelectStatus}`}>
				<button className="info" onClick={this.openTrackerLink}></button>
				<div onClick={this.toggleMenu} className="trackerName">
					<span>{this.props.tracker.name}</span>
					<span className="trackerSelect"></span>
				</div>

				<div className={`menu ${this.props.type}`}>
					<button className="trackerOption trust" onClick={this.clickButtonTrust}>
						{this.props.tracker.ss_allowed ? 'Untrust': 'Trust'}
					</button>
					<button className="trackerOption restrict" onClick={this.clickButtonRestrict}>
						{this.props.tracker.ss_blocked ? 'Unrestrict': 'Restrict'}
					</button>
					<button className="trackerOption block" onClick={this.clickButtonBlock}>
						{this.props.tracker.blocked ? 'UnBlock': 'Block'}
					</button>
				</div>
			</div>
		);
	}
}

TrackerItem.propTypes = {
	toggleMenu: PropTypes.func,
	index: PropTypes.number,
	showMenu: PropTypes.bool,
	tracker: PropTypes.object,
	categoryId: PropTypes.string,
	type: PropTypes.string,
};

TrackerItem.contextTypes = {
	callGlobalAction: PropTypes.func,
	siteProps: PropTypes.object,
};
