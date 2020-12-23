/**
 * Ghostery Browser Hub Welcome View Component
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
import { NavLink } from 'react-router-dom';

/**
 * A Functional React component for rendering the Browser Welcome View
 * @return {JSX} JSX for rendering the Browser Welcome View of the Hub app
 * @memberof GhosteryBrowserHubViews
 */
const WelcomeView = () => (
	<div className="WelcomeView__container">
		<div className="WelcomeView__title">{t('ghostery_browser_hub_onboarding_welcome')}</div>
		<div className="WelcomeView__subtitle">{t('ghostery_browser_hub_onboarding_lets_begin')}</div>
		<img className="WelcomeView__rocketShip" src="/app/images/hub/welcome/rocketShip.png" />
		<NavLink className="WelcomeView__ctaButton" to="/onboarding/1">
			<span>{ t('ghostery_browser_hub_onboarding_lets_do_this') }</span>
		</NavLink>
	</div>
);

export default WelcomeView;
