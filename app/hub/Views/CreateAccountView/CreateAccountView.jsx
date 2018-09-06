/**
 * Create Account View Container
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

import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import { ExitButton } from '../../../shared-components';

// Components
import SetupHeader from '../SetupViews/SetupHeader';

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
		promotionsChecked,
		createAccountSuccess,
		createAccountErrorText,
		handleInputChange,
		handleCheckboxChange,
		handleSubmit,
	} = props;
	const createAccountAlert = ClassNames({
		'create-account-result': true,
		success: createAccountSuccess || false,
		error: !!createAccountErrorText || false
	});
	const CheckboxImagePath = promotionsChecked ? '/app/images/hub/account/account-checkbox-on.svg' : '/app/images/hub/account/account-checkbox-off.svg';
	return (
		<div className="full-height flex-container flex-dir-column">
			<div className="flex-child-grow">
				<div>
					<ExitButton hrefExit="/" textExit={t('exit_create_account')} />
					<SetupHeader
						title={t('setup_create_account')}
						titleImage="/app/images/hub/account/ghosty-account.svg"
					/>
					<div className="row align-center account-content">
						<div className={createAccountAlert}>
							{createAccountErrorText || (createAccountSuccess ? 'Account Created' : '')}
						</div>
						<form onSubmit={handleSubmit}>
							<div className="CreateAccount">
								<div className="row">
									<div className="columns">
										<div className={(emailError ? 'panel-error' : '')}>
											<label htmlFor="create-account-email" className="flex-container flex-dir-column">
												<div className="flex-child-grow flex-container align-left-middle">{ t('email_field_label') }<span className="asterisk">*</span></div>
												<input
													onChange={handleInputChange}
													value={email}
													id="create-input-email"
													name="email"
													pattern=".{1,}"
													autoComplete="off"
													required
													type="text"
												/>
											</label>
											<p className="warning">{ t('invalid_email_create') }</p>
										</div>
									</div>
									<div className="columns">
										<div className={(confirmEmailError ? 'panel-error' : '')}>
											<label htmlFor="create-input-email-confirm" className="flex-container flex-dir-column">
												<div className="flex-child-grow flex-container align-left-middle">{ t('email_confirm_field_label') }<span className="asterisk">*</span></div>
												<input
													onChange={handleInputChange}
													value={confirmEmail}
													id="create-input-email-confirm"
													name="confirmEmail"
													pattern=".{1,}"
													autoComplete="off"
													required
													type="text"
												/>
											</label>
											<p className="warning">{ t('invalid_email_confirmation') }</p>
										</div>
									</div>
								</div>
								<div className="row" >
									<div className="columns">
										<div>
											<label htmlFor="ccreate-input-first-name" className="flex-container flex-dir-column">
												<div className="flex-child-grow flex-container align-left-middle">{ t('first_name_field_label') }</div>
												<input
													onChange={handleInputChange}
													value={firstName}
													id="create-input-first-name"
													name="firstName"
													pattern=".{1,}"
													type="text"
												/>
											</label>
										</div>
									</div>
									<div className="columns">
										<div>
											<label htmlFor="create-input-last-name" className="flex-container flex-dir-column">
												<div className="flex-child-grow flex-container align-left-middle">{ t('last_name_field_label') }</div>
												<input
													onChange={handleInputChange}
													value={lastName}
													id="create-input-last-name"
													name="lastName"
													pattern=".{1,}"
													type="text"
												/>
											</label>
										</div>
									</div>
								</div>
								<div className="row">
									<div className="columns">
										<div className={(passwordInvalidError || passwordLengthError ? 'panel-error' : '')}>
											<label htmlFor="create-account-password" className="flex-container flex-dir-column">
												<div className="flex-child-grow flex-container align-left-middle">{ t('create_password_field_label') }<span className="asterisk">*</span></div>
												<input
													onChange={handleInputChange}
													value={password}
													className="create-account-input"
													id="create-account-password"
													name="password"
													pattern=".{1,}"
													required
													type="password"
												/>
											</label>
											<p className="warning">
												<span className={(passwordLengthError ? 'panel-error show' : '')}>
													{ t('password_requirements') }
												</span>
												<span className={(passwordInvalidError ? 'panel-error show' : '')}>
													{ t('password_characters_requirements') }
												</span>
											</p>
										</div>
									</div>
									<div>
										<span className="account-checkbox-container" onClick={handleCheckboxChange}>
											<img src={CheckboxImagePath} className="account-checkbox" />
											<span>{ t('create_account_promotions') }</span>
										</span>
									</div>
								</div>
								<span className="row account-sign-in">
									<span className="columns">
										<NavLink to="/log-in">
											{ t('account_already_present') }
										</NavLink>
									</span>
								</span>
								<div className="row align-right">
									<button type="submit" className="account-submit">
										<span>{ t('panel_title_create_account') }</span>
									</button>
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
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
	password: PropTypes.string.isRequired,
	passwordInvalidError: PropTypes.bool.isRequired,
	passwordLengthError: PropTypes.bool.isRequired,
	promotionsChecked: PropTypes.bool.isRequired,
	createAccountSuccess: PropTypes.bool.isRequired,
	createAccountErrorText: PropTypes.string.isRequired,
	handleInputChange: PropTypes.func.isRequired,
	handleCheckboxChange: PropTypes.func.isRequired,
	handleSubmit: PropTypes.func.isRequired,
};

export default CreateAccountView;
