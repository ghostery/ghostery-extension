/**
 * Upgrade Plan View Component
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

import React, { Fragment, useRef, useEffect } from 'react';
import ClassNames from 'classnames';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import QueryString from 'query-string';
import globals from '../../../../src/classes/Globals';

const stepLabels = ['Sign In', 'Privacy', 'Search', 'Plan'];

/**
 * A React function component for rendering the Step Progress bar
 * @return {JSX} JSX for rendering the Progress Progress bar of the ghostery-browser-intro-hub app
 * @memberof HubComponents
 */
const StepProgressBar = (props) => {
	const currentStep = 2;
	const totalSteps = stepLabels.length;

	const renderCompletedStep = value => (
		<div>{`Completed Step: ${value}`}</div>
	);

	const renderCurrentStep = value => (
		<div>{`Current Step: ${value}`}</div>
	);

	const renderIncompleteStep = value => (
		<div>{`Incomplete Step: ${value}`}</div>
	);

	const renderProgressBar = () => (
		stepLabels.map((value, index) => (
			<div key={value}>
				{(index + 1 < currentStep) && (
					renderCompletedStep(index)
				)}
				{(index + 1 === currentStep) && (
					renderCurrentStep(index)
				)}
				{(index + 1 > currentStep) && (
					renderIncompleteStep(index)
				)}
			</div>
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
	// currentStep: PropTypes.number.isRequired
	// protection_level: PropTypes.string.isRequired,
	// show_yearly_prices: PropTypes.bool.isRequired,
	// user: PropTypes.shape({
	// 	email: PropTypes.string,
	// 	plusAccess: PropTypes.bool,
	// 	premiumAccess: PropTypes.bool,
	// }),
	// actions: PropTypes.shape({
	// 	toggleMonthlyYearlyPrices: PropTypes.func.isRequired,
	// 	setBasicProtection: PropTypes.func.isRequired,
	// 	setPlusProtection: PropTypes.func.isRequired,
	// 	setPremiumProtection: PropTypes.func.isRequired,
	// }).isRequired,
};

// Default props used on the Home View
StepProgressBar.defaultProps = {
	// user: {
	// 	email: '',
	// 	plusAccess: false,
	// 	premiumAccess: false,
	// },
};

export default StepProgressBar;
