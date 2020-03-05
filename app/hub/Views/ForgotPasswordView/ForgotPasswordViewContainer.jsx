/**
 * Forgot Password View Container
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
import { validateEmail } from '../../../../src/utils/utils';
import ForgotPasswordView from './ForgotPasswordView';

/**
 * @class Implement the Forgot Password View for the Ghostery Hub
 * @extends Component
 * @memberof HubContainers
 */
class ForgotPasswordViewContainer extends Component {
	constructor(props) {
		super(props);
		this.state = {
			email: '',
			emailError: false,
			loading: false,
		};
	}

	/**
	 * Update input values by updating state.
	 * @param  {Object} event the 'change' event
	 */
	handleInputChange = (event) => {
		const { name, value } = event.target;
		this.setState({ [name]: value });
	}

	/**
	 * Forgot Password Submit button
	 * @param  {String} email the account email who's password should be reset
	 */
	handleSubmit = (e) => {
		e.preventDefault();
		this.setState({ loading: true }, () => {
			const { email } = this.state;

			// validate the email and password
			if (!validateEmail(email)) {
				this.setState({
					emailError: true,
					loading: false,
				});
				return;
			}

			// Try to reset the password and display a success/error message
			this.props.actions.resetPassword(email)
				.then((success) => {
					this.setState({ loading: false });
					if (success) {
						this.props.history.push('/log-in');
					}
					this.props.actions.setToast({
						toastMessage: this.props.toastMessage,
						toastClass: this.props.resetPasswordError ? 'alert' : 'success',
					});
				});
		});
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Create Account View of the Hub app
	 */
	render() {
		const { email, emailError, loading } = this.state;
		const childProps = {
			email,
			emailError,
			loading,
			handleInputChange: this.handleInputChange,
			handleSubmit: this.handleSubmit
		};
		return (
			<ForgotPasswordView {...childProps} />
		);
	}
}

// PropTypes ensure we pass required props of the correct type
ForgotPasswordViewContainer.propTypes = {
	actions: PropTypes.shape({
		setToast: PropTypes.func.isRequired,
		resetPassword: PropTypes.func.isRequired,
	}).isRequired,
};

export default ForgotPasswordViewContainer;
