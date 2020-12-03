/**
 * Browser Success View
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2019 Ghostery, Inc. All rights reserved.
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
const BrowserSuccessView = () => (
	<div className="BrowserSuccessView__container">
		<div className="BrowserSuccessView__title">{t('hub_browser_yay_youre_all_set')}</div>
		<div className="BrowserSuccessView__subtitle">{`${t('hub_browser_start_browsing_the_web_with')} Ghostery`}</div>
		<img className="BrowserSuccessView__ghosterySuite" src="/app/images/hub/success/ghostery-suite.png" />
		<button className="BrowserSuccessView__ctaButton" type="button">{t('hub_browser_lets_search')}</button>
	</div>
);

export default BrowserSuccessView;
