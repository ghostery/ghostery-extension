/**
 * App Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2018 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 *
 * ToDo: Update this file.
 */

import React, { Component } from 'react';
import SideNavigation from './Views/SideNavigationView/SideNavigationView';

/**
 * @class Implements the container App for the Ghostery Hub
 * @extends Component
 * @memberof HubComponents
 */
class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			menu: {
				items: [
					{ location: 'top', text: 'Ghostery' },
					{
						location: 'list', type: 'link', href: '/', icon: 'home', text: 'Home'
					},
					{
						location: 'list', type: 'link', href: '/setup', icon: 'home', text: 'Customize Setup'
					},
					{
						location: 'list', type: 'link', href: '/tutorial', icon: 'home', text: 'Visit Tutorial'
					},
					{
						location: 'list', type: 'link', href: '/supporter', icon: 'home', text: 'Become a Ghostery Supporter'
					},
					{
						location: 'list', type: 'link', href: '/rewards', icon: 'home', text: 'Check out Ghostery Rewards'
					},
					{
						location: 'list', type: 'link', href: '/products', icon: 'home', text: 'Try other Ghostery Products'
					},
					{
						location: 'bottom', type: 'modal', icon: 'share', text: 'Share with Friends'
					},
					{ location: 'bottom', type: 'separator' },
					{
						location: 'bottom', type: 'link', href: '/create-account', text: 'Create Account'
					},
					{
						location: 'bottom', type: 'link', href: '/log-in', text: 'Log In'
					},
				],
			},
		};
	}

	/**
	 * Lifecycle Event
	 */
	componentWillMount() {
		window.document.title = '';
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Hub app
	 */
	render() {
		const { menu } = this.state;

		return (
			<div className="App">
				<div className="App__leftNavigation">
					<SideNavigation items={menu.items} />
				</div>
				<div className="App__mainContent">
					{this.props.children}
				</div>
			</div>
		);
	}
}

export default App;
