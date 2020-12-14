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
			wtmID: null,
		};

		// click bindings
		this.toggleDescription = this.toggleDescription.bind(this);
		this.clickTrackerStatus = this.clickTrackerStatus.bind(this);
	}

	/**
	 * Implement handler for clicking on the tracker title
	 * which shows/hides tracker description. On show it retrieves
	 * description from whotracks.me and sets it in state.
	 */
	toggleDescription() {
		const { tracker } = this.props;
		const { description } = this.state;
		this.setState(prevState => ({ showMoreInfo: !prevState.showMoreInfo }));

		if (description) {
			return;
		}

		this.setState({ description: t('tracker_description_getting') });

		sendMessageInPromise('getTrackerInfo', {
			url: `${globals.WTM_BASE_URL}/data/trackers/ghostery/${tracker.id}.json`,
		}).then((data) => {
			if (data && data.description) {
				const truncate = (data.description.length > 200) ? `${data.description.substr(0, 199)}...` : data.description;
				this.setState({ description: truncate });
				this.setState({ showTrackerLearnMore: true });
				this.setState({ wtmID: data.id });
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
		const { tracker } = this.props;
		const {
			showMoreInfo,
			description,
			showTrackerLearnMore,
			wtmID
		} = this.state;
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
											<a target="_blank" rel="noopener noreferrer" title={tracker.name} href={`${globals.WTM_BASE_URL}/trackers/${encodeURIComponent(wtmID).toLowerCase()}.html`}>
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
