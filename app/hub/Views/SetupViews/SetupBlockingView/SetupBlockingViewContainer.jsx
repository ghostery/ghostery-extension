/**
 * Setup Blocking View Container
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
import SetupBlockingView from './SetupBlockingView';
import {
	BLOCKING_POLICY_RECOMMENDED,
	BLOCKING_POLICY_NOTHING,
	BLOCKING_POLICY_EVERYTHING,
	BLOCKING_POLICY_CUSTOM
} from '../../SetupView/SetupViewConstants';

/**
 * @class Implement the Setup Blocking View for the Ghostery Hub
 * @extends Component
 * @memberof HubComponents
 */
class SetupBlockingViewContainer extends Component {
	/**
	 * Lifecycle Event
	 */
	componentWillMount() {
		const title = t('hub_setup_page_title_blocking');
		window.document.title = title;

		const { index, setup, sendMountActions } = this.props;
		this.props.actions.setSetupNavigation({
			activeIndex: index,
			hrefPrev: false,
			hrefNext: `/setup/${index + 1}`,
			hrefDone: '/',
			textPrev: false,
			textNext: t('hub_setup_nav_next'),
			textDone: t('hub_setup_exit_flow'),
		});

		if (sendMountActions) {
			const { blockingPolicy } = setup;
			this.props.actions.setBlockingPolicy({ blockingPolicy });
		}
	}

	/**
	* Function to handle a change made on the Setup Blocking View
	* @param  {Object} event the click event
	*/
	_handleChange = (event) => {
		const blockingPolicy = event.target.value;
		this.props.actions.setBlockingPolicy({ blockingPolicy });
	}

	/**
	* Function to handle switching to the Custom Blocking route
	*/
	_handleCustomClick = () => {
		this.props.history.push('/setup/1/custom');
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Setup Blocking View of the Hub app
	 */
	render() {
		const { blockingPolicy } = this.props.setup;
		const choices = [
			{
				name: BLOCKING_POLICY_RECOMMENDED,
				image: '/app/images/hub/setup/block-recommended.svg',
				text: t('hub_setup_blocking_text_recommended'),
				description: t('hub_setup_blocking_description_recommended'),
			},
			{
				name: BLOCKING_POLICY_NOTHING,
				image: '/app/images/hub/setup/block-none.svg',
				text: t('hub_setup_blocking_text_nothing'),
				description: t('hub_setup_blocking_description_nothing'),
			},
			{
				name: BLOCKING_POLICY_EVERYTHING,
				image: '/app/images/hub/setup/block-all.svg',
				text: t('hub_setup_blocking_text_everything'),
				description: t('hub_setup_blocking_description_everything'),
			},
			{
				name: BLOCKING_POLICY_CUSTOM,
				image: '/app/images/hub/setup/block-custom.svg',
				text: t('hub_setup_blocking_text_custom'),
				description: t('hub_setup_blocking_description_custom'),
			},
		];

		return <SetupBlockingView blockingPolicy={blockingPolicy} choices={choices} handleSelection={this._handleChange} handleCustomClick={this._handleCustomClick} />;
	}
}

// PropTypes ensure we pass required props of the correct type
SetupBlockingViewContainer.propTypes = {
	index: PropTypes.number.isRequired,
	actions: PropTypes.shape({
		setSetupNavigation: PropTypes.func.isRequired,
		setBlockingPolicy: PropTypes.func.isRequired,
	}).isRequired,
	sendMountActions: PropTypes.bool.isRequired,
};

export default SetupBlockingViewContainer;
