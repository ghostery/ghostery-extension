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
					<svg width="26" height="40" viewBox="0 0 26 16">
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

	clickLogo = () => {
		this.props.history.push(this.props.is_expert ? '/detail/blocking' : '/');
	}

	clickBadge = () => {
		sendMessage('ping', 'supporter_panel_from_badge');
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
								<svg width="33" height="30" viewBox="0 0 84 77">
									<g fill="none">
										<path d="M79.858 74.75L43.1 57.9c-.579-.315-1.447-.315-2.026 0L4.604 74.75c-.867.472-2.604 0-2.604-.63V2.786C2 2.315 2.579 2 3.447 2h76.99c.868 0 1.447.315 1.447.787V74.12c.58.63-1.157 1.103-2.026.63z" />
										<path className="text" d="M47.156 37.256c-1.186 1.592-2.981 3.32-4.879 3.184-2.405-.169-2.473-2.676-1.728-4.912.746-2.237 2.474-5.557 4.676-8.64.271-.373.61-.34.88-.034.746 1.118.577 2.642-.643 4.574-1.254 1.999-1.931 3.354-2.643 4.98-.711 1.66-.61 2.88.17 2.948 1.321.102 3.185-2.27 5.014-5.218 2.135-3.456 3.117-5.794 4.202-7.25.339-.475.576-.543.847-.204.508.61.78 2.1-.034 3.795-.746 1.525-2.44 4.066-3.219 5.794-.88 1.931-.745 3.354.474 3.287 1.423-.068 3.151-2.304 4.473-4.676.17-.305.474-.34.61-.034.135.27.17 1.186-.305 2.134-.983 1.898-3.083 3.626-5.083 3.626-2.202 0-3.083-1.39-2.812-3.354z M25.98 22.754c-1.152-.136-1.796-.712-2.135-1.423-.17-.373-.101-.576.339-.61 2.812-.305 5.353-1.728 7.657-1.83 1.728-.067 3.22.475 4.032 2.813.712 2.032.136 3.998-1.016 5.793-1.694 2.643-5.353 5.184-9.792 6.031-.78.136-1.525 0-2.1-.338-.95 1.863-1.966 4.1-3.152 6.912-.135.338-.305.338-.542.101-.474-.508-.813-1.524-.305-3.354.881-3.083 4.066-9.453 7.014-14.095zm-2.033 8.538c7.59-1.423 11.384-6.912 10.47-9.284-.712-1.863-4.1-.101-6.337.543 0 .914-.338 2.1-1.287 3.727-.881 1.558-1.83 3.117-2.846 5.014zm12.773 1.932c-1.355 3.32-1.728 6.132-.203 6.268 1.627.135 3.998-2.304 5.32-4.913.237-.44.61-.475.745 0 .17.542.034 1.287-.339 2.1-.474 1.017-2.947 3.83-5.658 3.761-2.338-.067-3.592-1.694-2.812-5.353 1.253-5.895 5.116-12.028 8.572-15.62.508-.542.983-.61 1.457-.17.982.882 1.186 2.135.78 3.728-1.051 4.167-4.846 8.233-7.862 10.199zm.61-1.457c4.642-3.761 6.54-9.183 6.1-9.454-.441-.27-2.949 3.49-5.286 7.827a18.192 18.192 0 0 0-.814 1.627zm18.06 2.676c1.389-1.897 2.914-4.1 3.896-5.827.17-1.322.508-1.966 1.22-2.61.745-.677 1.525-.813 1.83-.508.338.34.169.712-.272 1.491-.135.203-.237.407-.372.644-.237 3.117.406 5.76.305 8.098-.068 1.321-.305 2.744-1.525 3.557 2.27-.847 3.693-2.88 4.54-4.71.17-.372.508-.27.644 0 .136.306.102 1.187-.474 2.237a7.139 7.139 0 0 1-5.998 3.727c-1.965.068-3.862-.44-5.014-2.541-.813-1.525-.712-3.761.44-4.71.407-.339.678-.203.712.34.034.27.034.541.068.812zm3.828-3.659c-.982 1.796-2.236 3.66-3.523 5.489.508 1.965 1.49 3.354 2.609 3.015 1.558-.474 1.05-5.793.914-8.504z" />
									</g>
								</svg>
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
