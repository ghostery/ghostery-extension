/**
 * Tutorial Anti Suite View Container
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
			hrefNext: '/home',
			hrefDone: '/home',
			textPrev: t('previous'),
			textNext: t('done'),
			textDone: t('hub_tutorial_exit_flow'),
		});

		if (sendMountActions) {
			const { actions } = this.props;
			actions.setTutorialComplete({
				tutorial_complete: true,
			});
		}
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Tutorial Anti Suite View of the Hub app
	 */
	render() {
		const { isAndroid } = this.props;
		return <TutorialAntiSuiteView isAndroid={isAndroid} />;
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
