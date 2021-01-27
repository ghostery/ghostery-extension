/**
 * Dawn Hub root onboarding flow component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2021 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import { Route } from 'react-router-dom';

import StepProgressBar from '../OnboardingViews/StepProgressBar';
import StepNavigator from '../OnboardingViews/StepNavigator';
import {
	BLOCK_SETTINGS,
	CHOOSE_DEFAULT_SEARCH,
	CHOOSE_PLAN,
	SUCCESS
} from './OnboardingConstants';

/**
 * A Functional React component for rendering the Dawn Hub onboarding flow
 * @return {JSX} JSX for rendering the Dawn Hub onboarding flow
 * @memberof DawnHubViews
 */
const OnboardingView = (props) => {
	const { sendMountActions, steps } = props;

	const getScreenContainerClassNames = index => ClassNames('OnboardingView__screenContainer', {
		step2: index === BLOCK_SETTINGS,
		step3: index === CHOOSE_DEFAULT_SEARCH,
		step4: index === CHOOSE_PLAN
	});

	return (
		<div className="full-height flex-container flex-dir-column android-relative">
			<div className="flex-child-grow">
				{steps.map(step => (
					<Route
						key={`route-${step.index}`}
						path={step.path}
						render={() => (
							<div className={getScreenContainerClassNames(step.index)}>
								{(step.index !== SUCCESS) && <StepProgressBar currentStep={step.index} />}
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
		index: PropTypes.string.isRequired,
		path: PropTypes.string.isRequired,
		bodyComponents: PropTypes.arrayOf(PropTypes.elementType.isRequired).isRequired,
	})).isRequired,
	sendMountActions: PropTypes.bool.isRequired,
};

export default OnboardingView;
