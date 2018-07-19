/**
 * Themes Subscription Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2018 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React, { Component } from 'react';
import globals from '../../../../src/classes/Globals';
import { ToggleSlider } from '../BuildingBlocks';
const IS_EDGE = (globals.BROWSER_INFO.name === 'edge');
const IS_CLIQZ = (globals.BROWSER_INFO.name === 'cliqz');

/**
 * @class Implement Themes subview as a React component.
 * The view opens from the left-side menu of the main Subscription view.
 * It allows to switch between available Ghostery themes.
 * @memberOf SettingsComponents
 */
const SubscriptionThemes = (props) => {
	const { subscriptionData } = props;
	return (
		<div className="s-tabs-panel">
			<div className="row">
				<div className="columns">
					<h3>{ t('subscription_themes_title') }</h3>
					<div>
						<span className="flex-container align-middle">
							<span className="Subscription-slider-label">
								{t('subscription_midnight_theme')}
							</span>
							<ToggleSlider
								className="display-inline-block"
								isChecked="true"
								onChange={props.toggleThemes}
							/>
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SubscriptionThemes;
