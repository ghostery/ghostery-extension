/**
 * Log In View Component
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
import globals from '../../../../src/classes/Globals';

/**
 * @class Implement the #log-in part of the Setup flow.
 * Allows users to log in or to create an account.
 * @extends Component
 * @memberof SetupViews
 */
class LogInView extends Component {
	constructor(props) {
		super(props);
		this.state = {
			status: '', // 'new', 'login' or 'loggedin'
			email: '',
			confirmEmail: '',
			password: '',
			firstName: '',
			lastName: '',
			policy: true,
		};
	}

	/**
	* Lifecycle event
	*/
	componentWillMount() {
		this.props.actions.getLoginInfo().then((data) => {
			if (this.props.payload.ClaimEmailAddress) {
				this.setState({
					status: 'loggedin',
				});
				this.props.actions.updateNavigationNextButtons([
					{
						title: t('setup_button_next'),
						action: 'next',
					},
				]);
			} else {
				this.setState({
					status: 'new',
				});
				this.props.actions.updateNavigationNextButtons([
					{
						title: t('setup_button_skip'),
						action: 'next',
					}, {
						title: t('setup_button_create_account'),
						action: 'createAccount',
					},
				]);
			}
		});
		this.props.actions.updateTopContentData({
			image: '/app/images/setup/circles/cloud.svg',
			title: t('setup_login_view_title'),
		});
	}

	/**
	* Lifecycle event
	*/
	componentDidMount() {
		this.props.actions.setupStep({ key: 'setup_step', value: 4 });
	}

	/**
	* Lifecycle event
	*/
	componentWillReceiveProps(nextProps) {
		if (nextProps.triggerSignIn) {
			this._signIn();
		} else if (nextProps.triggerCreateAccount) {
			this._createAccount();
		}

		if (!nextProps.loading) {
			this.props.actions.hideLoading();
		} else {
			this.props.actions.showLoading();
		}

		if ((this.state.status === 'new' || this.state.status === 'login') && nextProps.success) {
			this.props.actions.navigationNext();
		}
		// TODO
		// if (nextProps.message !== this.props.message) {
		// 	window.alert(nextProps.message);
		// }
	}

	/**
	 * Handles the onSubmit property on the Sign In form
	 * @param  {Object} event
	 */
	_signIn = (event) => {
		if (event) { event.preventDefault(); }
		if (!this._validateSignIn()) {
			this.props.actions.loginFail();
			return;
		}

		this.props.actions.userLogin({
			EmailAddress: this.state.email,
			Password: this.state.password,
		});
		this.props.actions.showLoading();
	}


	/**
	 * Handles the onSubmit property on the Create Account form
	 * @param  {Object} event
	 */
	_createAccount = (event) => {
		if (event) { event.preventDefault(); }
		if (!this._validateCreateAccount()) {
			this.props.actions.createAccountFail();
			return;
		}

		const email = this.state.email.toLowerCase();
		const confirmEmail = this.state.confirmEmail.toLowerCase();
		const { firstName, lastName, password } = this.state;
		const VERIFICATION_URL = `https:\/\/signon.${globals.GHOSTERY_DOMAIN}.com/register/verify/`; // can't set culture query parameter because site needs to append guid
		const REDIRECT_URL = `https:\/\/account.${globals.GHOSTERY_DOMAIN}.com/`;

		this.props.actions.createAccount({
			EmailAddress: email,
			ConfirmEmailAddress: confirmEmail,
			Password: password,
			ModifyingUserId: email,
			FirstName: firstName,
			LastName: lastName,
			UserType: 2,
			KeepUpdatedOnProductReleases: true,
			ValidationRedirectUrlToAddCodeSuffixOn: VERIFICATION_URL,
			FooterUrl: VERIFICATION_URL,
			VerificationContinueUrl: REDIRECT_URL,
		});
		this.props.actions.showLoading();
	}

