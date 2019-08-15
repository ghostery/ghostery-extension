/**
 * Global Tracker Component
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
import globals from '../../../../src/classes/Globals';
import { log } from '../../../../src/utils/common';
import { sendMessageInPromise } from '../../utils/msg';
import blocked from '../../../data-images/blocked';
import unblocked from '../../../data-images/unblocked';
/**
 * @class Implement Tracker component which represents single tracker
 * in the Global Blocking subview of Settings. Its structure is different
 * from the related Tracker component used in Blocking view mostly because
 * of the performance issues. Global Blocking view handles full list of
 * trackers, while Blocking view handles a much smaller subset detected
 * an a particular page.
  * @memberOf BlockingComponents
 */
class GlobalTracker extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			description: '',
			showMoreInfo: false,
			showTrackerLearnMore: false,
		};

		// click bindings
		this.toggleDescription = this.toggleDescription.bind(this);
		this.clickTrackerStatus = this.clickTrackerStatus.bind(this);
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
	 * Implement handler for clicking on the tracker block/unblock checkbox.
	 * Trigger action which persists new tracker blocked state and spawns re-rendering
	 * of the checkbox. It also shows alert to inform user that new setting was saved.
	 * @todo  Toast shows always. It does not reflect actual success.
	 */
	clickTrackerStatus() {
		const isBlocked = !this.props.tracker.blocked;
		this.props.actions.updateTrackerBlocked({
			app_id: this.props.tracker.id,
			cat_id: this.props.cat_id,
			blocked: isBlocked,
		});
		this.props.showToast({
			text: t('global_settings_saved_tracker')
		});
	}

	/**
	* Render a tracker in Global Blocking subview of Settings.
	* @return {ReactComponent}   ReactComponent instance
	*/
	render() {
		const { tracker } = this.props;
		return (
			<div className="global-blocking-trk">
				<div className="row align-middle trk-header">
					<div className="columns trk-title">
						<div onClick={this.toggleDescription}>{ tracker.name }</div>
					</div>
					<div className="columns shrink">
						<img src={tracker.blocked ? blocked : unblocked} onClick={this.clickTrackerStatus} />
					</div>
				</div>
				{
					this.state.showMoreInfo && (
						<div className="row align-middle">
							<div className="columns global-trk-desc">
								{ this.state.description }
								{
									this.state.showTrackerLearnMore && (
										<div className={(!this.state.showTrackerLearnMore ? 'hide' : '')}>
											<a target="_blank" rel="noopener noreferrer" title={tracker.name} href={`https://${globals.APPS_SUB_DOMAIN}.ghostery.com/${this.props.language}/apps/${encodeURIComponent(tracker.name.replace(/\s+/g, '_').toLowerCase())}`}>
												{ t('tracker_description_learn_more') }
											</a>
										</div>
									)}
							</div>
						</div>
					)}
			</div>
		);
	}
}

GlobalTracker.defaultProps = {
	tracker: {},
};

export default GlobalTracker;
