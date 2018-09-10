/**
 * LogIn View Container
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

import React, { Component } from 'react';
import { validateEmail } from '../../../panel/utils/utils';
import LogInView from './LogInView';
import SignedInView from '../SignedInView';
import { ToastMessage } from '../../../shared-components';
/**
 * @class Implement the Log In View for the Ghostery Hub
 * @extends Component
 * @memberof HubContainers
 */
class LogInViewContainer extends Component {
	constructor(props) {
		super(props);
		this.state = {
			email: '',
			password: '',
			emailError: false,
			passwordError: false,
			toastMessage: '',
			toastClass: ''
		};
	}

	/**
	 * Update input values by updating state.
	 * @param  {Object} event the 'change' event
	 */
	_handleInputChange = (event) => {
		const { name, value } = event.target;
		this.setState({ [name]: value });

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
		});

		if (!emailIsValid || !password) {
			return;
		}

		this.setState({
			toastMessage: t('hub_login_toast_attempt'),
			toastClass: 'success'
		});
		this.props.actions.login(email, password).then((success) => {
			if (success) {
				const { origin, pathname, hash } = window.location;
				window.history.pushState({}, '', `${origin}${pathname}${hash}`);
				this.setState({
					toastMessage: t('hub_login_toast_success'),
					toastClass: 'success'
				});
				this.props.actions.getUser();
			} else {
				this.setState({
					toastMessage: t('hub_login_toast_error'),
					toastClass: 'alert'
				});
			}
		});
	}

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
			toastMessage,
			toastClass,
		} = this.state;
		const logInChildProps = {
			email,
			password,
			emailError,
			passwordError,
			handleInputChange: this._handleInputChange,
			handleSubmit: this._handleLoginAttempt,
		};
		const signedInChildProps = {
			email: user && user.email || 'email',
		};

		return (
			<div>
				<ToastMessage toastText={toastMessage} toastClass={toastClass} />
				{loggedIn ? (
					<SignedInView {...signedInChildProps} />
				) : (
					<LogInView {...logInChildProps} />
				)}
			</div>
		);
	}
}

export default LogInViewContainer;
