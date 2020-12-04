/**
 * Browser Log In Form Container
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
import { throttle } from 'underscore';
import { validateEmail } from '../../../../panel/utils/utils';
import Step1_LogInForm from './Step1_LogInForm';

/**
 * @class Implement the Browser Log In Form for the Ghostery Hub
 * @extends Component
 * @memberof HubContainers
 */
class Step1_LogInFormContainer extends Component {
	constructor(props) {
		super(props);
		this.state = {
			email: '',
			password: '',
			emailError: false,
			passwordError: false,
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
			case 'password': {
				this.setState({
					passwordError: !value,
				});
				break;
			}
			default: break;
		}
	}

	/**
	 * Handle logging in, but validate the data first.
	 * @param  {Object} event the 'submit' event
	 */
	_handleLoginAttempt = (event) => {
		event.preventDefault();
		const { email, password } = this.state;
		const emailIsValid = email && validateEmail(email);

		this.setState({
			emailError: !emailIsValid,
			passwordError: !password,
			validateInput: true,
		});

		if (!emailIsValid || !password) {
			return;
		}

		const { actions } = this.props;
		actions.setToast({
			toastMessage: '',
			toastClass: ''
		});
		actions.login(email, password).then((success) => {
			if (success) {
				const { origin, pathname, hash } = window.location;
				window.history.pushState({}, '', `${origin}${pathname}${hash}`);

				actions.getUser();
				actions.getUserSettings()
					.then((settings) => {
						const { current_theme } = settings;
						return actions.getTheme(current_theme);
					});
				actions.setToast({
					toastMessage: t('hub_login_toast_success'),
					toastClass: 'success'
				});
				// Move to second screen
			} else {
				actions.setToast({
					toastMessage: t('no_such_email_password_combo'),
					toastClass: 'alert'
				});
			}
		});
	}

	_unthrottledHandleForgotPassword = (e) => {
		e.preventDefault();
		const { email } = this.state;

		// validate the email and password
		if (!validateEmail(email)) {
			this.setState({
				emailError: true,
			});
			return;
		}

		const { actions } = this.props;
		actions.resetPassword(email)
			.then((success) => {
				if (success) {
					actions.setToast({
						toastMessage: t('banner_check_your_email_title'),
						toastClass: 'success',
					});
				}
			});
	}

	// eslint-disable-next-line react/sort-comp
	_handleForgotPassword = throttle(this._unthrottledHandleForgotPassword, 3000)

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Log In View of the Hub app
	 */
	render() {
		const { loggedIn, user } = this.props;
		const {
			email,
			password,
			emailError,
			passwordError,
		} = this.state;

		return loggedIn ? (
			<SignedInView email={(user && user.email) || 'email'} />
		) : (
			// eslint-disable-next-line react/jsx-pascal-case
			<Step1_LogInForm
				email={email}
				password={password}
				emailError={emailError}
				passwordError={passwordError}
				handleInputChange={this._handleInputChange}
				handleSubmit={this._handleLoginAttempt}
				handleForgotPassword={this._handleForgotPassword}
			/>
		);
	}
}

// PropTypes ensure we pass required props of the correct type
Step1_LogInFormContainer.propTypes = {
	actions: PropTypes.shape({
		setToast: PropTypes.func.isRequired,
		login: PropTypes.func.isRequired,
		getUser: PropTypes.func.isRequired,
		getUserSettings: PropTypes.func.isRequired,
	}).isRequired,
};

export default Step1_LogInFormContainer;
