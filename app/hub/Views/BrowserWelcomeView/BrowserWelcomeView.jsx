/**
 * Browser Welcome View
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
 * A Functional React component for rendering the Browser Welcome View
 * @return {JSX} JSX for rendering the Browser Welcome View of the Hub app
 * @memberof HubComponents
 */
const BrowserWelcomeView = () => (
	<div className="BrowserWelcomeView__container">
		<div className="BrowserWelcomeView__title">{t('hub_browser_welcome')}</div>
		<div className="BrowserWelcomeView__subtitle">{t('hub_browser_begin')}</div>
		<img className="BrowserWelcomeView__rocketShip" src="/app/images/hub/welcome/rocketShip.png" />
		<div className="BrowserWelcomeView__ctaButton">{t('hub_browser_lets_do_this')}</div>
	</div>
);

export default BrowserWelcomeView;
