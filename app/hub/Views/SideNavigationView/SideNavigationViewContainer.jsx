/**
 * Side Navigation View Container
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
import SideNavigationView from './SideNavigationView';
import { sendMessage } from '../../utils';

/**
 * @class Implement the Side Navigation View for the Ghostery Hub
 * @extends Component
 * @memberof HubComponents
 */
class SideNavigationViewContainer extends Component {
	constructor(props) {
		super(props);
		this.state = {
			menuItems: [
				{ href: '/', icon: 'home', text: 'Home' },
				{ href: '/setup', icon: 'setup', text: 'Customize Setup' },
				{ href: '/tutorial', icon: 'tutorial', text: 'Take a Tutorial' },
				{ href: '/supporter', icon: 'supporter', text: 'Become a Supporter' },
				{ href: '/rewards', icon: 'rewards', text: 'Try Ghostery Rewards' },
				{ href: '/products', icon: 'products', text: 'See More Ghostery Products' },
			],
		};
	}

	_openUserProfile = () => {
		sendMessage('OPEN_USER_PROFILE');
	}

	_logout = () => {
		this.props.actions.logout();
	}

	render() {
		const { user } = this.props;

		const bottomItems = user ?
			[
				{
					id: 'email',
					clickHandler: this._openUserProfile,
					text: user.email,
				},
				{
					id: 'logout',
					clickHandler: this._logout,
					text: 'Sign Out',
				}
			] :
			[
				{
					href: '/create-account',
					text: 'Create Account',
				},
				{
					href: '/log-in',
					text: 'Sign In',
				}
			];
		const { menuItems } = this.state;
		return <SideNavigationView menuItems={menuItems} bottomItems={bottomItems} user={user} />;
	}
}

export default SideNavigationViewContainer;
