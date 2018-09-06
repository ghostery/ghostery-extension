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

import React, { Component } from 'react';
import RSVP from 'rsvp';
import { validateEmail, validatePassword, validateConfirmEmail } from '../../../panel/utils/utils';
import { sendMessage } from '../../../panel/utils/msg';
import CreateAccountView from './CreateAccountView';

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
			createAccountSuccess: false,
			createAccountErrorText: '',
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
	 * Update state with changed checkbox value.
	 */
	handleCheckboxChange = () => {
		const promotionsChecked = !this.state.promotionsChecked;
		this.setState({ promotionsChecked });
		if (this.state.createAccountSuccess) {
			sendMessage('account.promotions', promotionsChecked);
		}
	}

	/**
	 * Validate input parameters, notify user if they have to be
	 * updated. If the data is valid trigger createAccount action
	 * to be processed by PanelActions.
	 */
	handleSubmit = (e) => {
		e.preventDefault();
		this.setState({
			createAccountSuccess: false,
			createAccountErrorText: '',
			confirmEmailError: false,
			passwordInvalidError: false,
			passwordLengthError: false,
		}, () => {
			const {
				email, confirmEmail, firstName, lastName, password, promotionsChecked
			} = this.state;
			if (!validateEmail(email)) {
				this.setState({
					emailError: true,
				});
				return;
			}
			if (!validateConfirmEmail(email, confirmEmail)) {
				this.setState({
					confirmEmailError: true,
				});
				return;
			}
			if (!validatePassword(password)) {
				if (password.length >= 8 && password.length <= 50) {
					this.setState({
						passwordInvalidError: true,
					});
				} else {
					this.setState({
						passwordLengthError: true,
					});
				}
				return;
			}
			this.props.actions.register(email, confirmEmail, firstName, lastName, password).then((success) => {
				if (success) {
					new RSVP.Promise((resolve, reject) => {
						this.props.actions.getUser()
							.then((getUserSuccess) => {
								if (getUserSuccess) {
									this.setState({
										createAccountSuccess: true,
									}, () => {
										if (promotionsChecked) {
											sendMessage('account.promotions', true);
										}
										this.props.history.push('/');
										resolve();
									});
								} else {
									reject();
								}
								reject();
							})
							.catch(() => {
								this.setState({
									createAccountErrorText: t('create_account_error'),
								});
								resolve();
							});
					})
						.finally(() => {});
				} else {
					this.setState({
						createAccountErrorText: t('create_account_error'),
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
		const childProps = Object.assign({}, this.state, {
			handleInputChange: this.handleInputChange,
			handleCheckboxChange: this.handleCheckboxChange,
			handleSubmit: this.handleSubmit
		});
		return <CreateAccountView {...childProps} />;
	}
}

export default CreateAccountViewContainer;