	/**
	 * Handles the onClick property to show the Create Account form
	 * @param  {Object} event
	 */
	_toggleSignIn = (event) => {
		event.preventDefault();
		const { status } = this.state;
		let title;
		let action;
		let nextStatus;

		if (status === 'new') {
			nextStatus = 'login';
		} else if (status === 'login') {
			nextStatus = 'new';
		}

		if (nextStatus === 'loggedin') {
			this.props.actions.updateNavigationNextButtons([
				{
					title: t('setup_button_next'),
					action: 'next',
				},
			]);
		} else {
			switch (nextStatus) {
				case 'new':
					title = t('setup_button_create_account');
					action = 'createAccount';
					break;
				case 'login':
					title = t('setup_button_sign_in');
					action = 'signIn';
					break;
				default:
					break;
			}
			this.props.actions.updateNavigationNextButtons([
				{
					title: t('setup_button_skip'),
					action: 'next',
				}, {
					title,
					action,
				},
			]);
		}

		if (typeof nextStatus !== 'undefined') {
			this.setState({
				status: nextStatus,
			});
		}
	}

	/**
	 * Validates the Sign In form
	 * @return {boolean} whether the form is valid
	 */
	_validateSignIn() {
		this.emailInput.focus();
		this.emailInput.blur();
		this.passwordInput.focus();
		this.passwordInput.blur();
		return (
			this._isValid({
				target: {
					name: 'email',
					value: this.state.email,
				},
			}) &&
			this._isValid({
				target: {
					name: 'password',
					value: this.state.password,
				},
			}) || false);
	}

	/**
	* Validates the Create Account form
	* @return {boolean} whether the form is valid
	*/
	_validateCreateAccount() {
		this.emailInput.focus();
		this.emailInput.blur();
		this.confirmEmailInput.focus();
		this.confirmEmailInput.blur();
		this.passwordInput.focus();
		this.passwordInput.blur();
		this.policyInput.focus();
		this.policyInput.blur();
		return (
			this._isValid({
				target: {
					name: 'email',
					value: this.state.email,
				},
			}) &&
			this._isValid({
				target: {
					name: 'confirmEmail',
					value: this.state.confirmEmail,
				},
			}) &&
			this._isValid({
				target: {
					name: 'password',
					value: this.state.password,
				},
			}) &&
			this._isValid({
				target: {
					name: 'policy',
					value: this.state.policy,
				},
			}) || false);
	}

	/**
	 * Used for validating forms
	 * @param  {Object} event
	 * @return {boolean} whether the form is valid
	 */
	_isValid = (event) => {
		if (typeof event.preventDefault !== 'undefined') { event.preventDefault(); }
		switch (event.target.name) {
			case 'email':
				return /.*@.*/.test(event.target.value);
			case 'confirmEmail':
				return this.state.email === event.target.value;
			case 'password':
				return this.state.password.length >= 8 &&
					this.state.password.length <= 50 || false;
			case 'policy':
				return this.state.policy === true;
			default:
				return true;
		}
	}

	/**
	 * handles the onChange property
	 * @param  {Object} event
	 */
	_onChange = (event) => {
		switch (event.target.name) {
			case 'email':
				this.setState({
					email: event.target.value,
				});
				break;
			case 'confirmEmail':
				this.setState({
					confirmEmail: event.target.value,
				});
				break;
			case 'firstName':
				this.setState({
					firstName: event.target.value,
				});
				break;
			case 'lastName':
				this.setState({
					lastName: event.target.value,
				});
				break;
			case 'password':
				this.setState({
					password: event.target.value,
				});
				break;
			case 'policy':
				this.setState({
					policy: event.target.checked,
				});
				break;
			default: break;
		}
	}

	/**
	 * handles the onBlur property
	 * @param  {Object} event
	 */
	_onBlur = (event) => {
		if (this._isValid(event)) {
			event.target.classList.remove('invalid');
		} else {
			event.target.classList.add('invalid');
		}
	}

