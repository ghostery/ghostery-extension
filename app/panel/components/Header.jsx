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
import { sendMessage } from '../utils/msg';
import { log } from '../../../src/utils/common';
/**
 * @class Implement header component which is common to all panel views
 * @memberof PanelClasses
 */
class Header extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			dropdownOpen: false,
		};

		// event bindings
		this.toggleDropdown = this.toggleDropdown.bind(this);
		this.getKebab = this.getKebab.bind(this);
		this.clickSignInVerify = this.clickSignInVerify.bind(this);
	}
	/**
	 * Initialize kebab menu icon with refrence to DOM elementiption]
	 * @param  {Object} ref React reference attribute of the menu icon
	 */
	getKebab(ref) {
		this.kebab = ref;
	}
	/**
	 * Toggle drop-down pane with menu items
	 */
	toggleDropdown() {
		this.setState({ dropdownOpen: !this.state.dropdownOpen });
	}
	/**
	 * Click the sign in / verify link in the header
	 */
	clickSignInVerify() {
		if (!this.props.logged_in) {
			sendMessage('ping', 'sign_in');
			this.props.history.push('/login');
		} else if (!this.props.is_validated) {
			sendMessage('sendVerificationEmail').then((data) => {
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
	 * Render header.
	 * @return {ReactComponent}   ReactComponent instance
	 */
	render() {
		const { pathname } = this.props.location;
		const headerLogoClasses = ClassNames('header-logo', {
			'show-back-arrow': (pathname !== '/' && !pathname.startsWith('/detail')),
		});
		return (false &&
			<header id="ghostery-header">
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
							<div className="header-kebab shrink columns" ref={this.getKebab} onClick={this.toggleDropdown} />
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
