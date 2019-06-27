/**
 * Themes Subscription Component
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
import { ToggleSlider } from '../BuildingBlocks';

/**
 * @class Implement Themes subview as a React component.
 * The view opens from the left-side menu of the main Subscription view.
 * It allows to switch between available Ghostery themes. Right now it handles just one theme. Hence - slider.
 * @memberOf SettingsComponents
 */
const SubscriptionThemes = props => (
	<div className="content-subscription s-tabs-panel">
		<div className="row">
			<div className="columns column-subscription">
				<h1>{ t('subscription_themes_title') }</h1>
				<div>
					<span className="flex-container align-middle themes-slider-container">
						<span className="themes-slider-label">
							{t('subscription_midnight_theme')}
						</span>
						<ToggleSlider
							className="themes-slider"
							isChecked={props.isChecked}
							onChange={props.toggleThemes}
						/>
						<div className="s-tooltip-down" data-g-tooltip={t('subscription_themes_tooltip')}>
							<img src="../../app/images/panel/icon-information-tooltip.svg" className="s-question" />
						</div>
					</span>
				</div>
			</div>
		</div>
	</div>
);
export default SubscriptionThemes;