	/**
	 * Wrapper function for dangerouslySetInnerHTML. Provides extra security
	 * @return {Object}
	 */
	createTermsMarkup() {
		return { __html: t('setup_login_view_terms') };
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the #additional-features step of the setup flow
	 */
	render() {
		return (
			<div id="log-in-view">
				{this.state.status === 'new' &&
					<form onSubmit={this._createAccount} noValidate>
						<div className="row align-center new-account">
							<div className="columns small-10 large-8">
								<div className="row small-up-1 medium-up-2 align-center">
									<div className="columns">
										<label>{ t('setup_login_view_email') }</label>
										<input
											name="email"
											type="email"
											value={this.state.email}
											onChange={this._onChange}
											onBlur={this._onBlur}
											required
											ref={(ref) => { this.emailInput = ref; }}
										/>
										<span className="form-error-container">
											<span className="form-error">{ t('setup_login_view_email_error') }</span>
										</span>
									</div>
									<div className="columns">
										<label>{ t('setup_login_view_confirm_email') }</label>
										<input
											name="confirmEmail"
											type="email"
											value={this.state.confirmEmail}
											onChange={this._onChange}
											onBlur={this._onBlur}
											required
											ref={(ref) => { this.confirmEmailInput = ref; }}
										/>
										<span className="form-error-container">
											<span className="form-error">{ t('setup_login_view_confirm_email_error') }</span>
										</span>
									</div>
									<div className="columns">
										<label>{ t('setup_login_view_first_name') }</label>
										<input
											name="firstName"
											type="text"
											value={this.state.firstName}
											onChange={this._onChange}
											onBlur={this._onBlur}
										/>
									</div>
									<div className="columns">
										<label>{ t('setup_login_view_last_name') }</label>
										<input
											name="lastName"
											type="text"
											value={this.state.lastName}
											onChange={this._onChange}
											onBlur={this._onBlur}
										/>
									</div>
									<div className="columns">
										<label>{ t('setup_login_view_password') }</label>
										<input
											name="password"
											type="password"
											value={this.state.password}
											onChange={this._onChange}
											onBlur={this._onBlur}
											required
											ref={(ref) => { this.passwordInput = ref; }}
										/>
										<span className="form-error-container">
											<span className="form-error">{ t('setup_login_view_password_error') }</span>
										</span>
									</div>
									<div className="columns">
										<input
											name="policy"
											type="checkbox"
											id="log-in-view-policy-input"
											checked={this.state.policy}
											onChange={this._onChange}
											onBlur={this._onBlur}
											required
											ref={(ref) => { this.policyInput = ref; }}
										/>
										<label htmlFor="log-in-view-policy-input">
											<span dangerouslySetInnerHTML={this.createTermsMarkup()} />
										</label>
										<span className="form-error-container">
											<span className="form-error">{ t('setup_login_view_terms_error') }</span>
										</span>
									</div>
									<div className="columns">
										<a onClick={this._toggleSignIn}>{ t('setup_login_view_log_in') }</a>
									</div>
									<div className="columns" />
								</div>
							</div>
						</div>
						<input type="submit" className="hide" />
					</form>
				}
				{this.state.status === 'login' &&
					<form onSubmit={this._signIn} noValidate>
						<div className="row align-center new-account">
							<div className="columns small-10 medium-8 large-6">
								<div className="row small-up-1 align-center">
									<div className="columns">
										<label>{ t('setup_login_view_email') }</label>
										<input
											name="email"
											type="email"
											value={this.state.email}
											onChange={this._onChange}
											onBlur={this._onBlur}
											required
											ref={(ref) => { this.emailInput = ref; }}
										/>
										<span className="form-error-container">
											<span className="form-error">{ t('setup_login_view_email_error') }</span>
										</span>
									</div>
									<div className="columns">
										<label>{ t('setup_login_view_password') }</label>
										<input
											name="password"
											type="password"
											value={this.state.password}
											onChange={this._onChange}
											onBlur={this._onBlur}
											required
											ref={(ref) => { this.passwordInput = ref; }}
										/>
										<span className="form-error-container">
											<span className="form-error">{ t('setup_login_view_password_error') }</span>
										</span>
									</div>
									<div className="columns">
										<a onClick={this._toggleSignIn}>{ t('setup_login_view_create_account') }</a>
									</div>
								</div>
								<input type="submit" className="hide" />
							</div>
						</div>
					</form>
				}
				{this.state.status === 'loggedin' &&
					<div className="row">
						<div className="columns text-center logged-in">
							<h3>
								{t('setup_login_view_signed_in_as')} {this.props.payload.ClaimEmailAddress}
							</h3>
						</div>
					</div>
				}
			</div>
		);
	}
}

export default LogInView;
