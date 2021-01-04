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

import React from 'react';

/**
 * A Functional React component for rendering the Browser Success View
 * @return {JSX} JSX for rendering the Browser Success View of the Hub app
 * @memberof HubComponents
 */
const SuccessView = (props) => {
	const { actions } = props;
	const { sendPing } = actions;
	return (
		<div className="SuccessView__container">
			<div className="SuccessView__title">{t('ghostery_browser_hub_onboarding_yay_youre_all_set')}</div>
			<div className="SuccessView__subtitle">{`${t('ghostery_browser_hub_onboarding_start_browsing_the_web_with')} Ghostery`}</div>
			<img className="SuccessView__ghosterySuite" src="/app/images/hub/success/ghostery-suite.png" />
			<button className="SuccessView__ctaButton" onClick={() => sendPing({ type: 'gb_onboarding_success' })} type="button">{t('ghostery_browser_hub_onboarding_lets_search')}</button>
		</div>
	);
};

export default SuccessView;
