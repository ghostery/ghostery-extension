/**
 * Forgot Password Component
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

import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import ClassNames from 'classnames';
import { validateEmail } from '../../panel/utils/utils';
/**
 * @class Implement shared Forgot Password view which opens from the link on Sign In page inside the panel
 * @memberof PanelClasses
 */
class ForgotPassword extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			email: '',
			loading: false,
			emailError: false,
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
	 * Validate entered data, notify user if validation fails,
	 * This action is one the PanelActions.
	 */
	handleSubmit = (e) => {
		e.preventDefault();
		this.setState({ loading: true }, () => {
			const email = this.state.email?.trim();

			// validate the email and password
			if (!validateEmail(email)) {
				this.setState({
					emailError: true,
					loading: false,
				});
				return;
			}

			const { actions, history } = this.props;
			actions.resetPassword(email)
				.then((success) => {
					this.setState({ loading: false });
					if (success) {
						history.push('/login');
					}
				});
		});
	}

	navigateToLogIn = () => {
		const { history } = this.props;
		history.push('/log-in');
	}

	/**
	 * Render Forgot Password panel.
	 * @return {ReactComponent}   ReactComponent instance
	 */
	render() {
		const { email, loading, emailError } = this.state;
		const buttonClasses = ClassNames('button ghostery-button', {
			loading,
			success: false,
		});
		const ContainerClassNames = ClassNames('', {
			'forgot-password-panel': true,
		});
		const MessageClassNames = ClassNames('', {
			'forgot-password-message': true,
			ForgotPasswordMessage: false,
		});
		const EmailClassNames = ClassNames('', {
			'forgot-input-email': true,
			ForgotPasswordEmail: false,
		});
		const ButtonsContainerClassNames = ClassNames('row', {
			'buttons-container': true,
		});
		const loaderClassNames = ClassNames('loader', {
			success: false
		});
		return (
			<div id={ContainerClassNames}>
				<div className="row align-center">
					<div className="columns small-12">
						<form className="ForgotPasswordForm" onSubmit={this.handleSubmit}>
							<h4 id={MessageClassNames}>
								{t('forgot_password_message')}
							</h4>
							<div id="forgot-email" className={(emailError ? 'panel-error invalid-email' : '')}>
								<label htmlFor={EmailClassNames}>
									{t('email_colon')}
									<span className="asterisk">*</span>
									<input onChange={this.handleInputChange} value={email} id={EmailClassNames} type="text" name="email" pattern=".{1,}" autoComplete="off" required />
								</label>
								<p className="invalid-email warning">
									{t('invalid_email_forgot')}
								</p>
								<p className="not-found-error warning">
									{t('error_email_forgot')}
								</p>
							</div>
							<div className={ButtonsContainerClassNames}>
								<div className="small-6 columns text-center">
									<Link to="/login" id="forgot-password-cancel" className="cancel button hollow">
										{t('button_cancel')}
									</Link>
								</div>
								<div className="small-6 columns text-center">
									<button type="submit" id="send-button" className={buttonClasses}>
										<span className="title">{t('send_button_label')}</span>
										<span className={loaderClassNames} />
									</button>
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
		);
	}
}

export default withRouter(ForgotPassword);
