/**
 * Browser Create Account View
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

import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import { NavLink } from 'react-router-dom';
import { ToggleCheckbox } from '../../../shared-components';

const promoString = `${t('hub_browser_send_me')} Ghostery ${t('hub_browser_updates_and_promotions')}`;

/**
 * A Functional React component for rendering the Browser Create Account View
 * @return {JSX} JSX for rendering the Browser Create Account View of the Hub app
 * @memberof HubComponents
 */
const BrowserCreateAccountForm = (props) => {
	const {
		email,
		emailError,
		confirmEmail,
		confirmEmailError,
		firstName,
		lastName,
		password,
		confirmPassword,
		passwordInvalidError,
		passwordLengthError,
		legalConsentChecked,
		legalConsentNotCheckedError,
		handleLegalConsentCheckboxChange,
		isUpdatesChecked,
		handleInputChange,
		handleUpdatesCheckboxChange,
		handleSubmit,
	} = props;

	const emailInputClassNames = ClassNames('BrowserCreateAccountForm__inputBox', {
		error: emailError,
	});
	const confirmInputClassNames = ClassNames('BrowserCreateAccountForm__inputBox', {
		error: confirmEmailError,
	});
	const passwordInputClassNames = ClassNames('BrowserCreateAccountForm__inputBox', {
		error: passwordInvalidError || passwordLengthError,
	});
	const legalConsentClassNames = ClassNames('BrowserCreateAccountForm__legalConsentCheckedLabel', {
		error: legalConsentNotCheckedError
	});

	return (
		<form onSubmit={handleSubmit}>
			<div className="BrowserCreateAccountForm--addPaddingTop row align-center-middle">
				<div className="columns small-12 medium-5">
					<label htmlFor="create-account-email" className="BrowserCreateAccountForm__inputLabel">
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
						<div className="BrowserCreateAccountForm__inputError">
							{t('please_enter_a_valid_email')}
						</div>
					)}
				</div>
				<div className="columns small-12 medium-5">
					<label htmlFor="create-account-confirmEmail" className="BrowserCreateAccountForm__inputLabel">
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
						<div className="BrowserCreateAccountForm__inputError">
							{t('your_email_do_not_match')}
						</div>
					)}
				</div>
			</div>
			<div className="row align-center-middle">
				<div className="columns small-12 medium-5">
					<label htmlFor="create-account-firstName" className="BrowserCreateAccountForm__inputLabel">
						{t('hub_create_account_label_first_name')}
					</label>
					<input
						id="create-account-firstName"
						className="BrowserCreateAccountForm__inputBox"
						name="firstName"
						type="text"
						value={firstName}
						onChange={handleInputChange}
						pattern=".{1,}"
						autoComplete="off"
					/>
				</div>
				<div className="columns small-12 medium-5">
					<label htmlFor="create-account-lastName" className="BrowserCreateAccountForm__inputLabel">
						{t('hub_create_account_label_email_last_name')}
					</label>
					<input
						id="create-account-lastName"
						className="BrowserCreateAccountForm__inputBox"
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
				<div className="columns small-12 medium-5">
					<label htmlFor="create-account-password" className="BrowserCreateAccountForm__inputLabel">
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
						<div className="BrowserCreateAccountForm__inputError">
							{t('hub_create_account_label_password_invalid')}
						</div>
					)}
					{passwordLengthError && (
						<div className="BrowserCreateAccountForm__inputError">
							{t('hub_create_account_label_password_invalid_length')}
						</div>
					)}
				</div>
				<div className="columns small-12 medium-5">
					<label htmlFor="create-account-password" className="BrowserCreateAccountForm__inputLabel">
						{t('confirm_password_colon')}
					</label>
					<input
						id="create-account-password"
						className={passwordInputClassNames}
						name="confirm password"
						type="password"
						value={confirmPassword}
						onChange={handleInputChange}
						pattern=".{1,}"
						autoComplete="off"
					/>
					{passwordInvalidError && (
						<div className="BrowserCreateAccountForm__inputError">
							{t('hub_create_account_label_password_invalid')}
						</div>
					)}
					{passwordLengthError && (
						<div className="BrowserCreateAccountForm__inputError">
							{t('hub_create_account_label_password_invalid_length')}
						</div>
					)}
				</div>
			</div>
			<div className="row align-center-middle">
				<div className="columns small-12 medium-8">
					<div className="BrowserCreateAccountForm__checkboxContainer BrowserCreateAccountForm--marginBottom flex-container">
						<ToggleCheckbox
							checked={isUpdatesChecked}
							className="ToggleCheckbox--flush-left"
							onChange={handleUpdatesCheckboxChange}
						/>
						<span
							className="BrowserCreateAccountForm__promoString"
							onClick={handleUpdatesCheckboxChange}
							dangerouslySetInnerHTML={{ __html: promoString }}
						/>
					</div>
				</div>
				<div className="columns small-12 medium-2" />
			</div>
			<div className="row align-center-middle">
				<div className="columns small-12 medium-8">
					<div className="BrowserCreateAccountForm__checkboxContainer BrowserCreateAccountForm--marginBottom flex-container">
						<ToggleCheckbox
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
				<div className="columns small-12 medium-2" />
			</div>
			<div className="BrowserCreateAccountForm__ctaButtonContainer">
				<button type="submit" className="BrowserCreateAccountForm__ctaButton">{t('create_account')}</button>
			</div>
		</form>
	);
};

// PropTypes ensure we pass required props of the correct type
BrowserCreateAccountForm.propTypes = {
	email: PropTypes.string.isRequired,
	emailError: PropTypes.bool.isRequired,
	confirmEmail: PropTypes.string.isRequired,
	confirmEmailError: PropTypes.bool.isRequired,
	firstName: PropTypes.string.isRequired,
	lastName: PropTypes.string.isRequired,
	isUpdatesChecked: PropTypes.bool.isRequired,
	password: PropTypes.string.isRequired,
	confirmPassword: PropTypes.string.isRequired,
	passwordInvalidError: PropTypes.bool.isRequired,
	passwordLengthError: PropTypes.bool.isRequired,
	handleInputChange: PropTypes.func.isRequired,
	handleUpdatesCheckboxChange: PropTypes.func.isRequired,
	handleSubmit: PropTypes.func.isRequired,
};

export default BrowserCreateAccountForm;
