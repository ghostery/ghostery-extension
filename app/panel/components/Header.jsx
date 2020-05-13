/**
 * Header Component
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
import { Link } from 'react-router-dom';
import { ReactSVG } from 'react-svg';
import ClassNames from 'classnames';
import Tooltip from './Tooltip';
import HeaderMenu from './HeaderMenu';
import { sendMessage, sendMessageInPromise } from '../utils/msg';
import { log } from '../../../src/utils/common';
/**
 * @class Implements header component which is common to all panel views
 * @memberof PanelClasses
 */
class Header extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			dropdownOpen: false,
		};
	}

	/**
	 * Handles clicking on the Simple View tab
	 */
	clickSimpleTab = () => {
		if (this.props.is_expert) {
			this.toggleExpert();
		}
	}

	/**
	 * Handles clicking on the Detailed View tab
	 */
	clickDetailedTab = () => {
		if (!this.props.is_expert) {
			this.toggleExpert();
		}
	}

	/**
	 * Toggle between Simple and Detailed Views.
	 */
	toggleExpert = () => {
		this.props.actions.toggleExpert();
		if (this.props.is_expert) {
			this.props.history.push('/');
		} else {
			this.props.history.push('/detail');
		}
	}

	/**
	 * Handles toggling the drop-down pane open/closed
	 */
	toggleDropdown = () => {
		this.setState({ dropdownOpen: !this.state.dropdownOpen });
	}

	handleSignin = () => {
		this.props.history.push('/login');
	}

	handleSendValidateAccountEmail = () => {
		const { user } = this.props;
		sendMessageInPromise('account.sendValidateAccountEmail').then((success) => {
			if (success) {
				this.props.actions.showNotification({
					classes: 'success',
					text: t('panel_email_verification_sent', user && user.email),
				});
			} else {
				this.props.actions.showNotification({
					classes: 'alert',
					text: t('server_error_message'),
				});
			}
		}).catch((err) => {
			log('sendVerificationEmail Error', err);
			this.props.actions.showNotification({
				classes: 'alert',
				text: t('server_error_message'),
			});
		});
	}

	generateAccountLogo = () => {
		const { loggedIn, user } = this.props;

		let text = '';
		let handleOnClick = null;
		if (!loggedIn) {
			text = t('sign_in');
			handleOnClick = this.handleSignin;
		} else if (loggedIn && user && !user.emailValidated) {
			text = t('panel_header_verify_account');
			handleOnClick = this.handleSendValidateAccountEmail;
		}

		let accountIcon;
		if (!loggedIn || loggedIn && user && !user.emailValidated) {
			accountIcon = (
				<div className="g-tooltip">
					<svg className="profile-svg" width="26" height="40" viewBox="0 0 26 16">
						<g fill="none" fillRule="nonzero">
							<g fill="#ffffff" stroke="#ffffff" strokeWidth=".5">
								<path d="M16 5.519a2.788 2.788 0 0 1 2.772 2.772A2.788 2.788 0 0 1 16 11.063a2.788 2.788 0 0 1-2.772-2.772A2.788 2.788 0 0 1 16 5.52zm0 .911c-1.025 0-1.86.836-1.86 1.861s.835 1.86 1.86 1.86c1.025 0 1.86-.835 1.86-1.86 0-1.025-.835-1.86-1.86-1.86z" />
								<path d="M16 1c4.975 0 9 4.025 9 9s-4.025 9-9 9-9-4.025-9-9 4.025-9 9-9zm0 10.367c2.734 0 5.013 2.013 5.43 4.595A8.035 8.035 0 0 0 24.09 10c0-4.481-3.646-8.089-8.089-8.089A8.071 8.071 0 0 0 7.911 10a8.141 8.141 0 0 0 2.62 5.962c.456-2.582 2.735-4.595 5.469-4.595zm4.595 5.279A4.593 4.593 0 0 0 16 12.278c-2.468 0-4.481 1.937-4.633 4.368A8.167 8.167 0 0 0 16 18.089a7.957 7.957 0 0 0 4.595-1.443z" />
							</g>
							{loggedIn && (
								<path fill="#FFC063" d="M6 10a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm0 9.927a.873.873 0 1 1 0-1.745.873.873 0 0 1 0 1.745zm.947-6.746l-.336 3.953a.61.61 0 0 1-1.222 0l-.336-3.953a.96.96 0 1 1 1.895 0z" />
							)}
						</g>
					</svg>
					<Tooltip header={text} position="bottom-left" />
				</div>
			);
		}

		return (
			<div onClick={handleOnClick} className="header-helper-text">
				{accountIcon}
			</div>
		);
	}

	determineBackPath = () => {
		const { entries, location } = this.props.history;
		const subscriptionRegEx = /^(\/subscription)/;
		if (location.pathname === '/stats' && (entries.length > 1 &&
		subscriptionRegEx.test(entries[entries.length - 2].pathname))) {
			return 'subscription/info';
		}
		return this.props.is_expert ? '/detail/blocking' : '/';
	}

	clickUpgradeBannerOrSubscriberBadgeIcon = () => {
		// TODO check whether this is the message we want to be sending now
		sendMessage('ping', 'plus_panel_from_badge');
		const { user } = this.props;
		const hasPlusAccess = user && user.plusAccess;
		const hasPremiumAccess = user && user.premiumAccess;
		this.props.history.push(hasPlusAccess || hasPremiumAccess ? '/subscription/info' : `/subscribe/${!!user}`);
	}

	/**
	* React's required render function. Returns JSX
	* @return {JSX} JSX for rendering the Header Component of the panel
	*/
	render() {
		const {
			is_expanded,
			is_expert,
			location,
			loggedIn,
			user,
		} = this.props;
		const { pathname } = location;
		const showTabs = pathname === '/' || pathname.startsWith('/detail');
		const headerArrowClasses = ClassNames('back-arrow', {
			'show-back-arrow': (pathname !== '/' && !pathname.startsWith('/detail')),
		});
		const tabSimpleClassNames = ClassNames('header-tab', {
			active: !is_expert,
		});
		const tabDetailedClassNames = ClassNames('header-tab', {
			active: is_expert,
		});
		const hasPlusAccess = user && user.subscription === 'plus';
		const hasPremiumAccess = user && user.subscription === 'premium';
		const accountLogolink = this.generateAccountLogo();
		const badgeClasses = ClassNames('columns', 'shrink', {
			'non-subscriber-badge': !(hasPlusAccess || hasPremiumAccess),
			'subscriber-badge': hasPlusAccess || hasPremiumAccess
		});

		const simpleTab = (
			<div className={tabSimpleClassNames} onClick={this.clickSimpleTab}>
				<span className="header-tab-text">
					{t('simple_view')}
				</span>
			</div>
		);

		const detailedTab = (
			<div className={tabDetailedClassNames} onClick={this.clickDetailedTab}>
				<span className="header-tab-text">
					{t('detailed_view')}
				</span>
			</div>
		);

		const tabs = (
			<div className="header-tab-group flex-container align-bottom">
				{simpleTab}
				{detailedTab}
			</div>
		);

		const backArrowAndGhostieLogo = (
			<span className="header-logo">
				<Link to={this.determineBackPath()}>
					<ReactSVG src="/app/images/panel/header-back-arrow.svg" className={headerArrowClasses} />
				</Link>
				<ReactSVG src="/app/images/panel/header-logo-icon.svg" className="logo-icon" />
			</span>
		);

		const plusUpgradeBannerOrSubscriberBadgeLogolink = (
			<div className={badgeClasses} onClick={this.clickUpgradeBannerOrSubscriberBadgeIcon}>
				{
					((hasPremiumAccess) && <ReactSVG src="/app/images/panel/premium-badge-icon-expanded-view.svg" />)
					|| ((hasPlusAccess) && <ReactSVG src="/app/images/panel/plus-badge-icon-expanded-view.svg" />)
					|| <ReactSVG src="/app/images/panel/green-upgrade-banner-expanded-view.svg" />
				}
			</div>
		);

		const headerMenuKebab = (
			<div className="header-kebab shrink columns" onClick={this.toggleDropdown} ref={(node) => { this.kebab = node; }}>
				<svg width="4" height="16" viewBox="0 0 4 16">
					<g fill="#FFF" fillRule="evenodd">
						<path d="M0 0h4v4H0zM0 6h4v4H0zM0 12h4v4H0z" />
					</g>
				</svg>
			</div>
		);

		const headerMenu = (
			<HeaderMenu
				loggedIn={loggedIn}
				subscription={user && user.subscription}
				hasPremiumAccess={hasPremiumAccess}
				hasPlusAccess={hasPlusAccess}
				email={user && user.email}
				language={this.props.language}
				tab_id={this.props.tab_id}
				location={location}
				history={this.props.history}
				actions={this.props.actions}
				toggleDropdown={this.toggleDropdown}
				kebab={this.kebab}
			/>
		);

		return (
			<header id="ghostery-header">
				{ showTabs && tabs }
				<div className="top-bar">
					{ backArrowAndGhostieLogo }
					<div>
						<div className="row align-middle collapse">
							<div className="columns shrink">
								{accountLogolink}
							</div>
							{((is_expert && is_expanded) || !showTabs) && plusUpgradeBannerOrSubscriberBadgeLogolink }
							{headerMenuKebab}
						</div>
						{ this.state.dropdownOpen && headerMenu }
					</div>
				</div>
			</header>
		);
	}
}

export default Header;
