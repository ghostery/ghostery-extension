/**
 * Create Account Component
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
import { Link } from 'react-router-dom';
import ClassNames from 'classnames';
import RSVP from 'rsvp';
import { validateEmail, validateConfirmEmail, validatePassword } from '../utils/utils';

/**
 * @class Implement Create Account view which opens
 * from the link on Sign In panel.
 * @memberOf PanelClasses
 */
class CreateAccount extends React.Component {
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
			loading: false,
			passwordInvalidError: false,
			passwordLengthError: false,
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
	 * Update state with changed consent value.
	 * @param {Object}  event 	'change' event
	 */
	handleCheckboxChange = (e) => {
		const { name, checked } = e.target;
		this.setState({ [name]: checked });
	}

	/**
	 * Validate input parameters, notify user if they have to be
	 * updated. If the data is valid trigger createAccount action
	 * to be processed by PanelActions.
	 */
	handleSubmit = (e) => {
		e.preventDefault();
		this.setState({ loading: true }, () => {
			const {
				email, confirmEmail, firstName, lastName, password
			} = this.state;
			this.setState({ loading: true }, () => {
				if (!validateEmail(email)) {
					this.setState({
						emailError: true,
						loading: false,
					});
					return;
				}
				if (!validateConfirmEmail(email, confirmEmail)) {
					this.setState({
						confirmEmailError: true,
						loading: false,
					});
					return;
				}
				if (!validatePassword(password)) {
					if (password.length >= 8 && password.length <= 50) {
						this.setState({
							passwordInvalidError: true,
							loading: false,
						});
					} else {
						this.setState({
							passwordLengthError: true,
							loading: false,
						});
					}
					return;
				}

				this.setState({
					emailError: false,
					confirmEmailError: false,
					passwordInvalidError: false,
					passwordLengthError: false,
				}, () => {
					this.props.actions.register(email, confirmEmail, firstName, lastName, password).then((success) => {
						this.setState({ loading: false });
						if (success) {
							new RSVP.Promise((resolve) => {
								this.props.actions.getUser()
									.then(() => resolve())
									.catch(() => resolve());
							}).finally(() => {
								this.props.history.push('/account-success');
							});
						}
					});
				});
			});
		});
	}

	/**
	 * Render Create Account panel.
	 * @return {ReactComponent}   ReactComponent instance
	 */
	render() {
		const {
			email, confirmEmail, firstName, lastName, password, loading, emailError, confirmEmailError, passwordInvalidError, passwordLengthError
		} = this.state;
		const buttonClasses = ClassNames('button ghostery-button', { loading });
		return (
			<div id="create-account-panel">
				<div className="row align-center">
					<div className="small-11 medium-8 columns">
						<form onSubmit={this.handleSubmit}>
							<div className="row">
								<div className="columns">
									<div id="create-account-email" className={(emailError ? 'panel-error' : '')}>
										<label className="create-account-label" id="create-email-label" htmlFor="create-input-email">
											{ t('email_field_label') }<span className="asterisk">*</span>
											<input onChange={this.handleInputChange} value={email} className="create-account-input" id="create-input-email" name="email" pattern=".{1,}" autoComplete="off" required type="text" />
										</label>
										<p id="email-invalid" className="warning">
											{ t('invalid_email_create') }
										</p>
									</div>
									<div id="create-account-email-confirm" className={(confirmEmailError ? 'panel-error' : '')}>
										<label className="create-account-label" id="create-email-confirm-label" htmlFor="create-input-email-confirm">
											{ t('email_confirm_field_label') }<span className="asterisk">*</span>
											<input onChange={this.handleInputChange} value={confirmEmail} className="create-account-input" id="create-input-email-confirm" name="confirmEmail" pattern=".{1,}" autoComplete="off" required type="text" />
										</label>
										<p className="warning">{ t('invalid_email_confirmation') }</p>
									</div>
								</div>
							</div>
							<div className="row">
								<div className="small-6 columns">
									<div id="create-account-first-name">
										<label className="create-account-label" id="create-first-name-label" htmlFor="create-input-first-name">
											{ t('first_name_field_label') }
											<input onChange={this.handleInputChange} value={firstName} className="create-account-input" id="create-input-first-name" name="firstName" pattern=".{1,}" type="text" />
										</label>
									</div>
								</div>
								<div className="small-6 columns">
									<div id="create-account-last-name">
										<label className="create-account-label" id="create-last-name-label" htmlFor="create-input-last-name">
											{ t('last_name_field_label') }
											<input onChange={this.handleInputChange} value={lastName} className="create-account-input" id="create-input-last-name" name="lastName" pattern=".{1,}" type="text" />
										</label>
									</div>
								</div>
							</div>
							<div className="row">
								<div className="small-12 columns">
									<div id="create-account-password" className={(passwordInvalidError || passwordLengthError ? 'panel-error' : '')}>
										<div className="row">
											<div className="columns">
												<label className="create-account-label" id="create-password-label" htmlFor="create-input-password">
													{ t('create_password_field_label') }<span className="asterisk">*</span>
													<input onChange={this.handleInputChange} value={password} className="create-account-input" id="create-input-password" name="password" pattern=".{1,}" required type="password" />
												</label>
											</div>
										</div>
										<p className="warning">
											<span id="password-length-requirement" className={(passwordLengthError ? 'panel-error show' : '')}>
												{ t('password_requirements') }
											</span>
											<span id="password-characters-requirement" className={(passwordInvalidError ? 'panel-error show' : '')}>
												{ t('password_characters_requirements') }
											</span>
										</p>
									</div>
								</div>
							</div>
							<div className="row">
								<div className="small-12 columns">
									<div id="create-account-privacy-container">
										<p id="accept-privacy-label" dangerouslySetInnerHTML={{ __html: t('account_creation_privacy_statement') }} />
									</div>
									<div id="account-creation-buttons" className="row align-center">
										<div className="small-6 columns text-center">
											<Link to={(this.props.is_expert ? '/detail' : '/')} id="create-account-cancel" className="cancel button hollow">
												{ t('button_cancel') }
											</Link>
										</div>
										<div className="small-6 columns text-center">
											<button type="submit" id="create-account-button" className={buttonClasses}>
												<span className="title">{ t('panel_title_create_account') }</span>
												<span className="loader" />
											</button>
										</div>
									</div>
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
		);
	}
}

export default CreateAccount;
