/**
 * Tutorial Anti Suite View Container
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
import TutorialAntiSuiteView from './TutorialAntiSuiteView';

/**
 * @class Implement the Tutorial Anti Suite View for the Ghostery Hub
 * @extends Component
 * @memberof HubComponents
 */
class TutorialAntiSuiteViewContainer extends Component {
	constructor(props) {
		super(props);

		const title = t('hub_tutorial_page_title_anti_suite');
		window.document.title = title;

		const { index, sendMountActions } = props;
		props.actions.setTutorialNavigation({
			activeIndex: index,
			hrefPrev: `/tutorial/${index - 1}`,
			hrefNext: '/',
			hrefDone: false,
			textPrev: t('hub_tutorial_nav_previous'),
			textNext: t('hub_tutorial_nav_done'),
			textDone: false,
		});

		if (sendMountActions) {
			this.props.actions.setTutorialComplete();
		}
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Tutorial Anti Suite View of the Hub app
	 */
	render() {
		return <TutorialAntiSuiteView />;
	}
}

// PropTypes ensure we pass required props of the correct type
TutorialAntiSuiteViewContainer.propTypes = {
	index: PropTypes.number.isRequired,
	actions: PropTypes.shape({
		setTutorialNavigation: PropTypes.func.isRequired,
		setTutorialComplete: PropTypes.func.isRequired,
	}).isRequired,
	sendMountActions: PropTypes.bool.isRequired,
};

export default TutorialAntiSuiteViewContainer;
