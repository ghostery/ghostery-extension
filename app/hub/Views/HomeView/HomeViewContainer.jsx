/**
 * Home View Container
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
import QueryString from 'query-string';
import HomeView from './HomeView';
import { sendMessage } from '../../utils';

/**
 * @class Implement the Home View Container for the Ghostery Hub
 * @extends Component
 * @memberof HubContainers
 */
class HomeViewContainer extends Component {
	constructor(props) {
		super(props);

		let { justInstalled } = QueryString.parse(window.location.search);
		if (justInstalled === 'true' && (this.props.fromLoginPage || this.props.fromCreateAccountPage)) {
			const { origin, pathname, hash } = window.location;
			window.history.pushState({}, '', `${origin}${pathname}${hash}`);
			justInstalled = false;
		}
		this.state = {
			justInstalled: justInstalled === 'true',
		};


		const title = t('hub_home_page_title');
		window.document.title = title;

		this.props.actions.getHomeProps();
	}

	/**
	* Function to handle toggling Metrics Opt-In
	*/
	_handleToggleMetrics = () => {
		const enable_metrics = !this.props.home.enable_metrics;
		this.props.actions.setMetrics({ enable_metrics });
	}

	/**
	* Function to handle click on user email which
	* replaces create account link in logged in state
	*/
	_handleEmailClick = () => {
		sendMessage('OPEN_USER_PROFILE');
	}

	/**
	* Function to handle click on 'X' of the successful login banner
	* Cleared params return back as property values which hide the banner.
	*/
	_closeAlert = () => {
		this.props.actions.clearLoginParams();
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Home View of the Hub app
	 */
	render() {
		// ToDo: Get these from action, reducer and props. Will be on this.props.home
		// These are passed as props so we can the user's email and link to their account when they are signed in
		const account_text = t('hub_home_subheader_create_account');
		const account_link = '/create-account';

		const { justInstalled } = this.state;
		const { user, fromLoginPage, fromCreateAccountPage } = this.props;
		const email = user ? user.email : '';

		const loginAlertText = (fromLoginPage && !fromCreateAccountPage) ?
			`${t('panel_signin_success')} ${email}` :
			(!fromLoginPage && fromCreateAccountPage) ? `${t('create_account_success')} ${t('panel_signin_success')} ${email}` : '';
		const {
			setup_complete,
			tutorial_complete,
			enable_metrics,
		} = this.props.home;
		const childProps = {
			justInstalled,
			setup_complete,
			tutorial_complete,
			enable_metrics,
			changeMetrics: this._handleToggleMetrics,
			account_text,
			account_link,
			email,
			loginAlertText,
			emailClick: this._handleEmailClick,
			closeAlert: this._closeAlert,
		};

		return <HomeView {...childProps} />;
	}
}

// PropTypes ensure we pass required props of the correct type
// Note: isRequired is not needed when a prop has a default value
HomeViewContainer.propTypes = {
	home: PropTypes.shape({
		setup_complete: PropTypes.bool,
		tutorial_complete: PropTypes.bool,
		enable_metrics: PropTypes.bool,
	}),
	account_text: PropTypes.string,
	account_link: PropTypes.string,
	email: PropTypes.string,
	loginAlertText: PropTypes.string,
};

// Default props used throughout the Setup flow
HomeViewContainer.defaultProps = {
	home: {
		setup_complete: false,
		tutorial_complete: false,
		enable_metrics: false,
	},
	account_text: '',
	account_link: '',
	email: '',
	loginAlertText: '',
};

export default HomeViewContainer;
