/**
 * Create Account View Container
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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
	validateEmail,
	validatePassword,
	validateEmailsMatch,
	validateConfirmEmail
} from '../../../panel/utils/utils';
import CreateAccountView from './CreateAccountView';
import SignedInView from '../SignedInView';

/**
 * @class Implement the Create Account View for the Ghostery Hub
 * @extends Component
 * @memberof HubContainers
 */
class CreateAccountViewContainer extends Component {
	constructor(props) {
		super(props);
		this.state = {
			email: '',
			emailError: false,
			confirmEmail: '',
			confirmEmailError: false,
			firstName: '',
			lastName: '',
			password: '',
			passwordInvalidError: false,
			passwordLengthError: false,
			promotionsChecked: true,
			validateInput: false,
		};

		this.props.actions.setToast({
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

		if (!this.state.validateInput) {
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
			default: break;
		}
	}

	/**
	 * Update input checkbox values by updating state.
	 */
	_handleCheckboxChange = () => {
		const promotionsChecked = !this.state.promotionsChecked;
		this.setState({ promotionsChecked });
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
			password,
			promotionsChecked
		} = this.state;
		const emailIsValid = email && validateEmail(email);
		const confirmIsValid = confirmEmail && validateConfirmEmail(email, confirmEmail);
		const passwordIsValid = password && validatePassword(password);
		const invalidChars = !passwordIsValid && password.length >= 8 && password.length <= 50;
		const invalidLength = !passwordIsValid && !invalidChars;

		this.setState({
			emailError: !emailIsValid,
			confirmEmailError: !confirmIsValid,
			passwordInvalidError: invalidChars,
			passwordLengthError: invalidLength,
			validateInput: true,
		});

		if (!emailIsValid || !confirmIsValid || !passwordIsValid) {
			return;
		}
		this.props.actions.setToast({
			toastMessage: '',
			toastClass: ''
		});
		this.props.actions.register(email, confirmEmail, firstName, lastName, password).then((success) => {
			if (success) {
				this.props.actions.updateAccountPromotions(promotionsChecked);
				this.props.actions.getUser();
				this.props.actions.setToast({
					toastMessage: t('hub_create_account_toast_success'),
					toastClass: 'success'
				});
				this.props.history.push('/');
			} else {
				this.props.actions.setToast({
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
		const { loggedIn, user } = this.props;
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
		} = this.state;
		const createAccountChildProps = {
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
			handleInputChange: this._handleInputChange,
			handleCheckboxChange: this._handleCheckboxChange,
			handleSubmit: this._handleCreateAccountAttempt
		};
		const signedInChildProps = {
			email: user && user.email || email,
		};

		return loggedIn ? (
			<SignedInView {...signedInChildProps} />
		) : (
			<CreateAccountView {...createAccountChildProps} />
		);
	}
}

// PropTypes ensure we pass required props of the correct type
CreateAccountViewContainer.propTypes = {
	actions: PropTypes.shape({
		setToast: PropTypes.func.isRequired,
		register: PropTypes.func.isRequired,
		getUser: PropTypes.func.isRequired,
		updateAccountPromotions: PropTypes.func.isRequired,
	}).isRequired,
};

export default CreateAccountViewContainer;
