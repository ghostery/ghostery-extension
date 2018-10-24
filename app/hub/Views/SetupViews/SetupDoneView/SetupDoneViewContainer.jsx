/**
 * Setup Done View Container
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
import SetupDoneView from './SetupDoneView';

/**
 * @class Implement the Setup Done View for the Ghostery Hub
 * @extends Component
 * @memberof HubComponents
 */
class SetupDoneViewContainer extends Component {
	constructor(props) {
		super(props);

		const title = t('hub_setup_page_title_done');
		window.document.title = title;

		const { index, sendMountActions } = props;
		props.actions.setSetupNavigation({
			activeIndex: index,
			hrefPrev: `/setup/${index - 1}`,
			hrefNext: '/',
			hrefDone: '/',
			textPrev: t('hub_setup_nav_previous'),
			textNext: t('hub_setup_nav_done'),
			textDone: t('hub_setup_exit_flow'),
		});

		if (sendMountActions) {
			props.actions.setSetupComplete({
				setup_complete: true,
			});
		}
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Setup Done View of the Hub app
	 */
	render() {
		const features = [
			{
				id: 'tutorial',
				title: t('hub_setup_feature_tutorial_title'),
				description: t('hub_setup_feature_tutorial_description'),
				buttonText: t('hub_setup_feature_tutorial_button'),
				buttonHref: '/tutorial/1',
			},
			{
				id: 'supporter',
				title: t('hub_setup_feature_supporter_title'),
				description: t('hub_setup_feature_supporter_description'),
				buttonText: t('hub_setup_feature_supporter_button'),
				buttonHref: '/plus',
			},
			{
				id: 'products',
				title: t('hub_setup_feature_products_title'),
				description: t('hub_setup_feature_products_description'),
				buttonText: t('hub_setup_feature_products_button'),
				buttonHref: '/products',
			},
		];
		return <SetupDoneView features={features} />;
	}
}

// PropTypes ensure we pass required props of the correct type
SetupDoneViewContainer.propTypes = {
	index: PropTypes.number.isRequired,
	actions: PropTypes.shape({
		setSetupNavigation: PropTypes.func.isRequired,
	}).isRequired,
};

export default SetupDoneViewContainer;
