/**
 * Create Account Form Container
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2020, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
	validateEmail,
	validatePassword,
	validateEmailsMatch,
	validateConfirmEmail,
	validatePasswordsMatch
} from '../../../../panel/utils/utils';
import BrowserCreateAccountForm from './Step1_CreateAccountForm';

/**
 * @class Implement the Create Account View for the Ghostery Hub
 * @extends Component
 * @memberof GhosteryBrowserHubContainers
 */
class CreateAccountFormContainer extends Component {
	constructor(props) {
		super(props);
		this.state = {
			email: '',
			emailError: false,
			confirmEmail: '',
			confirmEmailError: false,
			firstName: '',
			lastName: '',
			legalConsentChecked: false,
			legalConsentNotCheckedError: false,
			isUpdatesChecked: false,
			password: '',
			passwordInvalidError: false,
			passwordLengthError: false,
			confirmPassword: '',
			confirmPasswordError: '',
			validateInput: false,
		};

		const { actions } = this.props;
		actions.setToast({
			toastMessage: '',
			toastClass: '',
		});
	}

	/**
	 * Update input values by updating state.
	 * @param  {Object} event the 'change' event
	 */
	_handleInputChange = (event) => {
		const { name, value } = event.target;
		this.setState({ [name]: value });

		const { validateInput } = this.state;
		if (!validateInput) {
			return;
		}

		switch (name) {
			case 'email': {
				const emailIsValid = value && validateEmail(value);
				this.setState({
					emailError: !emailIsValid,
				});
				break;
			}
			case 'confirmEmail': {
				const { email } = this.state;
				const confirmIsValid = value && validateEmailsMatch(email, value);
				this.setState({
					confirmEmailError: !confirmIsValid,
				});
				break;
			}
			case 'password': {
				const passwordIsValid = value && validatePassword(value);
				const invalidChars = !passwordIsValid && value.length >= 8 && value.length <= 50;
				const invalidLength = !passwordIsValid && !invalidChars;
				this.setState({
					passwordInvalidError: invalidChars,
					passwordLengthError: invalidLength,
				});
				break;
			}
			case 'confirmPassword': {
				const { password } = this.state;
				const confirmPasswordIsValid = value && validatePasswordsMatch(password, value);
				this.setState({
					confirmPasswordError: !confirmPasswordIsValid,
				});
				break;
			}
			default: break;
		}
	}

	/**
	 * Update legal consent checkbox value by updating state
	 */
	_handleLegalConsentCheckboxChange = () => {
		this.setState(prevState => ({ legalConsentChecked: !prevState.legalConsentChecked }));
	}

	/**
	 * Update updates checkbox value by updating state
	 */
	_handleUpdatesCheckboxChange = () => {
		this.setState(prevState => ({ isUpdatesChecked: !prevState.isUpdatesChecked }));
	}

	/**
	 * Handle creating an account, but validate the data first.
	 * @param  {Object} event the 'submit' event
	 */
	_handleCreateAccountAttempt = (event) => {
		event.preventDefault();
		const {
			email,
			confirmEmail,
			firstName,
			lastName,
			legalConsentChecked,
			password,
			confirmPassword,
			isUpdatesChecked,
		} = this.state;
		const emailIsValid = email && validateEmail(email);
		const confirmIsValid = confirmEmail && validateConfirmEmail(email, confirmEmail);
		const passwordIsValid = password && validatePassword(password);
		const invalidChars = !passwordIsValid && password.length >= 8 && password.length <= 50;
		const invalidLength = !passwordIsValid && !invalidChars;
		const confirmPasswordError = password !== confirmPassword;

		this.setState({
			emailError: !emailIsValid,
			confirmEmailError: !confirmIsValid,
			legalConsentNotCheckedError: !legalConsentChecked,
			passwordInvalidError: invalidChars,
			passwordLengthError: invalidLength,
			validateInput: true,
		});

		if (!emailIsValid || !confirmIsValid || !legalConsentChecked || !passwordIsValid || confirmPasswordError) {
			return;
		}
		const { actions } = this.props;
		actions.setToast({
			toastMessage: '',
			toastClass: ''
		});
		actions.register(email, confirmEmail, firstName, lastName, password).then((success) => {
			if (success) {
				// User is automatically logged in, and redirected to the logged in view of BrowserCreateAccountForm
				actions.getUser().then(() => {
					if (isUpdatesChecked) actions.handleEmailPreferencesCheckboxChange('global', isUpdatesChecked);
				});
				// Toggle legal consent checked here
				actions.setToast({
					toastMessage: t('hub_create_account_toast_success'),
					toastClass: 'success'
				});
			} else {
				actions.setToast({
					toastMessage: t('hub_create_account_toast_error'),
					toastClass: 'alert'
				});
			}
		});
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Create Account View of the Hub app
	 */
	render() {
		// const { user } = this.props;
		const {
			email,
			emailError,
			confirmEmail,
			confirmEmailError,
			firstName,
			lastName,
			legalConsentChecked,
			legalConsentNotCheckedError,
			isUpdatesChecked,
			password,
			passwordInvalidError,
			passwordLengthError,
			confirmPassword,
			confirmPasswordError
		} = this.state;

		return (
			<BrowserCreateAccountForm
				email={email}
				emailError={emailError}
				confirmEmail={confirmEmail}
				confirmEmailError={confirmEmailError}
				firstName={firstName}
				lastName={lastName}
				legalConsentChecked={legalConsentChecked}
				legalConsentNotCheckedError={legalConsentNotCheckedError}
				password={password}
				passwordInvalidError={passwordInvalidError}
				passwordLengthError={passwordLengthError}
				confirmPassword={confirmPassword}
				confirmPasswordError={confirmPasswordError}
				handleInputChange={this._handleInputChange}
				handleLegalConsentCheckboxChange={this._handleLegalConsentCheckboxChange}
				handleSubmit={this._handleCreateAccountAttempt}
				isUpdatesChecked={isUpdatesChecked}
				handleUpdatesCheckboxChange={this._handleUpdatesCheckboxChange}
			/>
		);
	}
}

// PropTypes ensure we pass required props of the correct type
CreateAccountFormContainer.propTypes = {
	actions: PropTypes.shape({
		setToast: PropTypes.func.isRequired,
		register: PropTypes.func.isRequired,
		getUser: PropTypes.func.isRequired,
	}).isRequired,
};

export default CreateAccountFormContainer;
