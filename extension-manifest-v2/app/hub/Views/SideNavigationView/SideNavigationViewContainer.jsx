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
import PropTypes from 'prop-types';
import SideNavigationView from './SideNavigationView';
import globals from '../../../../src/classes/Globals';

/**
 * @class Implement the Side Navigation View for the Ghostery Hub
 * @extends Component
 * @memberof HubContainers
 */
class SideNavigationViewContainer extends Component {
	constructor(props) {
		super(props);

		props.actions.getUser();
	}

	/**
	* Function to handle clicking Log Out
	*/
	_handleLogoutClick = () => {
		this.props.actions.setToast({
			toastMessage: '',
			toastClass: '',
		});
		this.props.actions.logout();
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Side Navigation View of the Hub app
	 */
	render() {
		const { user, location } = this.props;
		const disableRegEx = /^(\/setup)|(\/tutorial)/;

		const menuItems = [
			{ href: '/', icon: 'home', text: t('hub_side_navigation_home') },
			{ href: '/setup', icon: 'setup', text: t('hub_side_navigation_setup') },
			{ href: '/tutorial', icon: 'tutorial', text: t('hub_side_navigation_tutorial') },
			{ href: '/supporter', icon: 'supporter', text: t('hub_side_navigation_supporter') },
			{ href: '/rewards', icon: 'rewards', text: t('hub_side_navigation_rewards') },
			{ href: '/products', icon: 'products', text: t('hub_side_navigation_products') },
		];
		const bottomItems = user ? [
			{ id: 'email', href: `https://account.${globals.GHOSTERY_DOMAIN}.com/`, text: user.email },
			{ id: 'logout', text: t('hub_side_navigation_log_out'), clickHandler: this._handleLogoutClick },
		] : [
			{ id: 'create-account', href: '/create-account', text: t('hub_side_navigation_create_account') },
			{ id: 'log-id', href: '/log-in', text: t('hub_side_navigation_log_in') },
		];
		const childProps = {
			menuItems,
			bottomItems,
			disableNav: disableRegEx.test(location.pathname),
		};

		return <SideNavigationView {...childProps} />;
	}
}

// PropTypes ensure we pass required props of the correct type
SideNavigationViewContainer.propTypes = {
	actions: PropTypes.shape({
		getUser: PropTypes.func.isRequired,
		logout: PropTypes.func.isRequired,
	}).isRequired,
	user: PropTypes.shape({
		email: PropTypes.string,
	}),
};

// Default props used on the Side Navigation View
SideNavigationViewContainer.defaultProps = {
	user: {
		email: '',
	},
};

export default SideNavigationViewContainer;
