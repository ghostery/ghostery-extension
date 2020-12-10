/**
 * Side Navigation View Container
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2019 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import QueryString from 'query-string';
import SideNavigationView from './SideNavigationView';
import globals from '../../../../src/classes/Globals';

const { BROWSER_INFO } = globals;
const IS_ANDROID = (BROWSER_INFO.os === 'android');

// Flag to display alternate hub view (used for A/B testing ticket GH-2097)
const ah = (QueryString.parse(window.location.search).ah === 'true') || false;

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
		const { actions } = this.props;
		actions.setToast({
			toastMessage: '',
			toastClass: '',
		});
		actions.logout();
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Side Navigation View of the Hub app
	 */
	render() {
		const { user, location } = this.props;
		const disableRegEx = /^(\/setup)|(\/tutorial)/;

		const menuItems = ah ? [
			{ href: '/home', icon: 'home', text: t('hub_side_navigation_home') },
			{ href: '/setup', icon: 'setup', text: t('customize_setup') },
		] : [
			{ href: '/home', icon: 'home', text: t('hub_side_navigation_home') },
			{ href: '/', icon: 'shield', text: t('hub_side_navigation_upgrade_plan') },
			{ href: '/setup', icon: 'setup', text: t('customize_setup') },
			{ href: '/tutorial', icon: 'tutorial', text: t('hub_side_navigation_tutorial') },
			{ href: '/plus', icon: 'plus', text: t('get_ghostery_plus') },
			...((IS_ANDROID) ? [] : [{ href: '/products', icon: 'products', text: t('hub_side_navigation_products') }])
		];

		const bottomItems = user ? [
			{ id: 'email', href: `${globals.ACCOUNT_BASE_URL}/`, text: user.email },
			{ id: 'logout', text: t('sign_out'), clickHandler: this._handleLogoutClick },
		] : [
			{ id: 'create-account', href: '/create-account', text: t('create_account') },
			{
				id: 'log-id',
				href: '/log-in',
				text: t('sign_in'),
				icon: 'profile',
			},
		];

		return (
			<SideNavigationView
				menuItems={menuItems}
				bottomItems={bottomItems}
				disableNav={disableRegEx.test(location.pathname)}
			/>
		);
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
