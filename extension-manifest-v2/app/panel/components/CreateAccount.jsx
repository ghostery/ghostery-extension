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

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { sendMessage, sendMessageInPromise } from '../utils/msg';
import { validateEmail, validatePassword } from '../utils/utils';
import globals from '../../../src/classes/Globals';
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
			passwordInvalidError: false,
			passwordLengthError: false,
			consentChecked: true,
			buttonCursor: 'pointer',
			panelCursor: 'default',
		};

		// event bindings
		this.createAccount = this.createAccount.bind(this);
		this.checkForEnter = this.checkForEnter.bind(this);
		this.updateEmail = this.updateEmail.bind(this);
		this.updateConfirmEmail = this.updateConfirmEmail.bind(this);
		this.updateFirstName = this.updateFirstName.bind(this);
		this.updateLastName = this.updateLastName.bind(this);
		this.updatePassword = this.updatePassword.bind(this);
		this.updateConsentChecked = this.updateConsentChecked.bind(this);
	}
	/**
	 * Lifecycle event
	 */
	componentWillUpdate(nextProps, nextState) {
		// redirect to account success view
		if (nextProps.createAccountSuccess) {
			nextProps.history.push('/account-success');
		} else if (nextProps.createAccountFailed && (this.state.panelCursor !== 'default' || this.state.buttonCursor !== 'pointer')) {
			this.setCursorDefaults();
		}
	}
	/**
	 * Update state with selective defaults for cursors.
	 */
	setCursorDefaults() {
		this.setState({ panelCursor: 'default', buttonCursor: 'pointer' });
	}
	/**
	 * Update state with changed email.
	 * @param {Object}  event 	'change' event
	 */
	updateEmail(event) {
		this.setState({ email: event.target.value });
	}
	/**
	 * Update state with changed confirm email.
	 * @param {Object}  event 	'change' event
	 */
	updateConfirmEmail(event) {
		this.setState({ confirmEmail: event.target.value });
	}
	/**
	 * Update state with changed first name.
	 * @param {Object}  event 	'change' event
	 */
	updateFirstName(event) {
		this.setState({ firstName: event.target.value });
	}
	/**
	 * Update state with changed last name.
	 * @param {Object}  event 	'change' event
	 */
	updateLastName(event) {
		this.setState({ lastName: event.target.value });
	}
	/**
	 * Update state with changed password.
	 * @param {Object}  event 	'change' event
	 */
	updatePassword(event) {
		this.setState({ password: event.target.value });
	}
	/**
	 * Update state with changed consent value.
	 * @param {Object}  event 	'change' event
	 */
	updateConsentChecked(event) {
		this.setState({ consentChecked: event.target.checked });
	}
	/**
	 * Validate input parameters, notify user if they have to be
	 * updated. If the data is valid trigger createAccount action
	 * to be processed by PanelActions.
	 */
	createAccount() {
		const email = this.state.email.toLowerCase();
		const confirmEmail = this.state.confirmEmail.toLowerCase();
		const {
			firstName,
			lastName,
			password
		} = this.state;

		const VERIFICATION_URL = `https:\/\/signon.${globals.GHOSTERY_DOMAIN}.com/register/verify/`; // can't set culture query parameter because site needs to append guid
		const REDIRECT_URL = `https:\/\/account.${globals.GHOSTERY_DOMAIN}.com/`;

		// update cursors
		this.setState({ panelCursor: 'wait' });
		this.setState({ buttonCursor: 'wait' });

		// validate the email and password
		if (!validateEmail(email)) {
			this.setState({ emailError: true, panelCursor: 'default', buttonCursor: 'pointer' });
			return;
		} else if (!validateEmail(confirmEmail)) {
			this.setState({ confirmEmailError: true, panelCursor: 'default', buttonCursor: 'pointer' });
			return;
		} else if (!validatePassword(password)) {
			if (password.length >= 8 && password.length <= 50) {
				this.setState({ passwordInvalidError: true, panelCursor: 'default', buttonCursor: 'pointer' });
			} else {
				this.setState({ passwordLengthError: true, panelCursor: 'default', buttonCursor: 'pointer' });
			}
			return;
		}

		this.props.actions.register(email, confirmEmail, firstName, lastName, password).then((success) => {
			if (success) {
				this.props.actions.getUser();
			}
		});
	}
	/**
	 * Create account on Return.
	 * @param {Object} e keyboard event
	 */
	checkForEnter(e) {
		if (e.key === 'Enter') {
			this.createAccount();
		}
	}
	/**
	 * Render Create Account panel.
	 * @return {ReactComponent}   ReactComponent instance
	 */
	render() {
		return (
			<div id="create-account-panel" style={{ cursor: this.state.panelCursor }}>
				<div className="row align-center">
					<div className="small-11 medium-8 columns">
						<div className="row">
							<div className="columns">
								<div id="create-account-email" className={(this.state.emailError ? 'panel-error' : '')}>
									<label className="create-account-label" id="create-email-label" htmlFor="create-input-email">
										{ t('email_field_label') }<span className="asterisk">*</span>
										<input onChange={this.updateEmail} onKeyPress={this.checkForEnter} value={this.state.email} className="create-account-input" id="create-input-email" name="email" pattern=".{1,}" autoComplete="off" required type="text" />
									</label>
									<p id="email-invalid" className="warning">
										{ t('invalid_email_create') }
									</p>
								</div>
								<div id="create-account-email-confirm" className={(this.state.confirmEmailError ? 'panel-error' : '')}>
									<label className="create-account-label" id="create-email-confirm-label" htmlFor="create-input-email-confirm">
										{ t('email_confirm_field_label') }<span className="asterisk">*</span>
										<input onChange={this.updateConfirmEmail} onKeyPress={this.checkForEnter} value={this.state.confirmEmail} className="create-account-input" id="create-input-email-confirm" name="emailConfirm" pattern=".{1,}" autoComplete="off" required type="text" />
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
										<input onChange={this.updateFirstName} onKeyPress={this.checkForEnter} value={this.state.firstName} className="create-account-input" id="create-input-first-name" name="firstName" pattern=".{1,}" required type="text" />
									</label>
								</div>
							</div>
							<div className="small-6 columns">
								<div id="create-account-last-name">
									<label className="create-account-label" id="create-last-name-label" htmlFor="create-input-last-name">
										{ t('last_name_field_label') }
										<input onChange={this.updateLastName} onKeyPress={this.checkForEnter} value={this.state.lastName} className="create-account-input" id="create-input-last-name" name="lastName" pattern=".{1,}" required type="text" />
									</label>
								</div>
							</div>
						</div>
						<div className="row">
							<div className="small-12 columns">
								<div id="create-account-password" className={(this.state.passwordInvalidError || this.state.passwordLengthError ? 'panel-error' : '')}>
									<div className="row">
										<div className="columns">
											<label className="create-account-label" id="create-password-label" htmlFor="create-input-password">
												{ t('create_password_field_label') }<span className="asterisk">*</span>
												<input onChange={this.updatePassword} onKeyPress={this.checkForEnter} value={this.state.password} className="create-account-input" id="create-input-password" name="password" pattern=".{1,}" required type="password" />
											</label>
										</div>
									</div>
									<p className="warning">
										<span id="password-length-requirement" className={(this.state.passwordLengthError ? 'panel-error show' : '')}>
											{ t('password_requirements') }
										</span>
										<span id="password-characters-requirement" className={(this.state.passwordInvalidError ? 'panel-error show' : '')}>
											{ t('password_characters_requirements') }
										</span>
									</p>
								</div>
							</div>
						</div>
						<div className="row">
							<div className="small-12 columns">
								<div id="create-account-privacy-container" className={(!this.state.consentChecked ? 'panel-error' : '')}>
									<label htmlFor="accept-privacy" id="accept-privacy-label">
										<input onChange={this.updateConsentChecked} value={this.state.consentChecked} id="accept-privacy" defaultChecked type="checkbox" />
										<span className="callout-text" dangerouslySetInnerHTML={{ __html: t('account_creation_privacy_statement') }} />
									</label>
									<p id="accept-privacy-requirement" className="warning">
										{ t('consent_privacy') }
									</p>
								</div>
								<div id="account-creation-buttons" className="row align-center">
									<div className="small-6 columns text-center">
										<Link to={(this.props.is_expert ? '/detail' : '/')} id="create-account-cancel" className="cancel button hollow">
											{ t('button_cancel') }
										</Link>
									</div>
									<div className="small-6 columns text-center">
										<div onClick={this.createAccount} id="create-account-button" className={`${!this.state.consentChecked ? 'disabled' : ''} button`} style={{ cursor: this.state.buttonCursor }}>
											{ t('panel_title_create_account') }
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default CreateAccount;
