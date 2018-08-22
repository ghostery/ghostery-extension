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
import { Link } from 'react-router-dom';
import ClassNames from 'classnames';
import HeaderMenu from './HeaderMenu';
import { sendMessage, sendMessageInPromise } from '../utils/msg';
import { log } from '../../../src/utils/common';
import { isSubscriber } from '../utils/utils';
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

		return (
			<div onClick={handleOnClick} className="header-helper-text">
				{text}
			</div>
		);
	}

	disableClickIf = (evt, pathToken) => {
		const { pathname } = this.props.location;
		if (pathname.includes(pathToken)) {
			evt.preventDefault();
			return true;
		}
		return false;
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
		const subscriber = isSubscriber(user);
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
					<div>
						<Link to={(this.props.is_expert ? '/detail/blocking' : '/')} className={headerLogoClasses} >
							<svg width="8px" height="13px" viewBox="0 0 8 13" className="back-arrow">
								<g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
									<g id="Priority-Support" transform="translate(-9.000000, -13.000000)" fill="#FFFFFF">
										<g id="Group" transform="translate(2.000000, -19.000000)">
											<path d="M9.97923761,38.216699 L14.8755284,33.3205611 C14.9585604,33.2375291 15,33.1419581 15,33.0340012 C15,32.9260443 14.9585604,32.8304733 14.8755284,32.7475942 L14.2525587,32.1246245 C14.1695267,32.0415925 14.0739557,32 13.9661517,32 C13.8581948,32 13.7626238,32.0415925 13.6795918,32.1246245 L7.87392431,37.9301391 C7.79089227,38.0131711 7.74945271,38.1087421 7.74945271,38.216699 C7.74945271,38.3246559 7.79089227,38.4202269 7.87392431,38.5032589 L13.6794389,44.3087735 C13.7624709,44.3919584 13.8580419,44.433398 13.9659988,44.433398 C14.0738028,44.433398 14.1693738,44.3919584 14.2524058,44.3087735 L14.8753755,43.6861097 C14.9584075,43.6030776 14.9998471,43.5075067 14.9998471,43.3993968 C14.9998471,43.2915928 14.9584075,43.1960218 14.8753755,43.1129898 L9.97923761,38.216699 L9.97923761,38.216699 Z" />
										</g>
									</g>
								</g>
							</svg>
							<svg width="75" height="22" viewBox="0 0 75 22">
								<g fill="none" fillRule="evenodd">
									<path d="M16.415 9.158c0 3.493-2.94 6.325-6.566 6.325-3.627 0-6.567-2.832-6.567-6.325 0-3.494 2.94-6.326 6.566-6.326 3.625 0 6.565 2.832 6.565 6.326" fill="#FFF" />
									<path d="M18.65 17.774c-.91-1.995-1.067-3.686-1.09-4.35V7.96C17.56 3.783 13.992.4 9.594.4 5.195.4 1.63 3.783 1.63 7.96v5.543c-.034.715-.213 2.354-1.087 4.27-1.176 2.578-.203 2.27.668 2.06.873-.212 2.818-1.04 3.426-.02.608 1.018 1.115 1.903 2.533 1.326s2.086-.77 2.29-.77h.274c.202 0 .87.193 2.29.77 1.418.576 1.925-.31 2.533-1.328.607-1.02 2.553-.19 3.424.02.873.212 1.845.52.67-2.058" fill="#FFF" />
									<path d="M7.136 4.52c.858 0 1.554 1.046 1.554 2.335 0 1.288-.696 2.333-1.554 2.333-.857 0-1.553-1.045-1.553-2.333 0-1.29.696-2.334 1.553-2.334M9.595 13.847c-1.89 0-3.482-1.765-3.96-3.73.925 1.208 2.354 1.985 3.96 1.985 1.605 0 3.035-.777 3.96-1.985-.48 1.965-2.07 3.73-3.96 3.73M12.053 9.188c-.858 0-1.553-1.045-1.553-2.333 0-1.29.695-2.334 1.553-2.334.86 0 1.553 1.046 1.553 2.335 0 1.288-.694 2.333-1.553 2.333" fill="#00AEF0" />
									<path d="M27.967 9.838h2.446v3.54c0 1.787-.89 2.808-2.605 2.808-1.716 0-2.605-1.02-2.605-2.807V7.572c0-1.787.89-2.807 2.605-2.807 1.715 0 2.605 1.02 2.605 2.807v1.085H28.76V7.46c0-.796-.348-1.1-.904-1.1-.557 0-.906.304-.906 1.1v6.03c0 .798.35 1.085.906 1.085s.905-.287.905-1.085v-2.057h-.793V9.838M33.462 15.938h-1.81V4.766h1.81v4.788h2.056V4.766h1.842v11.172h-1.842V11.15h-2.056v4.788M38.6 7.573c0-1.786.965-2.807 2.73-2.807 1.765 0 2.73 1.02 2.73 2.807v5.806c0 1.785-.965 2.806-2.73 2.806-1.765 0-2.73-1.02-2.73-2.807V7.572zm1.798 5.917c0 .798.36 1.1.932 1.1.572 0 .93-.302.93-1.1V7.46c0-.796-.358-1.1-.93-1.1-.572 0-.932.304-.932 1.1v6.03zM47.424 4.766c1.7 0 2.574 1.02 2.574 2.808v.35h-1.652v-.462c0-.798-.318-1.1-.875-1.1-.554 0-.872.302-.872 1.1 0 2.296 3.415 2.727 3.415 5.917 0 1.785-.89 2.806-2.605 2.806-1.715 0-2.605-1.02-2.605-2.807v-.687h1.652v.797c0 .798.35 1.085.906 1.085s.906-.287.906-1.085c0-2.297-3.415-2.727-3.415-5.916 0-1.787.874-2.808 2.574-2.808M50.51 4.766h5.458v1.597h-1.846v9.575h-1.766V6.363H50.51V4.766M58.78 9.474h2.497v1.596H58.78v3.27h3.142v1.598H56.96V4.766h4.962v1.596H58.78v3.112M66.585 15.938c-.095-.288-.16-.464-.16-1.373V12.81c0-1.038-.35-1.42-1.15-1.42h-.605v4.548h-1.755V4.766h2.65c1.82 0 2.6.846 2.6 2.57v.878c0 1.148-.366 1.9-1.148 2.265.877.366 1.165 1.212 1.165 2.377v1.724c0 .544.016.943.19 1.358h-1.787zM64.67 6.362v3.43h.687c.654 0 1.052-.286 1.052-1.18v-1.1c0-.8-.27-1.15-.893-1.15h-.847zM70.843 12.235l-2.222-7.47h1.84l1.343 5.092 1.342-5.09h1.68L72.6 12.234v3.703h-1.76v-3.703" fill="#FFF" />
								</g>
							</svg>
						</Link>
					</div>
					<div>
						<div className="row align-middle collapse">
							<div className="columns shrink">
								{rightLink}
							</div>
							<div className="columns shrink">
								<Link to={(loggedIn && subscriber) ? '/subscription/info' : '/subscribe'} className={(!loggedIn || !subscriber) ? 'non-subscriber-badge' : 'subscriber-badge'} onClick={evt => this.disableClickIf(evt, 'subscription')}>
									<ReactSVG path="/app/images/panel/subscriber-badge.svg" />
								</Link>
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
								disableClickIf={this.disableClickIf}
							/>
						}
					</div>
				</div>
			</header>
		);
	}
}

export default Header;
