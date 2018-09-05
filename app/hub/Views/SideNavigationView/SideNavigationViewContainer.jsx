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
				{ href: '/', icon: 'home', text: t('hub_side_navigation_home') },
				{ href: '/setup', icon: 'setup', text: t('hub_side_navigation_setup') },
				{ href: '/tutorial', icon: 'tutorial', text: t('hub_side_navigation_tutorial') },
				{ href: '/supporter', icon: 'supporter', text: t('hub_side_navigation_supporter') },
				{ href: '/rewards', icon: 'rewards', text: t('hub_side_navigation_rewards') },
				{ href: '/products', icon: 'products', text: t('hub_side_navigation_products') },
			],
			bottomItems: [
				{ href: '/create-account', text: t('hub_side_navigation_create_account') },
				{ href: '/log-in', text: t('hub_side_navigation_log_in') },
			],
		};
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Side Navigation View of the Hub app
	 */
	render() {
		const { menuItems, bottomItems } = this.state;
		return <SideNavigationView menuItems={menuItems} bottomItems={bottomItems} />;
	}
}

// No need for PropTypes. The SideNavigationViewContainer has no props.

export default SideNavigationViewContainer;
