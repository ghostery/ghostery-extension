/**
 * Ghostery Browser Hub Onboarding View Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2020 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';

import StepProgressBar from '../OnboardingViews/StepProgressBar';
import StepNavigator from '../OnboardingViews/StepNavigator';

/**
 * A Functional React component for rendering the Onboarding View
 * @return {JSX} JSX for rendering the Onboarding View of the Ghostery Browser Hub app
 * @memberof GhosteryBrowserHubViews
 */
const OnboardingView = (props) => {
	const { sendMountActions, steps } = props;

	console.log('in OnboardingView');

	return (
		<div className="full-height flex-container flex-dir-column android-relative">
			<div className="flex-child-grow">
				{steps.map(step => (
					<Route
						key={`route-${step.index}`}
						path={step.path}
						render={() => (
							<div>
								<StepProgressBar currentStep={step.index} />
								<StepNavigator step={step.index} components={step.bodyComponents} sendMountActions={sendMountActions} />
							</div>
						)}
					/>
				))}
			</div>
		</div>
	);
};

// PropTypes ensure we pass required props of the correct type
OnboardingView.propTypes = {
	steps: PropTypes.arrayOf(PropTypes.shape({
		index: PropTypes.number.isRequired,
		path: PropTypes.string.isRequired,
		bodyComponents: PropTypes.arrayOf(PropTypes.elementType.isRequired).isRequired,
	})).isRequired,
	sendMountActions: PropTypes.bool.isRequired,
};

export default OnboardingView;
