/**
 * Tutorial Navigation Container for Stepped Navigation Component
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

import React from 'react';
import PropTypes from 'prop-types';
import { SteppedNavigation } from '../../../../shared-components';

/**
 * A Functional React component for the Tutorial version of Stepped Navigation
 * @return {JSX} JSX for rendering the Tutorial version of Stepped Navigation
 * @memberof HubComponents
 */
const TutorialNavigationContainer = (props) => {
	const { totalSteps, tutorial } = props;
	const childProps = {
		totalSteps,
		...tutorial.navigation,
	};
	return <SteppedNavigation {...childProps} />;
};

// PropTypes ensure we pass required props of the correct type
TutorialNavigationContainer.propTypes = {
	totalSteps: PropTypes.number.isRequired,
	tutorial: PropTypes.shape({
		navigation: PropTypes.shape({
			activeIndex: PropTypes.number.isRequired,
			hrefPrev: PropTypes.oneOfType([
				PropTypes.bool,
				PropTypes.string,
			]).isRequired,
			hrefNext: PropTypes.oneOfType([
				PropTypes.bool,
				PropTypes.string,
			]).isRequired,
			hrefDone: PropTypes.oneOfType([
				PropTypes.bool,
				PropTypes.string,
			]).isRequired,
			textPrev: PropTypes.oneOfType([
				PropTypes.bool,
				PropTypes.string,
			]).isRequired,
			textNext: PropTypes.oneOfType([
				PropTypes.bool,
				PropTypes.string,
			]).isRequired,
			textDone: PropTypes.oneOfType([
				PropTypes.bool,
				PropTypes.string,
			]).isRequired,
		}).isRequired,
	}).isRequired
};

export default TutorialNavigationContainer;
