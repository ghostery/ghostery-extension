/**
 * Step Progress Bar Component
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

import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';

// TODO: Change routes
const steps = [
	{
		label: t('sign_in'),
		route: 'LINK_TO_STEP_1'
	},
	{
		label: t('ghostery_browser_hub_onboarding_privacy'),
		route: 'LINK_TO_STEP_2'
	},
	{
		label: t('ghostery_browser_hub_onboarding_search'),
		route: 'LINK_TO_STEP_3'
	},
	{
		label: t('ghostery_browser_hub_onboarding_plan'),
		route: 'LINK_TO_STEP_4'
	}
];

/**
 * A React function component for rendering the Step Progress bar
 * @return {JSX} JSX for rendering the Step Progress bar of the ghostery-browser-intro-hub app
 * @memberof HubComponents
 */
const StepProgressBar = (props) => {
	const { currentStep } = props;
	const totalSteps = steps.length;

	const renderCompletedStep = step => (
		<div className="StepProgressBar__column">
			<NavLink to={step.route}>
				<div className="StepProgressBar__label">{step.label}</div>
				<div className="StepProgressBar__Step step-completed" />
			</NavLink>
		</div>
	);

	const renderCurrentStep = (step, value) => (
		<div className="StepProgressBar__column">
			<NavLink to={step.route}>
				<div className="StepProgressBar__label currentStep">{step.label}</div>
				<div className={`StepProgressBar__Step step-${value} current`} />
			</NavLink>
		</div>
	);

	const renderIncompleteStep = (step, value) => (
		<div className="StepProgressBar__column">
			<NavLink to={step.route}>
				<div className="StepProgressBar__label">{step.label}</div>
				<div className={`StepProgressBar__Step step-${value} incomplete`} />
			</NavLink>
		</div>
	);

	const renderProgressBar = () => (
		steps.map((value, index) => (
			<Fragment key={value}>
				{(index + 1 < currentStep) && (
					renderCompletedStep(steps[index])
				)}
				{(index + 1 === currentStep) && (
					<Fragment>
						{renderCurrentStep(steps[index], index + 1)}
					</Fragment>
				)}
				{(index + 1 > currentStep) && (
					<Fragment>
						{renderIncompleteStep(steps[index], index + 1)}
					</Fragment>
				)}
				{(index + 1 !== totalSteps) && (
					<Fragment>
						{(index + 1 < currentStep) && (
							<div className="StepProgressBar__line completed" />
						)}
						{(index + 1 >= currentStep) && (
							<div className="StepProgressBar__line incompleted" />
						)}
					</Fragment>
				)}
			</Fragment>
		))
	);

	return (
		<div className="StepProgressBarContainer">
			{renderProgressBar()}
		</div>
	);
};
// PropTypes ensure we pass required props of the correct type
StepProgressBar.propTypes = {
	currentStep: PropTypes.number.isRequired,
};

export default StepProgressBar;
