/**
 * Login Component
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
import ClassNames from 'classnames';
import RSVP from 'rsvp';
import { validateEmail } from '../utils/utils';
import { log } from '../../../src/utils/common';
import history from '../utils/history';

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
		const emailIsValid = email && validateEmail(email);

		this.setState({
			emailError: !emailIsValid,
			passwordError: !password,
		});
		if (!emailIsValid || !password) { return; }

		this.setState({ loading: true }, () => {
			this.props.actions.login(email, password)
				.then((success) => {
					if (success) {
						RSVP.all([
							this.props.actions.getUser(),
							this.props.actions.getUserSettings(),
						])
							.then((res) => {
								const { current_theme = 'default' } = res[1];
								return this.props.actions.getTheme(current_theme);
							})
							.finally(() => {
								this.setState({ loading: false }, () => {
									history.push({
										pathname: this.props.is_expert ? '/detail/blocking' : '/',
										state: { showInsightsPromoModal: true }
									});
								});
							});
					} else {
						this.setState({ loading: false });
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
		const buttonClasses = ClassNames('button ghostery-button', { loading });
		return (
			<div id="signin-panel">
				<div className="row align-center">
					<div className="small-11 medium-8 columns">
						<form onSubmit={this.handleSubmit}>
							<div id="login-email" className={(emailError ? 'panel-error' : '')}>
								<label htmlFor="login-input-email">
									{ t('email_colon') }
									<span className="asterisk">*</span>
									<input onChange={this.handleInputChange} value={email} id="login-input-email" name="email" pattern=".{1,}" autoComplete="off" type="text" />
								</label>
								<p className="warning">{ t('invalid_email_login') }</p>
							</div>
							<div id="login-password" className={(passwordError ? 'panel-error' : '')}>
								<label htmlFor="login-input-password">
									{ t('password_field_label') }
									<span className="asterisk">*</span>
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
									<button type="submit" id="signin-button" className={buttonClasses}>
										<span className="title">{ t('sign_in') }</span>
										<span className="loader" />
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
								<Link to="/create-account">{ t('create_account') }</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default Login;
