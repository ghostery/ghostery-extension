/**
 * Settings Menu Component
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
 * @class Implement left pane of the main Settings view as a
 * menu which allows to navigate to Setting subviews.
 * The view allows to set parameters for Ghostery purplebox.
 * @memberOf SettingsComponents
 */
class SettingsMenu extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			menu: {
				showGlobalBlocking: true,
				showTrustAndRestrict: false,
				showGeneralSettings: false,
				showNotifications: false,
				showPurpleBox: false,
				showOptIn: false,
				showAccount: false,
			},
		};

		// event bindings
		this.setActiveTab = this.setActiveTab.bind(this);
	}
	/**
	 * Save selected menu item in state.
	 * @param {Object} event  	mouseclick event on one of the menu items
	 */
	setActiveTab(event) {
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
			<ul className={`${this.props.is_expanded ? 's-hide ' : ''} content-settings-menu menu vertical no-bullet`}>
				<li className={`${this.state.menu.showGlobalBlocking ? 's-active ' : ''}s-tabs-title`} id="showGlobalBlocking" onClick={this.setActiveTab}>
					<Link to="/settings/globalblocking">
						<span>{ t('settings_global_blocking') }</span>
					</Link>
				</li>
				<li className={`${this.state.menu.showTrustAndRestrict ? 's-active ' : ''}s-tabs-title`} id="showTrustAndRestrict" onClick={this.setActiveTab}>
					<Link to="/settings/trustandrestrict">
						<span>{ t('settings_trust_and_restrict') }</span>
					</Link>
				</li>

				<li className={`${this.state.menu.showGeneralSettings ? 's-active ' : ''}s-tabs-title`} id="showGeneralSettings" onClick={this.setActiveTab}>
					<Link to="/settings/generalsettings">
						<span>{ t('settings_general_settings') }</span>
					</Link>
				</li>
				<li className={`${this.state.menu.showNotifications ? 's-active ' : ''}s-tabs-title`} id="showNotifications" onClick={this.setActiveTab}>
					<Link to="/settings/notifications">
						<span>{ t('settings_notifications') }</span>
					</Link>
				</li>
				<li className={`${this.state.menu.showOptIn ? 's-active ' : ''}s-tabs-title`} id="showOptIn" onClick={this.setActiveTab}>
					<Link to="/settings/optin">
						<span>{ t('settings_opt_in') }</span>
					</Link>
				</li>
				<li className={`${this.state.menu.showPurpleBox ? 's-active ' : ''}s-tabs-title`} id="showPurpleBox" onClick={this.setActiveTab}>
					<Link to="/settings/purplebox">
						<span>{ t('settings_purple_box') }</span>
					</Link>
				</li>
				<li className={`${this.state.menu.showAccount ? 's-active ' : ''}s-tabs-title`} id="showAccount" onClick={this.setActiveTab}>
					<Link to="/settings/account">
						<span>{ t('settings_account') }</span>
					</Link>
				</li>
			</ul>
		);
	}
}

export default SettingsMenu;
