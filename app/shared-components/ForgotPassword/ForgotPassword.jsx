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
import { validateEmail } from '../../../src/utils/utils';
/**
 * @class Implement shared Forgot Password view which opens from the link on Sign In page inside the panel and hub
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
			const { email } = this.state;
			const { locale } = this.props;

			// validate the email and password
			if (!validateEmail(email)) {
				this.setState({
					emailError: true,
					loading: false,
				});
				return;
			}

			this.props.actions.resetPassword(email)
				.then((success) => {
					this.setState({ loading: false });
					if (success && locale === 'hub') {
						this.props.history.push('/log-in');

						this.props.actions.setToast({
							toastMessage: t('banner_check_your_email_title'),
							toastClass: 'success',
						});
					} else if (success && locale === 'panel') {
						this.props.history.push('/login');
					}
				});
		});
	}

	/**
	 * Render Forgot Password panel.
	 * @return {ReactComponent}   ReactComponent instance
	 */
	render() {
		const { email, loading, emailError } = this.state;
		const { locale } = this.props;
		const buttonClasses = ClassNames('button ghostery-button', { loading });

		const ContainerClassNames = ClassNames('', {
			'forgot-password-panel': locale === 'panel',
			ForgotPasswordView: locale === 'hub',
		});
		const MessageClassNames = ClassNames('', {
			'forgot-password-message': locale === 'panel',
			ForgotPasswordMessage: locale === 'hub',
		});
		const EmailClassNames = ClassNames('', {
			'forgot-input-email': locale === 'panel',
			ForgotPasswordMessage: locale === 'hub',
		});

		const ButtonsContainerClassNames = ClassNames('row', {
			'buttons-container': locale === 'panel',
			ForgotPasswordButtonsContainer: locale === 'hub',
		});
		return (
			<div id={ContainerClassNames}>
				<div className="row align-center">
					<div className="small-11 medium-8 columns">
						<form onSubmit={this.handleSubmit}>
							<h4 id={MessageClassNames}>
								{ t('forgot_password_message') }
							</h4>
							<div id="forgot-email" className={(emailError ? 'panel-error invalid-email' : '')}>
								<label htmlFor={EmailClassNames}>
									{ t('email_colon') }
									<span className="asterisk">*</span>
									<input onChange={this.handleInputChange} value={email} id={EmailClassNames} type="text" name="email" pattern=".{1,}" autoComplete="off" required />
								</label>
								<p className="invalid-email warning">
									{ t('invalid_email_forgot') }
								</p>
								<p className="not-found-error warning">
									{ t('error_email_forgot') }
								</p>
							</div>
							<div className={ButtonsContainerClassNames}>
								<div className="small-6 columns text-center">
									<Link to="/login" id="forgot-password-cancel" className="cancel button hollow">
										{ t('button_cancel') }
									</Link>
								</div>
								<div className="small-6 columns text-center">
									<button type="submit" id="send-button" className={buttonClasses}>
										<span className="title">{ t('send_button_label') }</span>
										<span className="loader" />
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
