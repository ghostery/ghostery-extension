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
import PromoModal from '../../../shared-components/PromoModal';
import { sendMessage } from '../../utils';
import globals from '../../../../src/classes/Globals';

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
			getUserResolved: false,
			justInstalled: justInstalled === 'true',
		};

		const title = t('hub_home_page_title');
		window.document.title = title;

		props.actions.getHomeProps();

		// Prevent flickering in of user's email if getUser() returns after initial render
		props.actions.getUser()
			.then(() => {
				this.setState({
					getUserResolved: true,
				});
			});
	}

	/**
	 * @private
	 * Function to handle toggling Metrics Opt-In
	 */
	_handleToggleMetrics = () => {
		const { actions, home } = this.props;
		const enable_metrics = !home.enable_metrics;
		actions.setMetrics({ enable_metrics });
	}

	_render() {
		const { justInstalled } = this.state;
		const { home, user } = this.props;
		const isPlus = (user && user.plusAccess) || false;
		const {
			setup_complete,
			tutorial_complete,
			enable_metrics,
		} = home;

		return (
			<div className="full-height">
				<HomeView
					justInstalled={justInstalled}
					setup_complete={setup_complete}
					tutorial_complete={tutorial_complete}
					enable_metrics={enable_metrics}
					changeMetrics={this._handleToggleMetrics}
					email={user ? user.email : ''}
					isPlus={isPlus}
				/>
			</div>
		);
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Home View of the Hub app
	 */
	render() {
		const { getUserResolved } = this.state;

		return (getUserResolved ? this._render() : null);
	}
}

// PropTypes ensure we pass required props of the correct type
// Note: isRequired is not needed when a prop has a default value
HomeViewContainer.propTypes = {
	home: PropTypes.shape({
		enable_metrics: PropTypes.bool,
		premium_promo_modal_shown: PropTypes.bool,
		setup_complete: PropTypes.bool,
		tutorial_complete: PropTypes.bool,
	}),
	user: PropTypes.shape({
		email: PropTypes.string,
		plusAccess: PropTypes.bool,
	}),
	actions: PropTypes.shape({
		getHomeProps: PropTypes.func.isRequired,
		getUser: PropTypes.func.isRequired,
		markPremiumPromoModalShown: PropTypes.func.isRequired,
		setMetrics: PropTypes.func.isRequired,
	}).isRequired,
};

// Default props used on the Home View
HomeViewContainer.defaultProps = {
	home: {
		enable_metrics: false,
		premium_promo_modal_shown: false,
		setup_complete: false,
		tutorial_complete: false,
	},
	user: {
		email: '',
		plusAccess: false,
	},
};

export default HomeViewContainer;
