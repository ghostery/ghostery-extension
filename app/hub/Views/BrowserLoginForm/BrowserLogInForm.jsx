/**
 * Browser Log In Form
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
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import { NavLink } from 'react-router-dom';

/**
 * A Functional React component for rendering the Log In Form
 * @return {JSX} JSX for rendering the Log In Form of the Browser Hub app
 * @memberof HubComponents
 */
const BrowserLogInForm = (props) => {
	const {
		email,
		password,
		emailError,
		passwordError,
		handleSubmit,
		handleInputChange,
	} = props;

	const emailInputClassNames = ClassNames('BrowserLogInForm__inputBox', {
		error: emailError,
	});
	const passwordInputClassNames = ClassNames('BrowserLogInForm__inputBox', {
		error: passwordError,
	});

	return (
		<form className="BrowserLogInForm" onSubmit={handleSubmit}>
			<div className="BrowserLogInForm__item row align-center-middle">
				<div className="columns small-10">
					<label htmlFor="login-email" className="BrowserLogInForm__inputLabel">
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
						placeholder="example@mail.com"
					/>
					{emailError && (
						<div className="BrowserLogInForm__inputError">
							{t('please_enter_a_valid_email')}
						</div>
					)}
				</div>
			</div>
			<div className="BrowserLogInForm__item row align-center-middle">
				<div className="columns small-10">
					<label htmlFor="login-password" className="BrowserLogInForm__inputLabel">
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
						<div className="BrowserLogInForm__inputError">
							{t('hub_login_label_password_invalid')}
						</div>
					)}
				</div>
			</div>
			<div className="BrowserLogInForm__item row align-center-middle">
				<div className="columns small-10">
					<span className="BrowserLogInForm__link text-center">
						<NavLink to="/forgot-password">
							{t('forgot_password')}
						</NavLink>
					</span>
				</div>
			</div>
			<div className="BrowserLogInForm__ctaButtonContainer">
				<button type="submit" className="BrowserLogInForm__ctaButton">{t('sign_in')}</button>
			</div>
			<div className="row align-center-middle">
				<div className="columns small-10 medium-5" />
				<div className="columns small-10 medium-5">
					<div className="BrowserCreateAccountView__skip">{t('hub_browser_skip')}</div>
				</div>
			</div>
		</form>
	);
};

// PropTypes ensure we pass required props of the correct type
BrowserLogInForm.propTypes = {
	email: PropTypes.string.isRequired,
	password: PropTypes.string.isRequired,
	emailError: PropTypes.bool.isRequired,
	passwordError: PropTypes.bool.isRequired,
	handleSubmit: PropTypes.func.isRequired,
	handleInputChange: PropTypes.func.isRequired,
};

export default BrowserLogInForm;
