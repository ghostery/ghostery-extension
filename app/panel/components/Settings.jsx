/**
 * Settings Component
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
import { debounce } from 'underscore';
import { Route } from 'react-router-dom';
import { sendMessage } from '../utils/msg';
import SettingsMenu from './Settings/SettingsMenu';
import GlobalBlocking from './Settings/GlobalBlocking';
import TrustAndRestrict from './Settings/TrustAndRestrict';
import GeneralSettings from './Settings/GeneralSettings';
import Notifications from './Settings/Notifications';
import OptIn from './Settings/OptIn';
import Purplebox from './Settings/Purplebox';
import Account from './Settings/Account';
import { DynamicUIPortContext } from '../contexts/DynamicUIPortContext';
/**
 * @class Implement base Settings view which routes navigation to all settings subviews
 * @memberof PanelClasses
 */
class Settings extends React.Component {
	static contextType = DynamicUIPortContext;

	constructor(props) {
		super(props);
		this.state = {
			showToast: false,
			toastText: ''
		};

		// event bindings
		this.toggleCheckbox = this.toggleCheckbox.bind(this);
		this.selectItem = this.selectItem.bind(this);
		this.showToast = this.showToast.bind(this);
		this.hideToast = this.hideToast.bind(this);
	}
	/**
	 * Lifecycle event. Default sub view is set here.
	 */
	componentWillMount() {
		this.props.history.push('/settings/globalblocking');
	}

	/**
	 * Lifecycle event. Triggers action which delivers settings data.
	 */
	componentDidMount() {
		this._dynamicUIPort = this.context;
		this._dynamicUIPort.onMessage.addListener((msg) => {
			if (msg.to !== 'settings' || !msg.body) { return; }

			this.props.actions.updateSettingsData(msg.body);
		});
		this._dynamicUIPort.postMessage({ name: 'SettingsComponentDidMount' });
	}

	/**
	 * Lifecycle event
	 */
	componentWillUnmount() {
		this._dynamicUIPort.postMessage({ name: 'SettingsComponentWillUnmount' });
	}

	GlobalBlockingComponent = () => (<GlobalBlocking toggleCheckbox={this.toggleCheckbox} settingsData={this.props} actions={this.props.actions} showToast={this.showToast} language={this.props.language} />);
	TrustAndRestrictComponent = () => (<TrustAndRestrict toggleCheckbox={this.toggleCheckbox} site_whitelist={this.props.site_whitelist} site_blacklist={this.props.site_blacklist} actions={this.props.actions} />)
	GeneralSettingsComponent = () => (<GeneralSettings toggleCheckbox={this.toggleCheckbox} settingsData={this.props} actions={this.props.actions} />);
	PurpleboxComponent = () => (<Purplebox toggleCheckbox={this.toggleCheckbox} selectItem={this.selectItem} settingsData={this.props} actions={this.props.actions} />);
	NotificationsComponent = () => (<Notifications toggleCheckbox={this.toggleCheckbox} settingsData={this.props} actions={this.props.actions} />);
	OptInComponent = () => (<OptIn toggleCheckbox={this.toggleCheckbox} settingsData={this.props} actions={this.props.actions} />);
	AccountComponent = () => (<Account toggleCheckbox={this.toggleCheckbox} settingsData={this.props} actions={this.props.actions} />);
	/**
	 * Trigger parameterized checkbox action.
	 * @param  {Object} event 	checking a checkbox event
	 */
	toggleCheckbox(event) {
		if (event.currentTarget.name === 'enable_offers') {
			const signal = {
				actionId: !event.currentTarget.checked ? 'rewards_off' : 'rewards_on',
				origin: 'rewards-hub',
				type: 'action-signal',
			};
			sendMessage('setPanelData', { enable_offers: event.currentTarget.checked, signal }, undefined, 'rewardsPanel');
			sendMessage('ping', event.currentTarget.checked ? 'rewards_on' : 'rewards_off');
		}
		this.props.actions.toggleCheckbox({
			event: event.currentTarget.name,
			checked: event.currentTarget.checked,
		});
	}
	/**
	 * Trigger parameterized selection action.
	 */
	selectItem(event) {
		this.props.actions.selectItem({
			event: event.currentTarget.name,
			value: event.currentTarget.value,
		});
	}
	/**
	 * Implement alert which is currently used to inform
	 * user that altered settings were saved.
	 */
	showToast(data) {
		this.setState({
			showToast: true,
			toastText: data.text
		});
		this.hideToast();
	}

	/**
	 * Hide alert in 3 sec. after it has been shown.
	 */
	hideToast = debounce(function () {
		this.setState({
			showToast: false,
			toastText: ''
		});
	}, 3000)
	/**
	 * Render top level component of the Settings view.
	 * @return {ReactComponent}   ReactComponent instance
	 */
	render() {
		return (
			<div>
				<div className="callout-container">
					<div className={`callout toast success ${this.state.showToast ? '' : 'hide'}`}>
						<div className="callout-text">{this.state.toastText}</div>
					</div>
				</div>
				<div id="content-settings">
					<SettingsMenu is_expanded={this.props.is_expanded} />
					<Route path="/settings/globalblocking" render={this.GlobalBlockingComponent} />
					<Route path="/settings/trustandrestrict" render={this.TrustAndRestrictComponent} />
					<Route path="/settings/generalsettings" render={this.GeneralSettingsComponent} />
					<Route path="/settings/notifications" render={this.NotificationsComponent} />
					<Route path="/settings/optin" render={this.OptInComponent} />
					<Route path="/settings/purplebox" render={this.PurpleboxComponent} />
					<Route path="/settings/account" render={this.AccountComponent} />
				</div>
			</div>
		);
	}
}

export default Settings;
