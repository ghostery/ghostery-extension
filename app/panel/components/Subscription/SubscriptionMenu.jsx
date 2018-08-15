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
import { Link } from 'react-router-dom';
/**
 * @class Implement left pane of the main Subscription view as a
 * menu which allows to navigate to Subscription subviews.
 * @memberOf SubscriptionComponents
 */
class SubscriptionMenu extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			menu: {
				showSubscriptionInfo: true,
				showSubscriptionThemes: false,
				showPrioritySupport: false,
				showTrackerStats: false,
			},
		};
	}

	/**
	 * Save selected menu item in state.
	 * @param {Object} event  	mouseclick event on one of the menu items
	 */
	setActiveTab = (event) => {
		const newMenuState = Object.assign({}, this.state.menu);
		Object.keys(newMenuState).forEach((key) => {
			if (key === event.currentTarget.id) {
				newMenuState[key] = true;
			} else {
				newMenuState[key] = false;
			}
		});
		this.setState({ menu: newMenuState });
	}
	/**
	 * Render menu pane.
	 * @return {ReactComponent}   ReactComponent instance
	 */
	render() {
		return (
			<ul className="content-settings-menu menu vertical no-bullet">
				<li className={`${this.state.menu.showSubscriptionInfo ? 's-active ' : ''}s-tabs-title`} id="showSubscriptionInfo" onClick={this.setActiveTab}>
					<Link to="/subscription/info">
						<span>{ t('subscription_info') }</span>
					</Link>
				</li>
				<li className={`${this.state.menu.showSubscriptionThemes ? 's-active ' : ''}s-tabs-title`} id="showSubscriptionThemes" onClick={this.setActiveTab}>
					<Link to="/subscription/themes">
						<span>{ t('subscription_themes') }</span>
					</Link>
				</li>

				<li className={`${this.state.menu.showPrioritySupport ? 's-active ' : ''}s-tabs-title`} id="showPrioritySupport" onClick={this.setActiveTab}>
					<Link to="/subscription/prioritysupport">
						<span>{ t('subscription_priority_support') }</span>
					</Link>
				</li>
				<li className={`${this.state.menu.showTrackerStats ? 's-active ' : ''}s-tabs-title`} id="showTrackerStats" onClick={this.setActiveTab}>
					<Link to="/subscription/trackerstats">
						<span>{ t('subscription_tracker_stats') }</span>
					</Link>
				</li>
			</ul>
		);
	}
}

export default SubscriptionMenu;
