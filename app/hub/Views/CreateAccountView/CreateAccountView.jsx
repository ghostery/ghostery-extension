/**
 * Create Account View
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
import { ToggleCheckbox } from '../../../shared-components';

/**
 * A Functional React component for rendering the Create Account View
 * @return {JSX} JSX for rendering the Create Account View of the Hub app
 * @memberof HubComponents
 */
const CreateAccountView = (props) => {
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
		legalConsentChecked,
		legalConsentNotCheckedError,
		handleInputChange,
		handleLegalConsentCheckboxChange,
		handleSubmit,
	} = props;

	const emailInputClassNames = ClassNames('CreateAccountView__inputBox', {
		error: emailError,
	});
	const confirmInputClassNames = ClassNames('CreateAccountView__inputBox', {
		error: confirmEmailError,
	});
	const legalConsentCheckboxInputLabelClassNames = ClassNames('CreateAccountView__inputLabel clickable', {
		error: legalConsentNotCheckedError,
	});
	const passwordInputClassNames = ClassNames('CreateAccountView__inputBox', {
		error: passwordInvalidError || passwordLengthError,
	});

	return (
		<div className="CreateAccountView">
			<div className="CreateAccountView--addPaddingTop row align-center">
				<div className="columns small-10">
					<div className="CreateAccountView__header flex-container align-center-middle">
						<img className="CreateAccountView__headerImage" src="/app/images/hub/account/ghosty-account.svg" />
						<div className="CreateAccountView__headerTitle">
							<h3>
								{t('hub_create_account_header_title')}
							</h3>
						</div>
					</div>
				</div>
			</div>
			<form onSubmit={handleSubmit}>
				<div className="CreateAccountView--addPaddingTop row align-center-middle">
					<div className="columns small-12 medium-5">
						<label htmlFor="create-account-email" className="CreateAccountView__inputLabel">
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
						/>
						{emailError && (
							<div className="CreateAccountView__inputError">
								{t('please_enter_a_valid_email')}
							</div>
						)}
					</div>
					<div className="columns small-12 medium-5">
						<label htmlFor="create-account-confirmEmail" className="CreateAccountView__inputLabel">
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
							<div className="CreateAccountView__inputError">
								{t('your_emails_do_not_match')}
							</div>
						)}
					</div>
				</div>
				<div className="row align-center-middle">
					<div className="columns small-12 medium-5">
						<label htmlFor="create-account-firstName" className="CreateAccountView__inputLabel">
							{t('hub_create_account_label_first_name')}
						</label>
						<input
							id="create-account-firstName"
							className="CreateAccountView__inputBox"
							name="firstName"
							type="text"
							value={firstName}
							onChange={handleInputChange}
							pattern=".{1,}"
							autoComplete="off"
						/>
					</div>
					<div className="columns small-12 medium-5">
						<label htmlFor="create-account-lastName" className="CreateAccountView__inputLabel">
							{t('hub_create_account_label_email_last_name')}
						</label>
						<input
							id="create-account-lastName"
							className="CreateAccountView__inputBox"
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
						<label htmlFor="create-account-password" className="CreateAccountView__inputLabel">
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
							<div className="CreateAccountView__inputError">
								{t('hub_create_account_label_password_invalid')}
							</div>
						)}
						{passwordLengthError && (
							<div className="CreateAccountView__inputError">
								{t('hub_create_account_label_password_invalid_length')}
							</div>
						)}
					</div>
					<div className="columns small-12 medium-5">
						<div className="CreateAccountView__checkboxContainer CreateAccountView--marginBottom flex-container">
							<ToggleCheckbox
								checked={legalConsentChecked}
								className="ToggleCheckbox--flush-left"
								onChange={handleLegalConsentCheckboxChange}
							/>
							<span
								className={legalConsentCheckboxInputLabelClassNames}
								onClick={handleLegalConsentCheckboxChange}
								dangerouslySetInnerHTML={{ __html: t('create_account_form_legal_consent_checkbox_label') }}
							/>
						</div>
					</div>
				</div>
				<div className="row align-center">
					<div className="CreateAccountView__linkContainer columns small-12 medium-10">
						<p className="CreateAccountView__link">
							{ t('hub_create_account_already_have_account') }
							&nbsp;
							<NavLink to="/log-in">
								{ t('hub_create_account_link_login') }
							</NavLink>
						</p>
					</div>
				</div>
				<div className="row align-center">
					<div className="CreateAccountView__linkContainer columns small-12 medium-10">
						<p className="CreateAccountView__termsStatement" dangerouslySetInnerHTML={{ __html: t('account_creation_privacy_statement') }} />
					</div>
				</div>
				<div className="CreateAccountView--addPaddingTop row align-center">
					<div className="CreateAccountView__submit columns small-12 medium-10 flex-container flex-dir-row-reverse">
						<button type="submit" className="CreateAccountView__button button success">
							{ t('create_account') }
						</button>
					</div>
				</div>
			</form>
		</div>
	);
};

// PropTypes ensure we pass required props of the correct type
CreateAccountView.propTypes = {
	email: PropTypes.string.isRequired,
	emailError: PropTypes.bool.isRequired,
	confirmEmail: PropTypes.string.isRequired,
	confirmEmailError: PropTypes.bool.isRequired,
	firstName: PropTypes.string.isRequired,
	lastName: PropTypes.string.isRequired,
	legalConsentChecked: PropTypes.bool.isRequired,
	password: PropTypes.string.isRequired,
	passwordInvalidError: PropTypes.bool.isRequired,
	passwordLengthError: PropTypes.bool.isRequired,
	handleInputChange: PropTypes.func.isRequired,
	handleLegalConsentCheckboxChange: PropTypes.func.isRequired,
	handleSubmit: PropTypes.func.isRequired,
};

export default CreateAccountView;
