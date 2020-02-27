/**
 * Trust/Restrict Settings Component
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
import Sites from './Sites';
/**
 * @class Implement Trust and Restrict subview presenting the lists
 * of whitelisted and blacklisted sites.
 * @memberOf SettingsComponents
 */
class TrustAndRestrict extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			menu: {
				showTrustedSites: true,
				showRestrictedSites: false,
			},
			trustedValue: '',
			restrictedValue: '',
			currentWarning: '',
		};
		// event bindings
		this.setActivePane = this.setActivePane.bind(this);
		this.updateValue = this.updateValue.bind(this);
		this.addSite = this.addSite.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	/**
	 * Implement switch between two tabs (whitelisted and blacklisted) on the view
	 * @param {Object} event 	mouseclick on a tab
	 */
	setActivePane(event) {
		this.showWarning('');
		const newMenuState = Object.assign({}, this.state.menu);
		Object.keys(newMenuState).forEach((key) => {
			if (key === event.currentTarget.id) {
				newMenuState[key] = true;
			} else {
				newMenuState[key] = false;
			}
		});
		this.setState({ menu: newMenuState });
	}

	/**
	 * Save updated value in state as user types site url in the input box.
	 * @param  {Object} event input box 'change' event
	 */
	updateValue(event) {
		if (this.state.currentWarning) {
			this.showWarning('');
		}
		if (this.state.menu.showTrustedSites) {
			this.setState({
				trustedValue: event.currentTarget.value,
			});
		} else {
			this.setState({
				restrictedValue: event.currentTarget.value,
			});
		}
	}

	/**
	 * Handle Return key by calling addSite.
	 * @param  {Object} event 		keyboard event
	 */
	handleSubmit(event) {
		if (event.keyCode === 13) {
			this.addSite();
		}
	}

	/**
	 * Implement adding site to the list of whitelisted or blacklisted sites
	 * This routine valides entered url and checks if the entered url is a duplicate, or
	 * if it has been alreday added to the opposite list. Displays appropriate warnings.
	 */
	addSite() {
		let pageHost;
		let list;
		let listType;
		let otherList;
		let duplicateWarning;
		let otherListWarning;
		let otherListType;

		if (this.state.menu.showTrustedSites) {
			listType = 'whitelist';
			pageHost = this.state.trustedValue;
			list = this.props.site_whitelist;
			duplicateWarning = t('whitelist_error_duplicate_url');
			otherList = this.props.site_blacklist;
			otherListType = 'blacklist';
			otherListWarning = t('whitelist_error_blacklist_url');
		} else {
			listType = 'blacklist';
			pageHost = this.state.restrictedValue;
			list = this.props.site_blacklist;
			duplicateWarning = t('blacklist_error_duplicate_url');
			otherList = this.props.site_whitelist;
			otherListType = 'whitelist';
			otherListWarning = t('blacklist_error_whitelist_url');
		}

		this.showWarning('');
		pageHost = pageHost.toLowerCase().replace(/^(http[s]?:\/\/)?(www\.)?/, '');

		// Check for Validity
		if (pageHost.length >= 2083
			|| !this.isValidUrlorWildcard(pageHost)) {
			this.showWarning(t('white_black_list_error_invalid_url'));
			return;
		}

		// Check for Duplicates
		if (list.includes(pageHost)) {
			this.showWarning(duplicateWarning);
			return;
		}

		// Remove from the other list
		if (otherList.includes(pageHost)) {
			this.showWarning(otherListWarning);
			this.props.actions.updateSitePolicy({ type: otherListType, pageHost });
		}
		this.props.actions.updateSitePolicy({ type: listType, pageHost });
		if (listType === 'whitelist') {
			this.setState({ trustedValue: '' });
		} else {
			this.setState({ restrictedValue: '' });
		}
	}

	isValidUrlorWildcard(pageHost) {
		// Only allow valid host name characters, ':' for port numbers and '*' for wildcards
		const isSafePageHost = /^[a-zA-Z1-9-.:*]*$/;
		if (!isSafePageHost.test(pageHost)) { return false; }

		// Check for valid URL from node-validator
		const isValidUrlRegex = /^(?!mailto:)(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))|localhost)(?::\d{2,5})?(?:\/[^\s]*)?$/i;
		if (isValidUrlRegex.test(pageHost)) return true;

		// Check for valid wildcard
		let isValidWildcard = false;
		if (pageHost.includes('*')) {
			const wildcardPattern = pageHost.replace(/\*/g, '.*');
			try {
				// eslint-disable-next-line
				new RegExp(wildcardPattern);
				isValidWildcard = true;
			} catch {
				return false;
			}
		}
		return isValidWildcard;
	}

	/**
	 * Save current warning in state.
	 * @param  {string} warning 	 warning to save
	 * @todo Change function name?
	 */
	showWarning(warning) {
		this.setState({ currentWarning: warning });
	}

	/**
	* Render Trust and Restrict subview.
	* @return {ReactComponent}   ReactComponent instance
	*/
	render() {
		const trusted_sites = this.props.site_whitelist;
		const restricted_sites = this.props.site_blacklist;
		return (
			<div className="s-trust-restrict-panel s-tabs-panel">
				<div className="row">
					<div className="columns">
						<h3>{ t('settings_trusted_restricted_sites') }</h3>
					</div>
				</div>
				<div className="s-trust-restrict-menu">
					<div className={`${this.state.menu.showTrustedSites ? 's-active-pane ' : ''}s-pane-title`} id="showTrustedSites" onClick={this.setActivePane}>
						<span>{t('settings_trusted_sites')}</span>
					</div>
					<div className={`${this.state.menu.showRestrictedSites ? 's-active-pane ' : ''}s-pane-title-next`} id="showRestrictedSites" onClick={this.setActivePane}>
						<span>{t('settings_restricted_sites')}</span>
					</div>
				</div>
				<div className={`${this.state.menu.showTrustedSites ? '' : 's-hide '}s-sites-pane`}>
					<div className="row">
						<div className="columns">
							<div className="s-sites-input-box">
								<input type="text" value={this.state.trustedValue} placeholder={t('settings_sites_placeholder')} onChange={this.updateValue} onKeyDown={this.handleSubmit} />
								<div className="s-sites-input-icon" onClick={this.addSite} />
							</div>
							<div className="s-site-description"><span>{ t('settings_trusted_sites_description') }</span></div>
							<div className={`${this.state.currentWarning ? '' : 's-invisible '}s-callout`}>{this.state.currentWarning}</div>
						</div>
					</div>
					{ trusted_sites && trusted_sites.length > 0 &&
						<Sites sites={trusted_sites} listType="whitelist" updateSitePolicy={this.props.actions.updateSitePolicy} />
					}
				</div>
				<div className={`${this.state.menu.showRestrictedSites ? '' : 's-hide '}s-sites-pane`}>
					<div className="row">
						<div className="columns">
							<div className="s-sites-input-box">
								<input type="text" value={this.state.restrictedValue} placeholder={t('settings_sites_placeholder')} onChange={this.updateValue} onKeyDown={this.handleSubmit} />
								<div className="s-sites-input-icon" onClick={this.addSite} />
							</div>
							<div className="s-site-description"><span>{ t('settings_restricted_sites_description') }</span></div>
							<div className={`${this.state.currentWarning ? '' : 's-invisible '}s-callout`}>{this.state.currentWarning}</div>
						</div>
					</div>
					{ restricted_sites && restricted_sites.length > 0 &&
						<Sites sites={restricted_sites} listType="blacklist" updateSitePolicy={this.props.actions.updateSitePolicy} />
					}
				</div>
			</div>
		);
	}
}

export default TrustAndRestrict;
