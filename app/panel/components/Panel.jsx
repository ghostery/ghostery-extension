/**
 * Panel Component
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

import React from 'react';
import { NavLink } from 'react-router-dom';
import Header from '../containers/HeaderContainer';
import { PlusPromoModal } from '../../shared-components';
import InsightsPromoModal from './InsightsPromoModal';
import PlusUpgradePromoModal from './PlusUpgradePromoModal';
import { DynamicUIPortContext } from '../contexts/DynamicUIPortContext';
import { sendMessage } from '../utils/msg';
import { setTheme } from '../utils/utils';
import history from '../utils/history';
import globals from '../../../src/classes/Globals';

const DOMAIN = globals.DEBUG ? 'ghosterystage' : 'ghostery';

/**
 * @class Implement base view with functionality common to all views.
 * @memberof PanelClasses
 */
class Panel extends React.Component {
	constructor(props) {
		super(props);

		// event bindings
		this.closeNotification = this.closeNotification.bind(this);
		this.clickReloadBanner = this.clickReloadBanner.bind(this);
		this.filterTrackers = this.filterTrackers.bind(this);
	}

	/**
	 * Lifecycle event
	 */
	componentDidMount() {
		sendMessage('ping', 'engaged');
		this._dynamicUIDataInitialized = false;
		this._dynamicUIPort = chrome.runtime.connect({ name: 'dynamicUIPanelPort' });
		this._dynamicUIPort.onMessage.addListener((msg) => {
			if (msg.to !== 'panel' || !msg.body) { return; }

			const { body } = msg;

			if (body.panel) {
				this._initializeData(body);
			} else if (this._dynamicUIDataInitialized) {
				this.props.actions.updatePanelData(body);
			}
		});
	}

	/**
	 * Lifecycle event
	 */
	componentWillUnmount() {
		this._dynamicUIPort.disconnect();
	}

	/**
	 * Reload the current tab
	 * @param  {Object} event
	 * @todo  Why do we need explicit argument here?
	 */
	clickReloadBanner() {
		sendMessage('reloadTab', { tab_id: +this.props.tab_id });
		window.close();
	}

	/**
	 * Close banner notification
	 * @param  {Object} event
	 * @todo  Why do we need explicit argument here?
	 */
	closeNotification() {
		const { notificationClasses } = this.props;
		let banner_status_name = '';

		if (notificationClasses.includes('hideous')) {
			banner_status_name = 'trackers_banner_status';
		} else if (notificationClasses.includes('warning') && (!notificationClasses.includes('alert') || !notificationClasses.includes('success'))) {
			banner_status_name = 'reload_banner_status';
		} else {
			banner_status_name = 'temp_banner_status';
		}

		this.props.actions.closeNotification({
			banner_status_name,
		});
	}

	/**
	 * Filter trackers when clicking on compatibility/slow
	 * tracker notifications and trigger appropriate action.
	 * @param  {Object} event
	 */
	filterTrackers(event) {
		const classes = event.target.className;
		if (!this.props.is_expert) {
			return;
		}

		if (classes.includes('slow-insecure')) {
			this.props.actions.filterTrackers({ type: 'trackers', name: 'warning-slow-insecure' });
		} else if (classes.includes('compatibility')) {
			this.props.actions.filterTrackers({ type: 'trackers', name: 'warning-compatibility' });
		} else {
			this.props.actions.filterTrackers({ type: 'trackers', name: 'warning' });
		}

		this.closeNotification();
	}
	/**
	 * Dynamic UI data port first payload handling
	 * Called once, when we get the first message from the background through the port
	 * @param	{Object}	payload		the body of the message
	 */

	_initializeData(payload) {
		this._dynamicUIDataInitialized = true;

		const { panel, summary, blocking } = payload;
		const { current_theme, account } = panel;

		setTheme(document, current_theme, account);

		this.props.actions.updatePanelData(panel);
		this.props.actions.updateSummaryData(summary);
		if (blocking) { this.props.actions.updateBlockingData(blocking); }

		if (panel.is_expert) {
			// load Detail component
			this.props.history.push('/detail');
		}

		// persist whitelist/blacklist/paused_blocking notifications in the event that the
		// panel is opened without a page reload
		if (Object.keys(panel.needsReload.changes).length) {
			this.props.actions.showNotification({
				updated: 'init',
				reload: true
			});
		}
	}

