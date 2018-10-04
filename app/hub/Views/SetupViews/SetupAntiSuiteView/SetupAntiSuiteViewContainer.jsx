/**
 * Setup Anti-Suite View Container
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
import PropTypes from 'prop-types';
import SetupAntiSuiteView from './SetupAntiSuiteView';

/**
 * @class Implement the Setup Anti-Suite View for the Ghostery Hub
 * @extends Component
 * @memberof HubComponents
 */
class SetupAntiSuiteViewContainer extends Component {
	constructor(props) {
		super(props);

		const title = t('hub_setup_page_title_antisuite');
		window.document.title = title;

		const { index, setup, sendMountActions } = props;
		props.actions.setSetupNavigation({
			activeIndex: index,
			hrefPrev: `/setup/${index - 1}`,
			hrefNext: `/setup/${index + 1}`,
			hrefDone: '/',
			textPrev: t('hub_setup_nav_previous'),
			textNext: t('hub_setup_nav_next'),
			textDone: t('hub_setup_exit_flow'),
		});

		if (sendMountActions) {
			const {
				enable_anti_tracking,
				enable_ad_block,
				enable_smart_block,
				enable_ghostery_rewards,
			} = setup;
			props.actions.setAntiTracking({ enable_anti_tracking });
			props.actions.setAdBlock({ enable_ad_block });
			props.actions.setSmartBlocking({ enable_smart_block });
			props.actions.setGhosteryRewards({ enable_ghostery_rewards });
		}
	}

	/**
	* Function to handle toggling a feature on the Setup Anti-Suite View
	* @param  {Object} featureName the name of the feature being toggled
	*/
	_handleToggle = (featureName) => {
		switch (featureName) {
			case 'anti-tracking': {
				const enable_anti_tracking = !this.props.setup.enable_anti_tracking;
				this.props.actions.setAntiTracking({ enable_anti_tracking });
				break;
			}
			case 'ad-block': {
				const enable_ad_block = !this.props.setup.enable_ad_block;
				this.props.actions.setAdBlock({ enable_ad_block });
				break;
			}
			case 'smart-blocking': {
				const enable_smart_block = !this.props.setup.enable_smart_block;
				this.props.actions.setSmartBlocking({ enable_smart_block });
				break;
			}
			case 'ghostery-rewards': {
				const enable_ghostery_rewards = !this.props.setup.enable_ghostery_rewards;
				this.props.actions.setGhosteryRewards({ enable_ghostery_rewards });
				break;
			}
			default: break;
		}
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Setup Anti-Suite View of the Hub app
	 */
	render() {
		const {
			enable_anti_tracking,
			enable_ad_block,
			enable_smart_block,
			enable_ghostery_rewards,
		} = this.props.setup;
		const features = [
			{
				id: 'anti-tracking',
				name: t('hub_setup_antisuite_name_antitracking'),
				enabled: enable_anti_tracking,
				toggle: () => {
					this._handleToggle('anti-tracking');
				},
				description: t('hub_setup_antisuite_description_antitracking'),
			},
			{
				id: 'ad-block',
				name: t('hub_setup_adblock_name_adblocking'),
				enabled: enable_ad_block,
				toggle: () => {
					this._handleToggle('ad-block');
				},
				description: t('hub_setup_adblock_description_adblocking'),
			},
			{
				id: 'smart-blocking',
				name: t('hub_setup_smartblocking_name_smartblocking'),
				enabled: enable_smart_block,
				toggle: () => {
					this._handleToggle('smart-blocking');
				},
				description: t('hub_setup_smartblocking_description_smartblocking'),
			},
			{
				id: 'ghostery-rewards',
				name: t('hub_setup_ghosteryrewards_name_rewards'),
				enabled: enable_ghostery_rewards,
				toggle: () => {
					this._handleToggle('ghostery-rewards');
				},
				description: t('hub_setup_ghosteryrewards_description_rewards'),
			},
		];

		return <SetupAntiSuiteView features={features} />;
	}
}

// PropTypes ensure we pass required props of the correct type
SetupAntiSuiteViewContainer.propTypes = {
	index: PropTypes.number.isRequired,
	actions: PropTypes.shape({
		setSetupNavigation: PropTypes.func.isRequired,
		setAntiTracking: PropTypes.func.isRequired,
		setAdBlock: PropTypes.func.isRequired,
		setSmartBlocking: PropTypes.func.isRequired,
		setGhosteryRewards: PropTypes.func.isRequired,
	}).isRequired,
	sendMountActions: PropTypes.bool.isRequired,
};

export default SetupAntiSuiteViewContainer;
