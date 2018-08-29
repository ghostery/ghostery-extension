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
	/**
	 * Lifecycle Event
	 */
	componentWillMount() {
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

					<div className="RewardsView__headerText columns align-middle">

						<span className="RewardsView__headerTitle row">
							{t('hub_rewards_header_title')}
						</span>

						<span className="RewardsView__headerDescription row">
							{t('hub_rewards_header_description')}
						</span>

						<div className="row RewardsView__buttonContainer">
							<a className="RewardsView__button button success" href="https://www.ghostery.com/faqs/what-is-ghostery-rewards/">
								{t('hub_rewards_header_learn_more')}
							</a>
						</div>

					</div>

				</div>

				<div className="RewardsView--paddingTop row align-center">

					<div className="RewardsView__promoFeature columns">

						<div className="row align-center">
							<img src="/app/images/hub/rewards/icon-rewards-lightbulb.svg" />
						</div>

						<span className="RewardsView__promoTitle row align-center">
							{t('hub_rewards_experience_title')}
						</span>

						<span className="RewardsView__promoDescription row align-center">
							{t('hub_rewards_experience_description')}
						</span>

					</div>

					<div className="RewardsView__promoFeature columns">

						<div className="row align-center">
							<img src="/app/images/hub/rewards/icon-rewards-privacy.svg" alt="smart" />
						</div>

						<span className="RewardsView__promoTitle row align-center">
							{t('hub_rewards_privacy_title')}
						</span>

						<span className="RewardsView__promoDescription row align-center">
							{t('hub_rewards_privacy_description')}
						</span>

					</div>

					<div className="RewardsView__promoFeature columns">

						<div className="row align-center">
							<img src="/app/images/hub/rewards/icon-rewards-star.svg" alt="unique" />
						</div>

						<span className="RewardsView__promoTitle row align-center">
							{t('hub_rewards_relevant_title')}
						</span>

						<span className="RewardsView__promoDescription row align-center">
							{t('hub_rewards_relevant_description')}
						</span>

					</div>

				</div>

				<div className="RewardsView--paddingTop row align-center">
					<span className="RewardsView__closerText">
						{t('hub_rewards_closer')}
					</span>
				</div>

			</div>
		);
	}
}

export default RewardsView;
