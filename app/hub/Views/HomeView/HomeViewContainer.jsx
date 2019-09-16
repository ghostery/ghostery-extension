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
import { NavLink } from 'react-router-dom';
import HomeView from './HomeView';
import { Modal } from '../../../shared-components';

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
			showPlusPromoModal: !props.home.plus_promo_modal_shown,
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

	_dismissModal = () => {
		this.setState({
			showPlusPromoModal: false,
		});
		this.props.actions.markPlusPromoModalShown();
	}

	_renderModalChildren = () => (
		<div className="SetupModal__content flex-container flex-dir-column align-middle">
			<div className="SetupModal__image" />
			<div className="SetupModal__text flex-child-grow">
				{t('hub_setup_enter_modal_text')}
			</div>
			<div className="button success hollow" onClick={this._dismissModal}>
				<span>Select Basic</span>
			</div>
			<div className="SetupModal__buttonContainer full-width">
				<div className="full-width flex-container align-justify">
					<NavLink to="/" className="button success hollow">
						{t('hub_setup_modal_button_no')}
					</NavLink>
				</div>
			</div>
		</div>
	);

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Home View of the Hub app
	 */
	render() {
		const { justInstalled, showPlusPromoModal } = this.state;
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

		return (
			<div className="full-height">
				<Modal show={showPlusPromoModal}>
					{this._renderModalChildren()}
				</Modal>
				<HomeView {...childProps} />
			</div>
		);
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
