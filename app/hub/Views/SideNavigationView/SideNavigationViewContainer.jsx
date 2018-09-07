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
	_openUserProfile = () => {
		sendMessage('OPEN_USER_PROFILE');
	}

	_logout = () => {
		this.props.actions.logout();
	}

	render() {
		const { user } = this.props;
		const menuItems = [
			{ href: '/', icon: 'home', text: t('hub_side_navigation_home') },
			{ href: '/setup', icon: 'setup', text: t('hub_side_navigation_setup') },
			{ href: '/tutorial', icon: 'tutorial', text: t('hub_side_navigation_tutorial') },
			{ href: '/supporter', icon: 'supporter', text: t('hub_side_navigation_supporter') },
			{ href: '/rewards', icon: 'rewards', text: t('hub_side_navigation_rewards') },
			{ href: '/products', icon: 'products', text: t('hub_side_navigation_products') },
		];
		const bottomItems = user ? [
			{ id: 'email', text: user.email, clickHandler: this._openUserProfile },
			{ id: 'logout', text: t('hub_side_navigation_log_out'), clickHandler: this._logout },
		] : [
			{ href: '/create-account', text: t('hub_side_navigation_create_account') },
			{ href: '/log-in', text: t('hub_side_navigation_log_in') },
		];
		const childProps = { user, menuItems, bottomItems };

		return <SideNavigationView {...childProps} />;
	}
}

export default SideNavigationViewContainer;
