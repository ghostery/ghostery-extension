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

import React from 'react';
import PropTypes from 'prop-types';
import QueryString from 'query-string';
import HomeView from './HomeView';

/**
 * @class Implement the Home View for the Ghostery Hub
 * @extends Component
 * @memberof HubContainers
 */
class HomeViewContainer extends React.Component {
	constructor(props) {
		super(props);

		const { justInstalled } = QueryString.parse(window.location.search);
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
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Home View of the Hub app
	 */
	render() {
		// ToDo: Get these from action, reducer and props. Will be on this.props.home
		// These are passed as props so we can the user's email and link to their account when they are signed in
		const account_text = t('hub_home_subheader_create_account');
		const account_link = '/create-account';

		const { justInstalled } = this.state;
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
		account_text: PropTypes.string,
		account_link: PropTypes.string,
	}),
};

// Default props used throughout the Setup flow
HomeViewContainer.defaultProps = {
	home: {
		setup_complete: false,
		tutorial_complete: false,
		enable_metrics: false,
		account_text: '',
		account_link: '',
	},
};

export default HomeViewContainer;
