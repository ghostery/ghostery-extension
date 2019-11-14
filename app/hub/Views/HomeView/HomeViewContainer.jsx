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
import { PlusPromoModal } from '../../../shared-components';
import { sendMessage } from '../../utils';
import globals from '../../../../src/classes/Globals';

const DOMAIN = globals.DEBUG ? 'ghosterystage' : 'ghostery';

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

		// Prevent flickering in of user's email if getUser() returns after initial render,
		// as well as flickering of plus promo modal if user is already a subscriber
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
		const enable_metrics = !this.props.home.enable_metrics;
		this.props.actions.setMetrics({ enable_metrics });
	}

	/**
	 * @private
	 * Function to handle clicks on Select Basic in the Plus Promo Modal
	 */
	_handlePromoSelectBasicClick = () => {
		// GH-1777
		// we want to show the Plus Promo modal once per Hub visit
		this.props.actions.markPlusPromoModalShown();

		sendMessage('SET_PLUS_PROMO_MODAL_SEEN', {});

		sendMessage('SEND_PING', 'promo_modals_select_basic_hub');
	}

	/**
	 * @private
	 * Function to handle clicks on 'Select Plus' in the Plus Promo Modal (Choose Your Plan)
	 */
	_handlePromoSelectPlusClick = () => {
		// GH-1777
		// we want to show the Plus Promo modal once per Hub visit
		this.props.actions.markPlusPromoModalShown();

		sendMessage('SET_PLUS_PROMO_MODAL_SEEN', {});

		sendMessage('SEND_PING', 'promo_modals_select_plus_hub');

		window.open(`https://checkout.${DOMAIN}.com/plus?utm_source=gbe&utm_campaign=intro_hub`, '_blank');
	}

	_render() {
		const { justInstalled } = this.state;
		const { home, user } = this.props;
		const isPlus = user && user.subscriptionsPlus || false;
		const {
			plus_promo_modal_shown,
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
			isPlus,
		};

		const showPromoModal = !isPlus && !plus_promo_modal_shown;
		if (showPromoModal) {
			sendMessage('SEND_PING', 'promo_modals_show_plus_choice_hub');
		}

		return (
			<div className="full-height">
				<PlusPromoModal
					show={showPromoModal}
					location="hub"
					handleSelectBasicClick={this._handlePromoSelectBasicClick}
					handleSelectPlusClick={this._handlePromoSelectPlusClick}
				/>
				<HomeView {...childProps} />
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
		plus_promo_modal_shown: PropTypes.bool,
		setup_complete: PropTypes.bool,
		tutorial_complete: PropTypes.bool,
	}),
	user: PropTypes.shape({
		email: PropTypes.string,
		subscriptionsPlus: PropTypes.bool,
	}),
	actions: PropTypes.shape({
		getHomeProps: PropTypes.func.isRequired,
		getUser: PropTypes.func.isRequired,
		markPlusPromoModalShown: PropTypes.func.isRequired,
		setMetrics: PropTypes.func.isRequired,
	}).isRequired,
};

// Default props used on the Home View
HomeViewContainer.defaultProps = {
	home: {
		enable_metrics: false,
		plus_promo_modal_shown: false,
		setup_complete: false,
		tutorial_complete: false,
	},
	user: {
		email: '',
		subscriptionsPlus: false,
	},
};

export default HomeViewContainer;
