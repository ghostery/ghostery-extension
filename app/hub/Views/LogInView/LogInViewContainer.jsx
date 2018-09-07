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
import RSVP from 'rsvp';
import { validateEmail } from '../../../panel/utils/utils';
import LogInView from './LoginView';
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
			loginSuccess: false,
			loginErrorText: '',
		};
	}

	/**
	 * Update state with changed values.
	 * @param {Object}  event 	'change' event
	 */
	handleInputChange = (e) => {
		const { name, value } = e.target;
		this.setState({ [name]: value });
	}

	/**
	 * Validate entered login data and, if it is good, trigger Login action.
	 */
	handleSubmit = (e) => {
		e.preventDefault();
		const { email, password } = this.state;
		const emailIsValid = email && validateEmail(email);

		this.setState({
			emailError: !emailIsValid,
			passwordError: !password,
		});

		if (!emailIsValid || !password) { return; }

		this.setState({
			loginErrorText: '',
			loginSuccess: false,
		}, () => {
			this.props.actions.login(email, password)
				.then((success) => {
					if (success) {
						new RSVP.Promise((resolve, reject) => {
							this.props.actions.getUser()
								.then((getUserSuccess) => {
									if (getUserSuccess) {
										this.props.actions.getUserSettings()
											.then((getUserSettingsSuccess) => {
												if (getUserSettingsSuccess) {
													this.setState({
														loginSuccess: true,
													});
													resolve();
													this.props.history.push('/');
												} else {
													reject();
												}
											});
									} else {
										reject();
									}
								})
								.catch(() => {
									this.setState({
										loginErrorText: t('banner_no_such_account_message'),
									});
								});
						})
							.finally(() => {});
					} else {
						this.setState({
							loginErrorText: t('banner_no_such_account_message'),
						});
					}
				});
		});
	}
	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Log In View of the Hub app
	 */
	render() {
		const childProps = Object.assign({}, this.state, { handleInputChange: this.handleInputChange, handleSubmit: this.handleSubmit });
		return <LogInView {...childProps} />;
	}
}

export default LogInViewContainer;
