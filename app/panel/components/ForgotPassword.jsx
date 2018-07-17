/**
 * Forgot Password Component
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
import { validateEmail } from '../utils/utils';
import globals from '../../../src/classes/Globals';
/**
 * @class Implement Forgot Password view which opens from the link on Sign In panel.
 * @memberof PanelClasses
 */
class ForgotPassword extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			email: '',
			emailError: false,
			buttonCursor: 'pointer',
			panelCursor: 'default',
		};

		// event bindings
		this.sendEmail = this.sendEmail.bind(this);
		this.updateEmail = this.updateEmail.bind(this);
		this.checkForEnter = this.checkForEnter.bind(this);
	}
	/**
	 * Lifecycle event
	 */
	componentWillUpdate(nextProps, nextState) {
		// redirect to login view on success
		if (nextProps.forgotPasswordSuccess) {
			nextProps.history.push('/login');
		} else if (nextProps.forgotPasswordFailed && (this.state.panelCursor !== 'default' || this.state.buttonCursor !== 'pointer')) {
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
	 * Update state with provided email.
	 */
	updateEmail(event) {
		this.setState({ email: event.target.value });
	}

	/**
	 * Validate entered data, notify user if validation fails,
	 * This action is one the PanelActions.
	 */
	sendEmail() {
		const email = this.state.email.toLowerCase();

		// update cursors
		this.setState({ panelCursor: 'wait' });
		this.setState({ buttonCursor: 'wait' });

		// validate the email and password
		if (!validateEmail(email)) {
			this.setState({ emailError: true, panelCursor: 'default', buttonCursor: 'pointer' });
			return;
		}

		this.props.actions.resetPassword(email);
	}
	/**
	 * Create account on Return.
	 * @param {Object} e keyboard event
	 */
	checkForEnter(e) {
		if (e.key === 'Enter') {
			this.sendEmail();
		}
	}
	/**
	 * Render Forgot Password panel.
	 * @return {ReactComponent}   ReactComponent instance
	 */
	render() {
		return (
			<div id="forgot-password-panel" style={{ cursor: this.state.panelCursor }}>
				<div className="row align-center">
					<div className="small-11 medium-8 columns">
						<h4 id="forgot-password-message">
							{ t('forgot_password_message') }
						</h4>
						<div id="forgot-email" className={(this.state.emailError ? 'panel-error invalid-email' : (this.props.emailNotFound ? 'panel-error not-found-error' : ''))}>
							<label htmlFor="forgot-input-email">
								{ t('email_field_label') }<span className="asterisk">*</span>
								<input onChange={this.updateEmail} onKeyPress={this.checkForEnter} id="forgot-input-email" type="text" name="email" pattern=".{1,}" autoComplete="off" required />
							</label>
							<p className="invalid-email warning">
								{ t('invalid_email_forgot') }
							</p>
							<p className="not-found-error warning">
								{ t('error_email_forgot') }
							</p>
						</div>
						<div className="buttons-container row">
							<div className="small-6 columns text-center">
								<Link to="/login" id="forgot-password-cancel" className="cancel button hollow">
									{ t('button_cancel') }
								</Link>
							</div>
							<div className="small-6 columns text-center">
								<div onClick={this.sendEmail} id="send-button" className="button" style={{ cursor: this.state.buttonCursor }}>
									{ t('send_button_label') }
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default ForgotPassword;
