/**
 * Browser Log In Form
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2021 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';

/**
 * A Functional React component for rendering the Log In Form
 * @return {JSX} JSX for rendering the Log In Form of the Dawn Hub app
 * @memberof DawnHubViews
 */
const Step1_LogInForm = (props) => {
	const {
		email,
		password,
		emailError,
		passwordError,
		handleSubmit,
		handleInputChange,
		handleForgotPassword,
	} = props;

	const emailInputClassNames = ClassNames('Step1_LogInForm__inputBox', {
		error: emailError,
	});
	const passwordInputClassNames = ClassNames('Step1_LogInForm__inputBox', {
		error: passwordError,
	});

	return (
		<form className="Step1_LogInForm" onSubmit={handleSubmit}>
			<div className="Step1_LogInForm__item row align-center-middle">
				<div className="columns small-12">
					<label htmlFor="login-email" className="Step1_LogInForm__inputLabel">
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
						<div className="Step1_LogInForm__inputError">
							{t('please_enter_a_valid_email')}
						</div>
					)}
				</div>
			</div>
			<div className="Step1_LogInForm__item row align-center-middle">
				<div className="columns small-12">
					<label htmlFor="login-password" className="Step1_LogInForm__inputLabel">
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
						<div className="Step1_LogInForm__inputError">
							{t('hub_login_label_password_invalid')}
						</div>
					)}
				</div>
			</div>
			<div className="Step1_LogInForm__item row align-center-middle">
				<div className="columns small-12">
					<span className="Step1_LogInForm__link">
						<div className="Step1_LogInForm__forgotPassword" onClick={handleForgotPassword}>
							{t('forgot_password')}
						</div>
					</span>
				</div>
			</div>
			<div className="Step1_LogInForm__ctaButtonContainer">
				<button type="submit" className="Step1_LogInForm__ctaButton">{t('sign_in')}</button>
			</div>
		</form>
	);
};

// PropTypes ensure we pass required props of the correct type
Step1_LogInForm.propTypes = {
	email: PropTypes.string.isRequired,
	password: PropTypes.string.isRequired,
	emailError: PropTypes.bool.isRequired,
	passwordError: PropTypes.bool.isRequired,
	handleSubmit: PropTypes.func.isRequired,
	handleInputChange: PropTypes.func.isRequired,
};

export default Step1_LogInForm;
