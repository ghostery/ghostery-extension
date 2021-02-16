/**
 * Dawn Hub onboarding flow Welcome View Component
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

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { WELCOME } from '../../OnboardingView/OnboardingConstants';

/**
 * A Functional React component for rendering the Browser Welcome View
 * @return {JSX} JSX for rendering the Browser Welcome View of the Hub app
 * @memberof DawnHubViews
 */
const WelcomeView = (props) => {
	const { actions } = props;
	const { setSetupStep } = actions;

	const [getUserResolved, setGetUserResolved] = useState(false);

	const gateSetupStep = (e) => {
		if (getUserResolved) {
			setSetupStep({ setup_step: WELCOME, origin: WELCOME });
		} else {
			e.preventDefault();
		}
	};

	useEffect(() => {
		actions.getUser();
		const timer = setTimeout(() => setGetUserResolved(true), 500);

		return () => {
			clearTimeout(timer);
		};
	}, []);

	return (
		<div className="WelcomeView__container">
			<div className="WelcomeView__title">{t('ghostery_dawn_onboarding_welcome')}</div>
			<div className="WelcomeView__subtitle">{t('ghostery_dawn_onboarding_welcome_message')}</div>
			<img className="WelcomeView__rocketShip" src="/app/images/hub/welcome/rocketShip.png" />
			<NavLink className="WelcomeView__ctaButton" to={getUserResolved ? '/onboarding/1' : '#'} onClick={gateSetupStep}>
				<span>{t('ghostery_dawn_onboarding_lets_do_this')}</span>
			</NavLink>
		</div>
	);
};

export default WelcomeView;

// PropTypes ensure we pass required props of the correct type
WelcomeView.propTypes = {
	actions: PropTypes.shape({
		setSetupStep: PropTypes.func.isRequired
	}).isRequired,
};