	/**
	 * Helper render function for the notification callout
	 * @return {JSX} JSX for the notification callout
	 */
	renderNotification() {
		const needsReload = !!Object.keys(this.props.needsReload.changes).length;

		if (this.props.notificationText) {
			return (
				<span>
					<span key="0" dangerouslySetInnerHTML={{ __html: this.props.notificationText || t('panel_needs_reload') }} />
					{this.props.notificationText === t('promos_turned_off_notification') && (
						<NavLink className="settings-link" to="/settings/notifications" onClick={this.closeNotification}>{t('settings')}</NavLink>
					)}
					{needsReload && (
						<div key="1" className="needs-reload-link" onClick={this.clickReloadBanner}>{ t('alert_reload') }</div>
					)}
				</span>
			);
		}
		if (needsReload) {
			return (
				<span>
					<span key="0">{t('panel_needs_reload')}</span>
					<span key="1" className="needs-reload-link" onClick={this.clickReloadBanner}>{ t('alert_reload') }</span>
				</span>
			);
		}
		if (this.props.notificationFilter === 'slow') {
			return (
				<span>
					<span key="0" className="filter-link slow-insecure" onClick={this.filterTrackers} dangerouslySetInnerHTML={{ __html: this.props.notificationText }} />
					<span key="1">{ t('panel_tracker_slow_non_secure_end') }</span>
				</span>
			);
		}
		if (this.props.notificationFilter === 'compatibility') {
			return (
				<span>
					<span key="0" className="filter-link compatibility" onClick={this.filterTrackers} dangerouslySetInnerHTML={{ __html: this.props.notificationText }} />
					<span key="1">{ t('panel_tracker_breaking_page_end') }</span>
				</span>
			);
		}

		return false;
	}

	_handlePromoNoThanksClick = (modal) => {
		this.props.actions.togglePromoModal();

		sendMessage('promoModals.turnOffPromos', {});

		if (modal === 'insights') {
			sendMessage('ping', 'promo_modals_decline_insights_upgrade');
		} else if (modal === 'plus_upgrade') {
			sendMessage('ping', 'promo_modals_decline_plus_upgrade');
		}

		this.props.actions.showNotification({
			classes: 'warning',
			reload: false,
			text: t('promos_turned_off_notification'),
		});
	};

	_handlePromoSignInClick = () => {
		this.props.actions.togglePromoModal();
		history.push({
			pathname: '/login',
		});
	};

	_handlePromoSelectBasicClick = () => {
		this.props.actions.togglePromoModal();

		// we do not mark the choice-required initial plus promo as 'seen' until
		// the user has clicked Select Basic or Select Plus
		sendMessage('promoModals.sawPlusPromo', {});

		sendMessage('ping', 'promo_modals_select_basic_panel');
	};

	/**
	 * @private
	 * Handle clicks on 'Select Plus' from the Plus Promo Modal (Choose Your Plan)
	 */
	_handlePromoSelectPlusClick = () => {
		this.props.actions.togglePromoModal();

		// we do not mark the choice-required initial plus promo as 'seen' until
		// the user has clicked Select Basic or Select Plus
		sendMessage('promoModals.sawPlusPromo', {});

		sendMessage('ping', 'promo_modals_select_plus_panel');

		const url = `https://checkout.${DOMAIN}.com/plus?utm_source=gbe&utm_campaign=in_app`;
		sendMessage('openNewTab', {
			url,
			become_active: true,
		});
	};

	/**
	 * @private
	 * Handle click action when user selects Subscribe button in
	 * Plus Upgrade or Insights modal
	 * @param  {string} modal Modal type (insights or plus)
	 */
	_handlePromoSubscribeClick = (modal) => {
		this.props.actions.togglePromoModal();

		let url = `https://checkout.${DOMAIN}.com/`;

		if (modal === 'insights') {
			sendMessage('ping', 'promo_modals_insights_upgrade_cta');
			url += 'insights?utm_source=gbe&utm_campaign=in_app_upgrade';
		} else if (modal === 'plus_upgrade') {
			sendMessage('ping', 'promo_modals_plus_upgrade_cta');
			url += 'plus?utm_source=gbe&utm_campaign=in_app_upgrade';
		}

		sendMessage('openNewTab', {
			url,
			become_active: true,
		});
	};

