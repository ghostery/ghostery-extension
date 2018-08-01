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

import React from 'react';
import { Route } from 'react-router-dom';
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
			isChecked: false
		};

		// event bindings
		this.toggleThemes = this.toggleThemes.bind(this);
	}

	/**
	 * Lifecycle event. Default sub view is set here.
	 */
	componentWillMount() {
		this.props.history.push('/subscription/info');
		this.props.actions.getSubscriptionData().then(() => {});
	}

	toggleThemes(event) {
		const dataUrl = "../../dist/css/midnight.css";
		const newChecked = !this.state.isChecked;
		this.setState({isChecked: newChecked});
		if(newChecked) {
			let style = document.getElementById("midnight");
			if(!style) {
				style = document.createElement('style');
				if(style) {
					style.textContent = "#content-summary {background-color: #124559; }";
					style.id = "midnight";
					document.head.appendChild(style);
				}
			}
		} else {
			const style = document.getElementById("midnight");
			document.head.removeChild(style);
		}
		// const theme = document.getElementsByTagName("link")[ 2 ];
		// theme.setAttribute("href", newChecked ? dataUrl : null);
		// console.log("LINK", theme);
	}

	SubscriptionInfoComponent = () => (<SubscriptionInfo subscriptionData={this.props}/>);
	SubscriptionThemesComponent = () => (<SubscriptionThemes isChecked={this.state.isChecked} subscriptionData={this.props} toggleThemes={this.toggleThemes} actions={this.props.actions} />);
	PrioritySupportComponent = () => (<PrioritySupport/>);
	/**
	 * Render top level component of the Subscription view.
	 * @return {ReactComponent}   ReactComponent instance
	 */
	render() {
		return (
			<div>
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
