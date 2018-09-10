/**
 * Rewards View Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2018 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React, { Component } from 'react';

/**
 * @class Implement the Rewards View for the Ghostery Hub
 * @extends Component
 * @memberof HubComponents
 */
class RewardsView extends Component {
	constructor(props) {
		super(props);

		const title = t('hub_rewards_page_title');
		window.document.title = title;
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Rewards View of the Hub app
	 */
	render() {
		return (
			<div className="RewardsView RewardsView--paddingTop full-height">
				<div className="RewardsView__header row align-center">
					<div className="RewardsView__screenshot columns">
						<img src="/app/images/hub/rewards/ghostery-rewards-laptop.png" alt="Laptop" />
					</div>
					<div className="RewardsView__headerText columns">
						<div className="RewardsView__headerTitle">
							{t('hub_rewards_header_title')}
						</div>
						<div className="RewardsView__headerDescription">
							{t('hub_rewards_header_description')}
						</div>
						<div className="RewardsView__buttonContainer">
							<a className="RewardsView__button button success" href="https://www.ghostery.com/faqs/what-is-ghostery-rewards/" target="_blank" rel="noopener noreferrer">
								{t('hub_rewards_header_learn_more')}
							</a>
						</div>
					</div>
				</div>
				<div className="RewardsView--paddingTop row align-center">
					<div className="RewardsView__promoFeature columns">
						<div className="RewardsView__promoIcon RewardsView__lightBulbIcon" />
						<div className="RewardsView__promoTitle">
							{t('hub_rewards_experience_title')}
						</div>
						<div className="RewardsView__promoDescription">
							{t('hub_rewards_experience_description')}
						</div>
					</div>
					<div className="RewardsView__promoFeature columns">
						<div className="RewardsView__promoIcon RewardsView__eyeIcon" />
						<div className="RewardsView__promoTitle">
							{t('hub_rewards_privacy_title')}
						</div>
						<div className="RewardsView__promoDescription">
							{t('hub_rewards_privacy_description')}
						</div>
					</div>
					<div className="RewardsView__promoFeature columns">
						<div className="RewardsView__promoIcon RewardsView__starIcon" />
						<div className="RewardsView__promoTitle">
							{t('hub_rewards_relevant_title')}
						</div>
						<div className="RewardsView__promoDescription">
							{t('hub_rewards_relevant_description')}
						</div>
					</div>
				</div>
				<div className="RewardsView__backgroundStars">
					<div className="RewardsView--paddingTop row align-center">
						<div className="RewardsView__closerText">
							{t('hub_rewards_closer')}
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default RewardsView;