	_handlePromoXClick = (modal) => {
		this.props.actions.togglePromoModal();

		if (modal === 'insights') {
			sendMessage('ping', 'promo_modals_decline_insights_upgrade');
		} else if (modal === 'plus_upgrade') {
			sendMessage('ping', 'promo_modals_decline_plus_upgrade');
		}
	};

	_plusSubscriber = () => {
		const { loggedIn, user } = this.props;

		return loggedIn && (user && user.subscriptionsPlus);
	}

	_insightsSubscriber = () => {
		const { loggedIn, user } = this.props;

		return loggedIn && (user && user.scopes && user.scopes.includes('subscriptions:insights'));
	}

	_renderPlusPromoModal = () => {
		if (this._plusSubscriber() || this._insightsSubscriber()) return null;

		if (this.props.promoModal === 'plus_upgrade') {
			// the upgrade promo does not require the user to make a choice, so we mark it as 'seen' immediately
			sendMessage('promoModals.sawPlusPromo', {});
			sendMessage('ping', 'promo_modals_show_upgrade_plus');
			return (
				<PlusUpgradePromoModal
					handleNoThanksClick={this._handlePromoNoThanksClick}
					handleSignInClick={this._handlePromoSignInClick}
					handleSubscribeClick={this._handlePromoSubscribeClick}
					handleXClick={this._handlePromoXClick}
				/>
			);
		}

		// promoModal === 'plus_initial'
		sendMessage('ping', 'promo_modals_show_plus_choice_panel');
		return (
			<PlusPromoModal
				show
				location="panel"
				handleSelectBasicClick={this._handlePromoSelectBasicClick}
				handleSelectPlusClick={this._handlePromoSelectPlusClick}
				handleSignInClick={this._handlePromoSignInClick}
			/>
		);
	}

	_renderInsightsPromoModal = () => {
		if (this._insightsSubscriber()) return null;

		sendMessage('promoModals.sawInsightsPromo', {});

		sendMessage('ping', 'promo_modals_show_insights');

		return (
			<InsightsPromoModal
				handleNoThanksClick={this._handlePromoNoThanksClick}
				handleSignInClick={this._handlePromoSignInClick}
				handleSubscribeClick={this._handlePromoSubscribeClick}
				handleXClick={this._handlePromoXClick}
			/>
		);
	}

	_renderPromoModal = () => {
		const {
			promoModal,
			isPromoModalHidden,
		} = this.props;

		if (isPromoModalHidden) return null;

		if (promoModal === 'insights') {
			return this._renderInsightsPromoModal();
		}

		if (promoModal === 'plus_initial' || promoModal === 'plus_upgrade') {
			return this._renderPlusPromoModal();
		}

		return null;
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Panel
	 */
	render() {
		// this prevents double rendering when waiting for getPanelData() to finish
		if (!this.props.initialized) {
			return null;
		}

		const notificationText = this.props.notificationShown && this.renderNotification();

		return (
			<div id="panel">
				{this._renderPromoModal()}
				<div className="callout-container">
					<div className={`${(!notificationText ? 'hide ' : '') + this.props.notificationClasses} callout`}>
						<svg onClick={this.closeNotification} width="15px" height="15px" viewBox="0 0 15 15" className="close-button">
							<g>
								<path strokeWidth="3" strokeLinecap="round" d="M3,3 L12,12 M3,12 L12,3" />
							</g>
						</svg>
						<span className="callout-text">
							{this.renderNotification()}
						</span>
					</div>
				</div>
				<Header />
				<DynamicUIPortContext.Provider value={this._dynamicUIPort}>
					{ this.props.children }
				</DynamicUIPortContext.Provider>

			</div>
		);
	}
}

export default Panel;
