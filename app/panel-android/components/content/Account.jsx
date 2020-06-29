/**
 * Account Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2020 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';

class Account extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			view: 'login',
		};
	}

	_renderLogIn() {
		const {
			email,
			password,
			emailError,
			passwordError,
			handleSubmit,
			handleInputChange,
		} = this.props;
		const emailInputClassNames = ClassNames('Account__inputBox', {
			error: emailError,
		});
		const passwordInputClassNames = ClassNames('Account__inputBox', {
			error: passwordError,
		});

		return (
			<div className="Account--addPaddingTop row align-center">
				<div className="columns">
					<div className="Account__header flex-container align-center-middle">
						<h3>
							{t('hub_login_header_title')}
						</h3>
					</div>
				</div>
				<div className="columns small-12 medium-10 large-6">
					<form onSubmit={handleSubmit}>
						<label htmlFor="login-email" className="Account__inputLabel">
							{t('email_colon')}
						</label>
						<input
							id="login-email"
							className={emailInputClassNames}
							name="email"
							type="text"
							value={email}
							onChange={handleInputChange}
							pattern=".{1,}"
							autoComplete="off"
						/>
						{emailError && (
							<div className="Account__inputError">
								{t('please_enter_a_valid_email')}
							</div>
						)}
						<label htmlFor="login-password" className="Account__inputLabel">
							{t('password_colon')}
						</label>
						<input
							id="login-password"
							className={passwordInputClassNames}
							name="password"
							type="password"
							value={password}
							onChange={handleInputChange}
							pattern=".{1,}"
						/>
						{passwordError && (
							<div className="Account__inputError">
								{t('hub_login_label_password_invalid')}
							</div>
						)}
						<div className="flex-container align-center">
							<span className="Account__link text-center" onClick={() => { this.setState({ view: 'forgot-password' }); }}>
								{ t('forgot_password') }
							</span>
						</div>
						<div className="flex-container align-center">
							<span className="Account__link text-center">
								{ t('hub_login_link_dont_have_account') }
								&nbsp;
								<span onClick={() => { this.setState({ view: 'create-account' }); }}>
									{ t('hub_login_link_create_account') }
								</span>
							</span>
						</div>
						<div className="Account--addPaddingTop flex-container align-center">
							<button type="submit" className="Account__button button success">
								{ t('sign_in') }
							</button>
						</div>
					</form>
				</div>
			</div>
		);
	}

	_renderCreateAccount() {
		console.log('createAccount', this.props);

		return (<div>Create Account</div>);
	}

	_renderForgotPassword() {
		const {
			email,
			emailError,
			handleSubmit,
			handleInputChange,
		} = this.props;

		return (
			<div className="Account--addPaddingTop row align-center">
				<div className="columns">
					<div className="Account__header flex-container align-center-middle">
						<h3>
							{t('forgot_password_message')}
						</h3>
					</div>
				</div>
				<div className="columns small-12 medium-10 large-6">
					<form onSubmit={handleSubmit}>
						<div id="forgot-email" className={(emailError ? 'panel-error invalid-email' : '')}>
							<label htmlFor="forgot-email">
								{t('email_colon')}
								<span className="asterisk">*</span>
								<input onChange={handleInputChange} value={email} id="forgot-email" type="text" name="email" pattern=".{1,}" autoComplete="off" required />
							</label>
							<p className="invalid-email warning">
								{t('invalid_email_forgot')}
							</p>
							<p className="not-found-error warning">
								{t('error_email_forgot')}
							</p>
						</div>
						<div className="asdf">
							<div className="small-6 columns text-center">
								<div id="forgot-password-cancel" className="cancel button hollow success" onClick={() => { this.setState({ view: 'login' }); }}>
									{t('button_cancel')}
								</div>
							</div>
							<div className="small-6 columns text-center">
								<button type="submit" id="send-button" className="asdf">
									<span className="title">{t('send_button_label')}</span>
									<span className="asdf" />
								</button>
							</div>
						</div>
					</form>
				</div>
			</div>
		);
	}

	render() {
		const { view } = this.state;

		return (
			<div className="Account">
				{view === 'login' && this._renderLogIn()}
				{view === 'create-account' && this._renderCreateAccount()}
				{view === 'forgot-password' && this._renderForgotPassword()}
			</div>
		);
	}
}

Account.propTypes = {
	summary: PropTypes.shape({}).isRequired,
	settings: PropTypes.shape({}).isRequired,
};

export default Account;
