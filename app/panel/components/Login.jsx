/**
 * Login Component
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
import { validateEmail, validatePassword } from '../utils/utils';
import { log } from '../../../src/utils/common';
/**
 * @class Implement Sign In view which opens from 'Sign In' CTA on the Header.
 * We use Login and Sign in interchangeable. They mean the same thing.
 * @memberof PanelClasses
 */
class Login extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			email: '',
			emailError: false,
			password: '',
			passwordError: false,
			buttonCursor: 'pointer',
			panelCursor: 'default',
		};

		// event bindings
		this.showSigninResult = this.showSigninResult.bind(this);
		this.checkForEnter = this.checkForEnter.bind(this);
		this.updateEmail = this.updateEmail.bind(this);
		this.updatePassword = this.updatePassword.bind(this);
	}
	/**
	 * Lifecycle event
	 */
	componentWillUpdate(nextProps, nextState) {
		// redirect to summary view on successful login
		if (nextProps.loginSuccess) {
			nextProps.history.push(this.props.is_expert ? '/detail/blocking' : '/');
		} else if (nextProps.loginFailed && (this.state.panelCursor !== 'default' || this.state.buttonCursor !== 'pointer')) {
			this.setCursorDefaults();
		}
	}
	/**
	 * Update state with selective defaults for cursors.
	 */
	setCursorDefaults() {
		this.setState({ panelCursor: 'default', buttonCursor: 'pointer' });
	}
	/**
	 * Update state with changed email.
	 * @param {Object}  event 	'change' event
	 */
	updateEmail(event) {
		this.setState({ email: event.target.value });
	}
	/**
	 * Update state with changed password.
	 * @param {Object}  event 	'change' event
	 */
	updatePassword(event) {
		this.setState({ password: event.target.value });
	}
	/**
	 * Validate entered login data and, if it is good, trigger Login action.
	 */
	showSigninResult() {
		const email = this.state.email.toLowerCase();
		const { password } = this.state;

		// update cursors
		this.setState({ panelCursor: 'wait' });
		this.setState({ buttonCursor: 'wait' });

		// validate the email and password
		if (!validateEmail(email)) {
			this.setState({ emailError: true, panelCursor: 'default', buttonCursor: 'pointer' });
			return;
		} else if (!validatePassword(password)) {
			this.setState({ passwordError: true, panelCursor: 'default', buttonCursor: 'pointer' });
			return;
		}

		this.props.actions.login(email, password)
			.then((success) => {
				if (success) {
					Promise.all([
						this.props.actions.getUser(),
						this.props.actions.getUserSettings(),
					]);
				}
			})
			.catch(err => log(err));
	}
	/**
	 * Intercept Return key and call showSigninResult.
	 * @param  {Object} e 	keyboard event
	 */
	checkForEnter(e) {
		if (e.key === 'Enter') {
			this.showSigninResult();
		}
	}
	/**
	 * Render Sign In view.
	 * @return {ReactComponent}   ReactComponent instance
	 */
	render() {
		return (
			<div id="signin-panel" style={{ cursor: this.state.panelCursor }}>
				<div className="row align-center">
					<div className="small-11 medium-8 columns">
						<div id="login-email" className={(this.state.emailError ? 'panel-error' : '')}>
							<label htmlFor="login-input-email">
								{ t('email_field_label') }<span className="asterisk">*</span>
								<input onChange={this.updateEmail} onKeyPress={this.checkForEnter} value={this.state.email} id="login-input-email" name="email" pattern=".{1,}" autoComplete="off" type="text" />
							</label>
							<p className="warning">{ t('invalid_email_login') }</p>
						</div>
						<div id="login-password" className={(this.state.passwordError ? 'panel-error' : '')}>
							<label htmlFor="login-input-password">
								{ t('password_field_label') }<span className="asterisk">*</span>
								<input onChange={this.updatePassword} onKeyPress={this.checkForEnter} value={this.state.password} id="login-input-password" name="password" pattern=".{1,}" type="password" />
							</label>
							<p className="warning">{ t('password_field_label_required') }</p>
						</div>
						<div className="account-signin-buttons-container row">
							<div className="small-6 columns text-center">
								<Link to={(this.props.is_expert ? '/detail' : '/')} className="cancel button hollow">
									{ t('button_cancel') }
								</Link>
							</div>
							<div className="small-6 columns text-center">
								<div onClick={this.showSigninResult} id="signin-button" className="button" style={{ cursor: this.state.buttonCursor }}>
									{ t('panel_menu_signin') }
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="account-panel-action row align-center">
					<div className="small-11 medium-8 columns">
						<div className="row">
							<div className="small-6 columns text-center">
								<Link to="/forgot-password">{ t('panel_forgot_password') }</Link>
							</div>
							<div className="small-6 columns text-center">
								<Link to="/create-account">{ t('panel_create_account') }</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default Login;
