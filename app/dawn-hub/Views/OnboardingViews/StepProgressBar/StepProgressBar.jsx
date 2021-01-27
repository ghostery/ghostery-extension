/**
 * Step Progress Bar Component
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

import React, { Fragment } from 'react';
import ClassNames from 'classnames';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import {
	WELCOME,
	ONBOARDING,
	LOGIN,
	BLOCK_SETTINGS,
	CHOOSE_DEFAULT_SEARCH,
	CHOOSE_PLAN
} from '../../OnboardingView/OnboardingConstants';

const steps = [
	{
		label: t('sign_in'),
		route: `/${ONBOARDING}/${LOGIN}`,
		id: LOGIN
	},
	{
		label: t('ghostery_dawn_onboarding_privacy'),
		route: `/${ONBOARDING}/${BLOCK_SETTINGS}`,
		id: BLOCK_SETTINGS
	},
	{
		label: t('ghostery_dawn_onboarding_search'),
		route: `/${ONBOARDING}/${CHOOSE_DEFAULT_SEARCH}`,
		id: CHOOSE_DEFAULT_SEARCH
	},
	{
		label: t('ghostery_dawn_onboarding_plan'),
		route: `/${ONBOARDING}/${CHOOSE_PLAN}`,
		id: CHOOSE_PLAN
	}
];

/**
 * A React functional component for rendering the Step Progress bar
 * @return {JSX} JSX for rendering the Step Progress bar of the Dawn Hub app
 * @memberof DawnHubViews
 */
const StepProgressBar = (props) => {
	const { currentStep } = props;
	const currentStepNumber = parseInt(currentStep, 10);
	const totalSteps = steps.length;

	const progressBarContainerClasses = ClassNames('StepProgressBarContainer', {
		step4: currentStepNumber === 4
	});

	const logoutIfStepOne = (stepId) => {
		const { actions } = props;
		const { logout } = actions;
		if (stepId === LOGIN) logout();
	};

	const renderStep = (step, isCurrent, stepClass) => {
		const labelClasses = ClassNames('StepProgressBar__label', {
			current: isCurrent,
		});
		const stepClasses = ClassNames('StepProgressBar__Step', stepClass, {
			[`step-${step.id}`]: stepClass !== 'step-completed',
		});

		if (stepClass === 'incomplete') {
			return (
				<div className="StepProgressBar__column">
					<div className={labelClasses}>{step.label}</div>
					<div className={stepClasses} />
				</div>
			);
		}

		return (
			<div className="StepProgressBar__column">
				<NavLink to={step.route} onClick={() => logoutIfStepOne(step.id)}>
					<div className={labelClasses}>{step.label}</div>
					<div className={stepClasses} />
				</NavLink>
			</div>
		);
	};

	const renderCompletedStep = step => renderStep(step, false, 'step-completed');

	const renderCurrentStep = step => renderStep(step, true, 'current');

	const renderIncompleteStep = step => renderStep(step, false, 'incomplete');

	const renderProgressBar = () => (
		steps.map((value, index) => {
			const step = index + 1;

			return (
				<Fragment key={`value-${step}`}>
					{(step < currentStepNumber) && renderCompletedStep(steps[index])}
					{(step === currentStepNumber) && renderCurrentStep(steps[index])}
					{(step > currentStepNumber) && renderIncompleteStep(steps[index])}
					{(step !== totalSteps) && (
						<Fragment>
							{(step < currentStepNumber) && (
								<div className="StepProgressBar__line completed" />
							)}
							{(step >= currentStepNumber) && (
								<div className="StepProgressBar__line incompleted" />
							)}
						</Fragment>
					)}
				</Fragment>
			);
		})
	);

	return (
		<div className={progressBarContainerClasses}>
			{(currentStep !== WELCOME) && renderProgressBar()}
		</div>
	);
};
// PropTypes ensure we pass required props of the correct type
StepProgressBar.propTypes = {
	currentStep: PropTypes.string.isRequired,
};

export default StepProgressBar;
