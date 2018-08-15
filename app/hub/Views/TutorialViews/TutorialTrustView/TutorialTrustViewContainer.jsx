/**
 * Tutorial Trust View Container
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

import TutorialTrustView from './TutorialTrustView';

/**
 * @class Implement the Tutorial Trust View for the Ghostery Hub
 * @extends Component
 * @memberof HubComponents
 */
class TutorialTrustViewContainer extends Component {
	constructor(props) {
		super(props);

		// TODO call setTutorialNavigation action
		const { index } = this.props;
		this.props.actions.setTutorialNavigation({
			activeIndex: index,
			hrefPrev: `/tutorial/${index - 1}`,
			hrefNext: `/tutorial/${index + 1}`,
			hrefDone: '/',
			textPrev: t('hub_setup_nav_previous'),
			textNext: t('hub_setup_nav_next'),
			textDone: t('hub_setup_exit_flow'),
		});
	}

	render() {
		return <TutorialTrustView />;
	}
}

// PropTypes ensure we pass required props of the correct type
TutorialTrustViewContainer.propTypes = {
	index: PropTypes.number.isRequired,
	actions: PropTypes.shape({
		setTutorialNavigation: PropTypes.func.isRequired,
	}).isRequired,
};

export default TutorialTrustViewContainer;
