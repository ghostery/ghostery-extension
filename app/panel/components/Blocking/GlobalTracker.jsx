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
		const { tracker, language } = this.props;
		const { description } = this.state;
		this.setState(prevState => ({ showMoreInfo: !prevState.showMoreInfo }));

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
	 * Implement handler for clicking on the tracker block/unblock checkbox.
	 * Trigger action which persists new tracker blocked state and spawns re-rendering
	 * of the checkbox. It also shows alert to inform user that new setting was saved.
	 * @todo  Toast shows always. It does not reflect actual success.
	 */
	clickTrackerStatus() {
		const {
			actions, tracker, cat_id, showToast
		} = this.props;
		const isBlocked = !tracker.blocked;
		actions.updateTrackerBlocked({
			app_id: tracker.id,
			cat_id,
			blocked: isBlocked,
		});
		showToast({
			text: t('global_settings_saved_tracker')
		});
	}

	/**
	* Render a tracker in Global Blocking subview of Settings.
	* @return {ReactComponent}   ReactComponent instance
	*/
	render() {
		const { tracker, language } = this.props;
		const { showMoreInfo, description, showTrackerLearnMore } = this.state;
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
					showMoreInfo && (
						<div className="row align-middle">
							<div className="columns global-trk-desc">
								{ description }
								{
									showTrackerLearnMore && (
										<div className={(!showTrackerLearnMore ? 'hide' : '')}>
											<a target="_blank" rel="noopener noreferrer" title={tracker.name} href={`${globals.APPS_BASE_URL}/${language}/apps/${encodeURIComponent(tracker.name.replace(/\s+/g, '_').toLowerCase())}`}>
												{ t('tracker_description_learn_more') }
											</a>
										</div>
									)
								}
							</div>
						</div>
					)
				}
			</div>
		);
	}
}

GlobalTracker.defaultProps = {
	tracker: {},
};

export default GlobalTracker;
