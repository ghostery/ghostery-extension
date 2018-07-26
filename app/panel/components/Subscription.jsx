/**
 * Subcription Component
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
import { debounce } from 'underscore';
import { Route } from 'react-router-dom';
import { sendMessage } from '../utils/msg';
import SubscriptionMenu from './Subscription/SubscriptionMenu';
import SubscriptionInfo from './Subscription/SubscriptionInfo';
import SubscriptionThemes from './Subscription/SubscriptionThemes';
import PrioritySupport from './Subscription/PrioritySupport';
/**
 * @class Implement base Subscription view which routes navigation to all subscription subviews
 * @memberof PanelClasses
 */
class Subscription extends React.Component {
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
		this.props.history.push('/subscription/info');
	}
	/**
	 * Lifecycle event. Triggers action which delivers subscription data.
	 */
	componentDidMount() {
		console.log("SUBSCRIPTION", this.props);
		this.props.actions.getSubscriptionData();
	}

	componentWillReceiveProps(nextProps) {
		console.log("SUBSCRIPTION WILL RECEIVE PROPS", this.props, nextProps);
	}


	SubscriptionInfoComponent = () => (<SubscriptionInfo toggleCheckbox={this.toggleCheckbox} subscriptionData={this.props} actions={this.props.actions} showToast={this.showToast} language={this.props.language} />);
	SubscriptionThemesComponent = () => (<SubscriptionThemes toggleCheckbox={this.toggleCheckbox} subscriptionData={this.props} actions={this.props.actions} showToast={this.showToast} language={this.props.language} />);
	PrioritySupportComponent = () => (<PrioritySupport toggleCheckbox={this.toggleCheckbox} subscriptionData={this.props} actions={this.props.actions} showToast={this.showToast} language={this.props.language} />);
	/**
	 * Trigger parameterized checkbox action.
	 * @param  {Object} event 	checking a checkbox event
	 */
	toggleCheckbox(event) {
		if (event.currentTarget.name === 'enable_offers') {
			this.props.actions.sendSignal(!event.currentTarget.checked ? 'rewards_off' : 'rewards_on');
			sendMessage('ping', !event.currentTarget.checked ? 'rewards_off' : 'rewards_on');
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
	 * user that altered subscription was saved.
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
	 * Render top level component of the Subscription view.
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
					<SubscriptionMenu/>
					<Route path="/subscription/info" render={this.SubscriptionInfoComponent} />
					<Route path="/subscription/themes" render={this.SubscriptionThemesComponent} />
					<Route path="/subscription/prioritysupport" render={this.PrioritySupportComponent} />
				</div>
			</div>
		);
	}
}

export default Subscription;
