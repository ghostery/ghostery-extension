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
			getUserResolved: false,
			justInstalled: justInstalled === 'true',
			plusPromoModalShown: props.home.plus_promo_modal_shown,
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
	 * Dismisses the  Plus promo modal if user opts to stick with the basic plan
	 */
	_dismissModal = () => {
		this.setState({
			plusPromoModalShown: true,
		});
		this.props.actions.markPlusPromoModalShown();
	}

	_renderPlusPromoModal = () => (
		<div className="PlusPromoModal__content flex-container flex-dir-column align-middle">
			<div className="PlusPromoModal__thanks-for-download">
				Thanks for downloading Ghostery!
			</div>
			<div className="PlusPromoModal__choose-your-plan">
				Choose your privacy plan
			</div>
			<div className="PlusPromoModal__options-container full-width">
				<div className="PlusPromoModal__option-container">
					<div className="PlusPromoModal__option-description-box basic">
						<div className="PlusPromoModal__option-header basic">Ghostery Basic</div>
						<div className="PlusPromoModal__price-text basic">
							<span className="PlusPromoModal__currency-sign">$</span>
							<span className="PlusPromoModal__amount">0</span>
							<span className="PlusPromoModal__per-month">per month</span>
						</div>
						<div className="PlusPromoModal__option-description">
							<p className="PlusPromoModal__option-description-item">
								Protection for
								<span className="bold">
								one
								</span>
								browser
							</p>
							<p className="PlusPromoModal__option-description-item">Blocks Ads</p>
							<p className="PlusPromoModal__option-description-item">Blocks Trackers</p>
							<p className="PlusPromoModal__option-description-item">Fast Browsing</p>
						</div>
					</div>
					<div className="PlusPromoModal__button-container left">
						<div className="PlusPromoModal__button button hollow" onClick={this._dismissModal}>
							<span>Select Basic</span>
						</div>
					</div>
				</div>
				<div className="PlusPromoModal__option-container">
					<div className="PlusPromoModal__option-description-box plus">
						<div className="PlusPromoModal__recommended-banner">
							<img src="/app/images/hub/home/recommended-banner.svg" />
							<div className="PlusPromoModal__recommended-banner-text">Recommended</div>
						</div>
						<div className="PlusPromoModal__option-header plus">Ghostery Plus</div>
						<div className="PlusPromoModal__price-text plus">
							<span className="PlusPromoModal__currency-sign">$</span>
							<span className="PlusPromoModal__amount">2</span>
							<span className="PlusPromoModal__per-month">per month</span>
						</div>
						<div className="PlusPromoModal__option-description">
							<p className="PlusPromoModal__option-description-item">Ghostery Basic</p>
							<p className="PlusPromoModal__option-description-item">Historical Tracker Stats</p>
							<p className="PlusPromoModal__option-description-item">Priority Support</p>
							<p className="PlusPromoModal__option-description-item">New Color Themes</p>
						</div>
					</div>
					<div className="PlusPromoModal__button-container right">
						<a href="http://signon.ghostery.com/en/subscribe/" target="_blank" rel="noopener noreferrer" className="PlusPromoModal__button button primary" onClick={this._dismissModal}>
							<span>Select Plus</span>
						</a>
					</div>
				</div>
			</div>
		</div>
	);

	_render() {
		const { justInstalled, plusPromoModalShown } = this.state;
		const { home, user } = this.props;
		const isPlus = user && user.subscriptionsPlus || false;
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
			isPlus,
		};

		return (
			<div className="full-height">
				<Modal show={!isPlus && !plusPromoModalShown}>
					{this._renderPlusPromoModal()}
				</Modal>
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
