/**
 * Tutorial Layout View Container
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
import TutorialLayoutView from './TutorialLayoutView';

/**
 * @class Implement the Tutorial Layout View for the Ghostery Hub
 * @extends Component
 * @memberof HubComponents
 */
class TutorialLayoutViewContainer extends Component {
	constructor(props) {
		super(props);

		const title = t('hub_tutorial_page_title_layout');
		window.document.title = title;

		const { index } = props;
		props.actions.setTutorialNavigation({
			activeIndex: index,
			hrefPrev: `/tutorial/${index - 1}`,
			hrefNext: `/tutorial/${index + 1}`,
			hrefDone: '/',
			textPrev: t('hub_tutorial_nav_previous'),
			textNext: t('hub_tutorial_nav_next'),
			textDone: t('hub_tutorial_exit_flow'),
		});
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Tutorial Layout View of the Hub app
	 */
	render() {
		return <TutorialLayoutView />;
	}
}

// PropTypes ensure we pass required props of the correct type
TutorialLayoutViewContainer.propTypes = {
	index: PropTypes.number.isRequired,
	actions: PropTypes.shape({
		setTutorialNavigation: PropTypes.func.isRequired,
	}).isRequired,
};

export default TutorialLayoutViewContainer;
