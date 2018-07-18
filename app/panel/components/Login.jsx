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
			password: '',
			loading: false,
			emailError: false,
			passwordError: false,
		};
	}

	/**
	 * Update state with changed values.
	 * @param {Object}  event 	'change' event
	 */
	handleInputChange = (e) => {
		const { name, value } = e.target;
		this.setState({ [name]: value });
	}

	/**
	 * Validate entered login data and, if it is good, trigger Login action.
	 */
	handleSubmit = (e) => {
		e.preventDefault();
		const { email, password } = this.state;

		this.setState({ loading: true }, () => {
			if (!validateEmail(email)) {
				this.setState({
					emailError: true,
					loading: false,
				});
				return;
			}
			if (!validatePassword(password)) {
				this.setState({
					passwordError: true,
					loading: false,
				});
				return;
			}
			this.props.actions.login(email.toLowerCase(), password)
				.then((success) => {
					if (success) {
						Promise.all([
							this.props.actions.getUser(),
							this.props.actions.getUserSettings(),
						]).finally(() => {
							this.props.history.push(this.props.is_expert ? '/detail/blocking' : '/');
						});
					}
				})
				.catch(err => log(err));
		});
	}

	/**
	 * Render Sign In view.
	 * @return {ReactComponent}   ReactComponent instance
	 */
	render() {
		const {
			email, password, emailError, passwordError, loading
		} = this.state;
		return (
			<div id="signin-panel" className={loading ? 'loading' : ''}>
				<div className="row align-center">
					<div className="small-11 medium-8 columns">
						<form onSubmit={this.handleSubmit}>
							<div id="login-email" className={(emailError ? 'panel-error' : '')}>
								<label htmlFor="login-input-email">
									{ t('email_field_label') }<span className="asterisk">*</span>
									<input onChange={this.handleInputChange} value={email} id="login-input-email" name="email" pattern=".{1,}" autoComplete="off" type="text" />
								</label>
								<p className="warning">{ t('invalid_email_login') }</p>
							</div>
							<div id="login-password" className={(passwordError ? 'panel-error' : '')}>
								<label htmlFor="login-input-password">
									{ t('password_field_label') }<span className="asterisk">*</span>
									<input onChange={this.handleInputChange} value={password} id="login-input-password" name="password" pattern=".{1,}" type="password" />
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
									<button type="submit" id="signin-button" className="button">
										{ t('panel_menu_signin') }
									</button>
								</div>
							</div>
						</form>
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
