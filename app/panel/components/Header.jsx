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
import { Link } from 'react-router-dom';
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

		// Event Bindings
		this.clickSimpleTab = this.clickSimpleTab.bind(this);
		this.clickDetailedTab = this.clickDetailedTab.bind(this);
		this.toggleExpert = this.toggleExpert.bind(this);
		this.toggleDropdown = this.toggleDropdown.bind(this);
	}

	/**
	 * Handles clicking on the Simple View tab
	 */
	clickSimpleTab() {
		if (this.props.is_expert) {
			this.toggleExpert();
		}
	}

	/**
	 * Handles clicking on the Detailed View tab
	 */
	clickDetailedTab() {
		if (!this.props.is_expert) {
			this.toggleExpert();
		}
	}

	/**
	 * Toggle between Simple and Detailed Views.
	 */
	toggleExpert() {
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
	toggleDropdown() {
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

		let accountIcon;
		if (!loggedIn || loggedIn && user && !user.emailValidated) {
			accountIcon = (
				<div className="g-tooltip">
					<svg width="26" height="40" viewBox="5 0 26 16">
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
					<Tooltip header={text} position="bottom" />
				</div>
			);
		}

		return (
			<div onClick={handleOnClick} className="header-helper-text">
				{accountIcon}
			</div>
		);
	}

	/**
	* React's required render function. Returns JSX
	* @return {JSX} JSX for rendering the Header Component of the panel
	*/
	render() {
		const { pathname } = this.props.location;
		const showTabs = pathname === '/' || pathname.startsWith('/detail');
		const headerLogoClasses = ClassNames('header-logo', {
			'show-back-arrow': (pathname !== '/' && !pathname.startsWith('/detail')),
		});
		const tabSimpleClassNames = ClassNames('header-tab', {
			active: !this.props.is_expert,
		});
		const tabDetailedClassNames = ClassNames('header-tab', {
			active: this.props.is_expert,
		});
		const { loggedIn, user } = this.props;
		const rightLink = this.generateLink();

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
					<div className="top-bar-left">
						<Link to={(this.props.is_expert ? '/detail/blocking' : '/')} className={headerLogoClasses} >
							<img className="back-arrow" src="/app/images/panel/back_arrow_icon.png" />
						</Link>
					</div>
					<div className="top-bar-right">
						<div className="row align-middle collapse">
							<div className="columns shrink">
								{rightLink}
							</div>
							<div
								className="header-kebab shrink columns"
								onClick={this.toggleDropdown}
								ref={(node) => { this.kebab = node; }}
							/>
						</div>
						{ this.state.dropdownOpen &&
							<HeaderMenu
								loggedIn={loggedIn}
								email={user && user.email}
								language={this.props.language}
								tab_id={this.props.tab_id}
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
