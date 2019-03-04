/**
 * Panel Component
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
import Header from '../containers/HeaderContainer';
import { sendMessage } from '../utils/msg';
import { setTheme } from '../utils/utils';

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

		this.dataInitialized = false;
	}
	/**
	 * Lifecycle event
	 */
	componentDidMount() {
		sendMessage('ping', 'engaged');

		this.uiPort = chrome.runtime.connect({ name: 'panelUIPort' });
		this.uiPort.onMessage.addListener((msg) => {
			if (!this.dataInitialized) {
				this.dataInitialized = true;

				const { panel, summary, blocking } = msg;

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
			} else {
				this.props.actions.updatePanelData(msg);
			}
		});
	}

	/**
	 * Lifecycle event
	 */
	componentWillUnmount() {
		this.uiPort.disconnect();
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
	 * Reload the current tab
	 * @param  {Object} event
	 * @todo  Why do we need explicit argument here?
	 */
	clickReloadBanner() {
		sendMessage('reloadTab', { tab_id: +this.props.tab_id });
		window.close();
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
		} else if (needsReload) {
			return (
				<span>
					<span key="0">{t('panel_needs_reload')}</span>
					<span key="1" className="needs-reload-link" onClick={this.clickReloadBanner}>{ t('alert_reload') }</span>
				</span>
			);
		} else if (this.props.notificationFilter === 'slow') {
			return (
				<span>
					<span key="0" className="filter-link slow-insecure" onClick={this.filterTrackers} dangerouslySetInnerHTML={{ __html: this.props.notificationText }} />
					<span key="1">{ t('panel_tracker_slow_non_secure_end') }</span>
				</span>
			);
		} else if (this.props.notificationFilter === 'compatibility') {
			return (
				<span>
					<span key="0" className="filter-link compatibility" onClick={this.filterTrackers} dangerouslySetInnerHTML={{ __html: this.props.notificationText }} />
					<span key="1">{ t('panel_tracker_breaking_page_end') }</span>
				</span>
			);
		}

		return (
			<span dangerouslySetInnerHTML={{ __html: this.props.notificationText }} />
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

		return (
			<div id="panel">
				<div className="callout-container">
					<div className={`${(!this.props.notificationShown ? 'hide ' : '') + this.props.notificationClasses} callout`}>
						<svg onClick={this.closeNotification} width="15px" height="15px" viewBox="0 0 15 15" className="close-button">
							<g>
								<path strokeWidth="3" strokeLinecap="round" d="M3,3 L12,12 M3,12 L12,3" />
							</g>
						</svg>
						<span className="callout-text" >
							{this.renderNotification()}
						</span>
					</div>
				</div>
				<Header />
				{ this.props.children }
			</div>
		);
	}
}

export default Panel;
