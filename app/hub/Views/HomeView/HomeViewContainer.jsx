/**
 * Home View Container
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
import HomeView from './HomeView';

/**
 * @class Implement the Home View for the Ghostery Hub
 * @extends Component
 * @memberof HubContainers
 */
class HomeViewContainer extends Component {
	constructor(props) {
		super(props);

		const { justInstalled } = QueryString.parse(window.location.search);
		this.state = {
			justInstalled: justInstalled === 'true',
		};

		const title = t('hub_home_page_title');
		window.document.title = title;

		props.actions.getHomeProps();
		props.actions.getUser();
	}

	/**
	* Function to handle toggling Metrics Opt-In
	*/
	_handleToggleMetrics = () => {
		const enable_metrics = !this.props.home.enable_metrics;
		this.props.actions.setMetrics({ enable_metrics });
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Home View of the Hub app
	 */
	render() {
		const { justInstalled } = this.state;
		const { home, user } = this.props;
		const {
			setup_complete,
			tutorial_complete,
			enable_metrics,
		} = home;
		const childProps = {
			justInstalled,
			setup_complete,
			tutorial_complete,
			enable_metrics,
			changeMetrics: this._handleToggleMetrics,
			email: user ? user.email : '',
			isPlus: user && user.subscriptionsPlus || false,
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
	user: PropTypes.shape({
		email: PropTypes.string,
		subscriptionsPlus: PropTypes.bool,
	}),
	actions: PropTypes.shape({
		getHomeProps: PropTypes.func.isRequired,
		setMetrics: PropTypes.func.isRequired,
		getUser: PropTypes.func.isRequired,
	}).isRequired,
};

// Default props used on the Home View
HomeViewContainer.defaultProps = {
	home: {
		setup_complete: false,
		tutorial_complete: false,
		enable_metrics: false,
	},
	user: {
		email: '',
		subscriptionsPlus: false,
	},
};

export default HomeViewContainer;
