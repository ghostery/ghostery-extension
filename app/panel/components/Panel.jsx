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
import ClassNames from 'classnames';
import Header from '../containers/HeaderContainer';
import PanelToTabLink from './BuildingBlocks/PanelToTabLink';
import { PlusPromoModal, Modal } from '../../shared-components';
import InsightsPromoModal from '../containers/InsightsPromoModalContainer';
import { DynamicUIPortContext } from '../contexts/DynamicUIPortContext';
import { sendMessage } from '../utils/msg';
import { setTheme } from '../utils/utils';
/**
 * @class Implement base view with functionality common to all views.
 * @memberof PanelClasses
 */
class Panel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			insightsPromoModalShown: false,
			plusPromoModalShown: false
		};

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

		if (panel.enable_offers && panel.unread_offer_ids.length > 0) {
			sendMessage('ping', 'engaged_offer');
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

	_handlePlusPromoModalClicks = () => {
		// TODO send appropriate metrics ping(s) for GH-1775
		sendMessage('promoModals.sawPlusPromo', {});
		this.setState({
			plusPromoModalShown: true
		});
	}

	_handleNoThanksClick = () => {
		sendMessage('promoModals.sawPlusPromo', {});
		sendMessage('promoModals.turnOffPromos', {});
		this.setState({
			plusPromoModalShown: true
		});
	}

	_handleSubscriberSignInClick = () => {
		sendMessage('promoModals.sawPlusPromo', {});
		this.setState({
			plusPromoModalShown: true
		});
		this.props.history.push('/login');
	}

	_renderPlusPromoUpgradeModal(signedIn) {
		const contentClassNames = ClassNames(
			'PlusPromoModal__content',
			'flex-container',
			'flex-dir-column',
			'align-middle',
			'panel',
			'upgrade'
		);

		return (
			<Modal show>
				<div className={contentClassNames}>
					<div className="PlusPromoModal__buttons-background upgrade" />
					<img className="PlusPromoModal__gold-ghostie-badge" src="/app/images/hub/home/gold-ghostie-badge.svg" />
					<div className="PlusPromoModal__header">
						{t('upgrade_your_ghostery_experience')}
					</div>
					<div className="PlusPromoModal__description cta">
						{t('upgrade_cta_TEXT')}
					</div>
					<div className="PlusPromoModal__button-container" onClick={this._handlePlusPromoModalClicks}>
						<PanelToTabLink className="PlusPromoModal__button upgrade" href="http://signon.ghostery.com/en/subscribe/">
							<span className="button-text">{t('upgrade_to_plus')}</span>
						</PanelToTabLink>
					</div>
					<div className="PlusPromoModal__text-link-container">
						{
							!signedIn &&
							(
								<div onClick={this._handleSubscriberSignInClick} className="PlusPromoModal__text-link">
									{t('already_subscribed_sign_in')}
								</div>
							)
						}
						<div onClick={this._handleNoThanksClick} className="PlusPromoModal__text-link">
							{t('no_thanks_turn_promos_off')}
						</div>
					</div>
				</div>
			</Modal>
		);
	}

	_renderPlusPromoModal = () => {
		const { plusPromoModalShown } = this.state;
		const { account, haveSeenInitialPlusPromo, isTimeForAPlusPromo } = this.props;

		// The business logic that controls how often promo modals should be shown lives in src/classes/PromoModals
		if (plusPromoModalShown || !isTimeForAPlusPromo) return null;

		// Check account status
		const signedIn = account && account.user;
		const plusSubscriber = signedIn && account.user.subscriptionsPlus;
		const insightsSubscriber = signedIn && account.user.scopes && account.user.scopes.includes('subscriptions:insights');

		if (plusSubscriber || insightsSubscriber) return null;

		if (haveSeenInitialPlusPromo) { return this._renderPlusPromoUpgradeModal(signedIn); }

		return (
			<PlusPromoModal
				show
				location="panel"
				clickHandler={this._handlePlusPromoModalClicks}
			/>
		);
	}

	_renderInsightsPromoModal = () => {
		const { account, isTimeForInsightsPromo, isInsightsModalHidden } = this.props;
		const { insightsPromoModalShown } = this.state;

		if (isInsightsModalHidden) return null;
		if (insightsPromoModalShown || !isTimeForInsightsPromo) return null;
		if (account && account.user && account.user.scopes && account.user.scopes.includes('subscriptions:insights')) return null;

		sendMessage('promoModals.sawInsightsPromo', '', 'metrics');

		return (
			<InsightsPromoModal />
		);
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
				{this._renderPlusPromoModal()}
				{this._renderInsightsPromoModal()}
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
