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

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
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

		// Event Bindings
		this.clickSimpleTab = this.clickSimpleTab.bind(this);
		this.clickDetailedTab = this.clickDetailedTab.bind(this);
		this.toggleExpert = this.toggleExpert.bind(this);
		this.toggleDropdown = this.toggleDropdown.bind(this);
		this.clickSignInVerify = this.clickSignInVerify.bind(this);
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

	/**
	 * Handles clicking the sign-in / verify link
	 */
	clickSignInVerify() {
		if (!this.props.logged_in) {
			sendMessage('ping', 'sign_in');
			this.props.history.push('/login');
		} else if (!this.props.is_validated) {
			sendMessageInPromise('sendVerificationEmail').then((data) => {
				this.props.actions.showNotification({
					classes: 'success',
					text: t('panel_email_verification_sent', data.email),
				});
			}).catch((err) => {
				log('sendVerificationEmail Error', err);
			});
		}
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
								<div onClick={this.clickSignInVerify} className="header-helper-text">
									{ !this.props.logged_in ? t('panel_header_sign_in') : (!this.props.is_validated ? t('panel_header_verify_account') : '') }
								</div>
							</div>
							<div
								className="header-kebab shrink columns"
								onClick={this.toggleDropdown}
								ref={(node) => { this.kebab = node; }}
							/>
						</div>
						{ this.state.dropdownOpen &&
							<HeaderMenu
								logged_in={this.props.logged_in}
								email={this.props.email}
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
