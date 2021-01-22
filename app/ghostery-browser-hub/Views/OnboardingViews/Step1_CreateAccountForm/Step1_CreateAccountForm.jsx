/**
 * Browser Create Account Form
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
import ToggleCheckbox from '../../../../shared-components/ToggleCheckbox';

/**
 * A Functional React component for rendering the Browser Create Account View
 * @return {JSX} JSX for rendering the Browser Create Account View of the Hub app
 * @memberof GhosteryBrowserHubViews
 */
export const Step1_CreateAccountForm = (props) => {
	const {
		email,
		emailError,
		confirmEmail,
		confirmEmailError,
		firstName,
		lastName,
		password,
		passwordInvalidError,
		passwordLengthError,
		confirmPassword,
		confirmPasswordError,
		legalConsentChecked,
		legalConsentNotCheckedError,
		handleLegalConsentCheckboxChange,
		handleInputChange,
		handleSubmit,
	} = props;

	const emailInputClassNames = ClassNames('Step1_CreateAccountForm__inputBox', {
		error: emailError,
	});
	const confirmInputClassNames = ClassNames('Step1_CreateAccountForm__inputBox', {
		error: confirmEmailError,
	});
	const passwordInputClassNames = ClassNames('Step1_CreateAccountForm__inputBox', {
		error: passwordInvalidError || passwordLengthError,
	});
	const legalConsentClassNames = ClassNames('Step1_CreateAccountForm__legalConsentCheckedLabel', {
		error: legalConsentNotCheckedError
	});

	return (
		<form onSubmit={handleSubmit}>
			<div className="Step1_CreateAccountForm--addPaddingTop row align-center-middle">
				<div className="columns small-10 medium-6">
					<label htmlFor="create-account-email" className="Step1_CreateAccountForm__inputLabel">
						{t('email_colon')}
					</label>
					<input
						id="create-account-email"
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
						<div className="Step1_CreateAccountForm__inputErrorContainer">
							<div className="Step1_CreateAccountForm__inputError">
								{t('please_enter_a_valid_email')}
							</div>
						</div>
					)}
				</div>
				<div className="columns small-10 medium-6">
					<label htmlFor="create-account-confirmEmail" className="Step1_CreateAccountForm__inputLabel">
						{t('confirm_email_colon')}
					</label>
					<input
						id="create-account-confirmEmail"
						className={confirmInputClassNames}
						name="confirmEmail"
						type="text"
						value={confirmEmail}
						onChange={handleInputChange}
						pattern=".{1,}"
						autoComplete="off"
					/>
					{confirmEmailError && (
						<div className="Step1_CreateAccountForm__inputErrorContainer">
							<div className="Step1_CreateAccountForm__inputError">
								{t('your_email_do_not_match')}
							</div>
						</div>
					)}
				</div>
			</div>
			<div className="row align-center-middle">
				<div className="columns small-10 medium-6">
					<label htmlFor="create-account-firstName" className="Step1_CreateAccountForm__inputLabel">
						{t('hub_create_account_label_first_name')}
					</label>
					<input
						id="create-account-firstName"
						className="Step1_CreateAccountForm__inputBox"
						name="firstName"
						type="text"
						value={firstName}
						onChange={handleInputChange}
						pattern=".{1,}"
						autoComplete="off"
					/>
				</div>
				<div className="columns small-10 medium-6">
					<label htmlFor="create-account-lastName" className="Step1_CreateAccountForm__inputLabel">
						{t('hub_create_account_label_email_last_name')}
					</label>
					<input
						id="create-account-lastName"
						className="Step1_CreateAccountForm__inputBox"
						name="lastName"
						type="text"
						value={lastName}
						onChange={handleInputChange}
						pattern=".{1,}"
						autoComplete="off"
					/>
				</div>
			</div>
			<div className="row align-center-middle">
				<div className="columns small-10 medium-6">
					<label htmlFor="create-account-password" className="Step1_CreateAccountForm__inputLabel">
						{t('password_colon')}
					</label>
					<input
						id="create-account-password"
						className={passwordInputClassNames}
						name="password"
						type="password"
						value={password}
						onChange={handleInputChange}
						pattern=".{1,}"
						autoComplete="off"
					/>
					{passwordInvalidError && (
						<div className="Step1_CreateAccountForm__inputErrorContainer">
							<div className="Step1_CreateAccountForm__inputError">
								{t('hub_create_account_label_password_invalid')}
							</div>
						</div>
					)}
					{passwordLengthError && (
						<div className="Step1_CreateAccountForm__inputErrorContainer">
							<div className="Step1_CreateAccountForm__inputError">
								{t('hub_create_account_label_password_invalid_length')}
							</div>
						</div>
					)}
				</div>
				<div className="columns small-10 medium-6">
					<label htmlFor="create-account-password" className="Step1_CreateAccountForm__inputLabel">
						{t('confirm_password_colon')}
					</label>
					<input
						id="create-account-password"
						className={passwordInputClassNames}
						name="confirmPassword"
						type="password"
						value={confirmPassword}
						onChange={handleInputChange}
						pattern=".{1,}"
						autoComplete="off"
					/>
					{confirmPasswordError && (
						<div className="Step1_CreateAccountForm__inputErrorContainer">
							<div className="Step1_CreateAccountForm__inputError">
								{t('hub_create_account_confirm_password_do_not_match')}
							</div>
						</div>
					)}
				</div>
			</div>
			<div className="row">
				<div className="columns small-12 medium-10">
					<div className="Step1_CreateAccountForm__checkboxContainer BrowserCreateAccountForm--marginBottom flex-container">
						<ToggleCheckbox
							name="globals"
							checked={legalConsentChecked}
							className="ToggleCheckbox--flush-left"
							onChange={handleLegalConsentCheckboxChange}
						/>
						<span
							className={legalConsentClassNames}
							onClick={handleLegalConsentCheckboxChange}
							dangerouslySetInnerHTML={{ __html: t('create_account_form_legal_consent_checkbox_label') }}
						/>
					</div>
				</div>
				{/* <div className="columns small-10 medium-2" /> */}
			</div>
			<div className="Step1_CreateAccountForm__ctaButtonContainer">
				<button type="submit" className="Step1_CreateAccountForm__ctaButton">{t('create_account')}</button>
			</div>
		</form>
	);
};

// PropTypes ensure we pass required props of the correct type
Step1_CreateAccountForm.propTypes = {
	email: PropTypes.string.isRequired,
	emailError: PropTypes.bool.isRequired,
	confirmEmail: PropTypes.string.isRequired,
	confirmEmailError: PropTypes.bool.isRequired,
	firstName: PropTypes.string.isRequired,
	lastName: PropTypes.string.isRequired,
	password: PropTypes.string.isRequired,
	confirmPassword: PropTypes.string.isRequired,
	passwordInvalidError: PropTypes.bool.isRequired,
	passwordLengthError: PropTypes.bool.isRequired,
	handleInputChange: PropTypes.func.isRequired,
	handleSubmit: PropTypes.func.isRequired,
};

export default Step1_CreateAccountForm;
