/**
 * Header Component
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
import ReactSVG from 'react-svg';
import ClassNames from 'classnames';
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
		sendMessage('ping', 'sign_in');
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

	generateLink = () => {
		const { loggedIn, user } = this.props;
		let text = '';
		let handleOnClick = null;
		if (!loggedIn) {
			text = t('panel_header_sign_in');
			handleOnClick = this.handleSignin;
		} else if (loggedIn && user && !user.emailValidated) {
			text = t('panel_header_verify_account');
			handleOnClick = this.handleSendValidateAccountEmail;
		}

		return (
			<div onClick={handleOnClick} className="header-helper-text">
				{text}
			</div>
		);
	}

	clickLogo = () => {
		this.props.history.push(this.props.is_expert ? '/detail/blocking' : '/');
	}

	clickBadge = () => {
		const subscriber = this.props.user && this.props.user.subscriptionsSupporter;
		this.props.history.push(subscriber ? '/subscription/info' : `/subscribe/${!!this.props.user}`);
	}

	/**
	* React's required render function. Returns JSX
	* @return {JSX} JSX for rendering the Header Component of the panel
	*/
	render() {
		const { pathname } = this.props.location;
		const showTabs = pathname === '/' || pathname.startsWith('/detail');
		const headerArrowClasses = ClassNames('back-arrow', {
			'show-back-arrow': (pathname !== '/' && !pathname.startsWith('/detail')),
		});
		const tabSimpleClassNames = ClassNames('header-tab', {
			active: !this.props.is_expert,
		});
		const tabDetailedClassNames = ClassNames('header-tab', {
			active: this.props.is_expert,
		});
		const { loggedIn, user } = this.props;
		const subscriber = this.props.user && this.props.user.subscriptionsSupporter;
		const rightLink = this.generateLink();
		const badgeClasses = ClassNames('columns', 'shrink', {
			'non-subscriber-badge': !subscriber,
			'subscriber-badge': subscriber
		});

		return (
			<header id="ghostery-header">
				{ showTabs && (
					<div className="header-tab-group flex-container align-bottom">
						<div className={tabSimpleClassNames} onClick={this.clickSimpleTab}>
							<span className="header-tab-text">
								{t('panel_header_simple_view')}
							</span>
						</div>
						<div className={tabDetailedClassNames} onClick={this.clickDetailedTab}>
							<span className="header-tab-text">
								{t('panel_header_detailed_view')}
							</span>
						</div>
					</div>
				)}
				<div className="top-bar">
					<span onClick={this.clickLogo} className="header-logo">
						<ReactSVG path="/app/images/panel/header-back-arrow.svg" className={headerArrowClasses} />
						<ReactSVG path="/app/images/panel/header-logo-icon.svg" className="logo-icon" />
					</span>
					<div>
						<div className="row align-middle collapse">
							<div className="columns shrink">
								{rightLink}
							</div>
							<div className={badgeClasses} onClick={this.clickBadge}>
								<ReactSVG path="/app/images/panel/subscriber-badge.svg" />
							</div>
							<div className="header-kebab shrink columns" onClick={this.toggleDropdown} ref={(node) => { this.kebab = node; }}>
								<svg width="4" height="16" viewBox="0 0 4 16">
									<g fill="#FFF" fillRule="evenodd">
										<path d="M0 0h4v4H0zM0 6h4v4H0zM0 12h4v4H0z" />
									</g>
								</svg>
							</div>
						</div>
						{ this.state.dropdownOpen &&
							<HeaderMenu
								loggedIn={loggedIn}
								subscriber={subscriber}
								email={user && user.email}
								language={this.props.language}
								tab_id={this.props.tab_id}
								location={this.props.location}
								history={this.props.history}
								actions={this.props.actions}
								toggleDropdown={this.toggleDropdown}
								kebab={this.kebab}
							/>
						}
					</div>
				</div>
			</header>
		);
	}
}

export default Header;
