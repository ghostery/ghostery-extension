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
import { log } from '../../../../src/utils/common';
import { utils } from '../../utils';

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
		};
	}

	/**
	* Lifecycle event
	*/
	componentWillMount() {
		this.props.actions.reset();
		this.props.actions.getUser()
			.then((res) => {
				const { errors, user } = res;
				if (errors) {
					this.setState({ status: 'new' });
					this.props.actions.updateNavigationNextButtons([
						{
							title: t('setup_button_skip'),
							action: 'next',
						}, {
							title: t('setup_button_create_account'),
							action: 'createAccount',
						},
					]);
				} else {
					this.setState({
						status: 'loggedin',
						email: user.email,
					});
					this.props.actions.updateNavigationNextButtons([
						{
							title: t('setup_button_next'),
							action: 'next',
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
	_signIn = (e) => {
		if (e) { e.preventDefault(); }
		const { email, password } = this.state;
		if (!this._validateSignIn()) {
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

		this.props.actions.showLoading();
	}


	/**
	 * Handles the onSubmit property on the Create Account form
	 * @param  {Object} event
	 */
	_createAccount = (e) => {
		if (e) { e.preventDefault(); }
		if (!this._validateCreateAccount()) {
			return;
		}

		const {
			email, confirmEmail, firstName, lastName, password
		} = this.state;
		this.props.actions.register(email, confirmEmail, firstName, lastName, password)
			.then((success) => {
				if (success) {
					this.props.actions.getUser();
				}
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
			}));
	}

	/**
	 * Used for validating forms
	 * @param  {Object} event
	 * @return {boolean} whether the form is valid
	 */
	_isValid = (e) => {
		const { name, value } = e.target;
		const { email, password } = this.state;
		switch (name) {
			case 'email':
				return utils.validateEmail(value);
			case 'confirmEmail':
				return email === value;
			case 'password':
				return utils.validatePassword(password);
			default:
				return true;
		}
	}

	/**
	 * handles the onChange property
	 * @param  {Object} event
	 */
	_onChange = (e) => {
		const { name, value } = e.target;
		this.setState({ [name]: value });
	}

	/**
	 * handles the onBlur property
	 * @param  {Object} event
	 */
	_onBlur = (e) => {
		if (this._isValid(e)) {
			e.target.classList.remove('invalid');
		} else {
			e.target.classList.add('invalid');
		}
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the #log-in step of the setup flow
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
									<div className="columns" />
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
								{t('setup_login_view_signed_in_as')} {this.state.email}
							</h3>
						</div>
					</div>
				}
			</div>
		);
	}
}

export default LogInView;
