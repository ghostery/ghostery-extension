/**
 * Setup Human Web View Container
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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SetupHumanWebView from './SetupHumanWebView';

/**
 * @class Implement the Setup Human Web View for the Ghostery Hub
 * @extends Component
 * @memberof HubComponents
 */
class SetupHumanWebViewContainer extends Component {
	constructor(props) {
		super(props);

		const title = t('hub_setup_page_title_humanweb');
		window.document.title = title;

		const { index, setup, sendMountActions } = props;
		props.actions.setSetupNavigation({
			activeIndex: index,
			hrefPrev: `/setup/${index - 1}`,
			hrefNext: `/setup/${index + 1}`,
			hrefDone: '/',
			textPrev: t('previous'),
			textNext: t('next'),
			textDone: t('hub_setup_exit_flow'),
		});

		if (sendMountActions) {
			const { enable_human_web } = setup;
			props.actions.setSetupStep({ setup_step: 10 });
			props.actions.setHumanWeb({ enable_human_web });
		}
	}

	/**
	* Function to handle toggling Human Web Opt-In
	*/
	_handleToggle = () => {
		const { actions, setup } = this.props;
		const enable_human_web = !setup.enable_human_web;
		actions.setHumanWeb({ enable_human_web });
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Setup Human Web View of the Hub app
	 */
	render() {
		const { setup } = this.props;
		return (
			<SetupHumanWebView
				enableHumanWeb={setup.enable_human_web}
				changeHumanWeb={this._handleToggle}
			/>
		);
	}
}

// PropTypes ensure we pass required props of the correct type
SetupHumanWebViewContainer.propTypes = {
	index: PropTypes.number.isRequired,
	actions: PropTypes.shape({
		setSetupStep: PropTypes.func.isRequired,
		setSetupNavigation: PropTypes.func.isRequired,
		setHumanWeb: PropTypes.func.isRequired,
	}).isRequired,
	sendMountActions: PropTypes.bool.isRequired,
};

export default SetupHumanWebViewContainer;
