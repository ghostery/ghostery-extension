/**
 * Subscription Menu Component
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

import React from 'react';
import { NavLink } from 'react-router-dom';
/**
 * @const Implement left pane of the main Subscription view as a
 * menu which allows to navigate to Subscription subviews.
 * @memberOf SubscriptionComponents
 */
const SubscriptionMenu = () => (
	<ul className="content-settings-menu menu vertical no-bullet">
		<li className="s-tabs-title">
			<NavLink to="/subscription/info">
				<span>{ t('subscription_info') }</span>
			</NavLink>
		</li>
		<li className="s-tabs-title">
			<NavLink to="/subscription/themes">
				<span>{ t('subscription_themes') }</span>
			</NavLink>
		</li>

		<li className="s-tabs-title">
			<NavLink to="/subscription/prioritysupport">
				<span>{ t('subscription_priority_support') }</span>
			</NavLink>
		</li>

		<li className="s-tabs-title">
			<NavLink to="/subscription/historystats">
				<span>{ t('subscription_history_stats') }</span>
			</NavLink>
		</li>
	</ul>
);

export default SubscriptionMenu;
