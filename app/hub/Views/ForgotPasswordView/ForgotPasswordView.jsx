/**
 * Forgot Password View
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
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import ClassNames from 'classnames';
/**
 * @class Implement Forgot Password view which opens from the link on log-in page in the intro hub.
 * @memberof HubComponents
 */
const ForgotPasswordView = (props) => {
	const {
		email,
		emailError,
		handleInputChange,
		handleSubmit,
		loading
	} = props;
	const emailLabelClassNames = ClassNames('ForgotPasswordView__inputLabel', {
		error: emailError
	});
	const emailInputClassNames = ClassNames('ForgotPasswordView__inputBox', {
		error: emailError
	});
	const emailAsteriskClassNames = ClassNames('ForgotPasswordView__asterisk', {
		error: emailError
	});
	const buttonClasses = ClassNames('ForgotPasswordView__button button success', { loading });
	return (
		<div className="ForgotPasswordView">
			<div className="ForgotPasswordView--addPaddingTop row align-center">
				<div className="columns">
					<div className="ForgotPasswordView__header flex-container align-center-middle">
						<div className="ForgotPasswordView__headerTitle text-center">
							<h3>
								{t('forgot_password_message')}
							</h3>
						</div>
					</div>
				</div>
			</div>
			<div className="ForgotPasswordView--addPaddingTop row align-center">
				<div>
					<form onSubmit={handleSubmit}>
						<label htmlFor="login-email" className={emailLabelClassNames}>
							{t('email_colon')}
							<span className={emailAsteriskClassNames}>*</span>
						</label>
						<input
							id="login-email"
							className={emailInputClassNames}
							name="email"
							type="text"
							value={email}
							onChange={handleInputChange}
							pattern=".{1,}"
							autoComplete="off"
						/>
						{props.emailError && (
							<div className="ForgotPasswordView__inputError">
								{t('invalid_email_forgot')}
							</div>
						)}
						<div className="ForgotPasswordView--addPaddingTop row align-spaced">
							<div className="ForgotPasswordView__linkContainer">
								<p className="ForgotPasswordView__link">
									<NavLink to="/log-in">
										{t('button_cancel')}
									</NavLink>
								</p>
							</div>
							<button type="submit" className={buttonClasses}>
								<span className="title">{t('send_button_label')}</span>
								<span className="loader" />
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

// PropTypes ensure we pass required props of the correct type
ForgotPasswordView.propTypes = {
	email: PropTypes.string.isRequired,
	emailError: PropTypes.bool.isRequired,
	loading: PropTypes.bool.isRequired,
};

export default ForgotPasswordView;
