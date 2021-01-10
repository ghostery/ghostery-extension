/**
 * Ghostery Browser Hub Success View Component
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
import { NavLink } from 'react-router-dom';

/**
 * A Functional React component for rendering the Browser Success View
 * @return {JSX} JSX for rendering the Browser Success View of the Hub app
 * @memberof HubComponents
 */
const SuccessView = (props) => {
	const { actions } = props;
	const { sendPing } = actions;
	return (
		<Fragment>
			<div className="SuccessView__relativeContainer">
				<div className="SuccessView__backContainer">
					<span className="SuccessView__caret left" />
					<NavLink to="/onboarding/4">
						<span className="SuccessView__back">{t('ghostery_browser_hub_onboarding_back')}</span>
					</NavLink>
				</div>
			</div>
			<div className="SuccessView__container">
				<div className="SuccessView__title">{t('ghostery_browser_hub_onboarding_youve_successfully_set_up_your_browser')}</div>

				<div className="SuccessView__subtitle">{`${t('ghostery_browser_hub_onboarding_surf_with_ease')} Ghostery`}</div>
				<img className="SuccessView__ghosterySuite" src="/app/images/hub/success/ghostery-suite.png" />
				<button className="SuccessView__ctaButton" onClick={() => sendPing({ type: 'gb_onboarding_success' })} type="button">{t('ghostery_browser_hub_onboarding_start_browsing')}</button>
			</div>
		</Fragment>
	);
};

export default SuccessView;
