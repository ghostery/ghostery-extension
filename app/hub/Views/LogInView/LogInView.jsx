/**
 * LogIn View
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
import ClassNames from 'classnames';
import { NavLink } from 'react-router-dom';

/**
 * A Functional React component for rendering the Login View
 * @return {JSX} JSX for rendering the Login View of the Hub app
 * @memberof HubComponents
 */
const LogInView = (props) => {
	const {
		email,
		password,
		emailError,
		passwordError,
		handleSubmit,
		handleInputChange,
	} = props;

	const emailInputClassNames = ClassNames('LogInView__inputBox', {
		error: emailError,
	});
	const passwordInputClassNames = ClassNames('LogInView__inputBox', {
		error: passwordError,
	});

	return (
		<div className="LogInView">
			<div className="LogInView--addPaddingTop row align-center">
				<div className="columns">
					<div className="LogInView__header flex-container align-center-middle">
						<img className="LogInView__headerImage" src="/app/images/hub/account/ghosty-account.svg" />
						<div className="LogInView__headerTitle text-center">
							<h3>
								{t('hub_login_header_title')}
							</h3>
						</div>
					</div>
				</div>
			</div>
			<div className="LogInView--addPaddingTop row align-center">
				<div className="columns small-12 medium-10 large-6">
					<form onSubmit={handleSubmit}>
						<label htmlFor="login-email" className="LogInView__inputLabel">
							{t('hub_login_label_email')}
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
						{emailError && (
							<div className="LogInView__inputError">
								{t('hub_login_label_email_invalid')}
							</div>
						)}
						<label htmlFor="login-password" className="LogInView__inputLabel">
							{t('hub_login_label_password')}
						</label>
						<input
							id="login-password"
							className={passwordInputClassNames}
							name="password"
							type="password"
							value={password}
							onChange={handleInputChange}
							pattern=".{1,}"
						/>
						{passwordError && (
							<div className="LogInView__inputError">
								{t('hub_login_label_password_invalid')}
							</div>
						)}
						<div className="flex-container align-center">
							<span className="LogInView__link text-center">
								{ t('hub_login_link_dont_have_account') }
								&nbsp;
								<NavLink to="/create-account">
									{ t('hub_login_link_create_account') }
								</NavLink>
							</span>
						</div>
						<div className="LogInView--addPaddingTop flex-container align-center">
							<button type="submit" className="LogInView__button button success">
								{ t('hub_login_button_submit') }
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

// PropTypes ensure we pass required props of the correct type
LogInView.propTypes = {
	email: PropTypes.string.isRequired,
	password: PropTypes.string.isRequired,
	emailError: PropTypes.bool.isRequired,
	passwordError: PropTypes.bool.isRequired,
	handleSubmit: PropTypes.func.isRequired,
	handleInputChange: PropTypes.func.isRequired,
};

export default LogInView;
