/**
 * Log In View Container
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
import { NavLink } from 'react-router-dom';
import ClassNames from 'classnames';
import PropTypes from 'prop-types';
import { ExitButton } from '../../../shared-components';

// Components
import SetupHeader from '../SetupViews/SetupHeader';

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
		loginSuccess,
		loginErrorText,
		handleSubmit,
		handleInputChange,
	} = props;

	const createLoginAlert = ClassNames({
		'create-account-result': true,
		success: loginSuccess,
		error: loginErrorText,
	});
	return (
		<div className="full-height flex-container flex-dir-column">
			<div className="flex-child-grow">
				<div>
					<ExitButton hrefExit="/" textExit={t('exit_sign_in')} />
					<SetupHeader
						title={t('setup_sign_in')}
						titleImage="/app/images/hub/account/ghosty-account.svg"
					/>
					<div className="row align-center account-content">
						<div className={createLoginAlert}>
							{loginErrorText || (loginSuccess ? `${t('panel_signin_success')} ${email}` : '')}
						</div>
						<form onSubmit={handleSubmit}>
							<div className="LogIn">
								<div className="row">
									<div className="columns padded">
										<div className={(emailError ? 'panel-error' : '')}>
											<label htmlFor="create-account-email" className="flex-container flex-dir-column">
												<div className="flex-child-grow flex-container align-left-middle">{ t('email_field_label') }<span className="asterisk">*</span></div>
												<input
													onChange={handleInputChange}
													value={email}
													id="create-input-email"
													name="email"
													pattern=".{1,}"
													autoComplete="off"
													required
													type="text"
												/>
											</label>
											<p className="warning">{ t('invalid_email_create') }</p>
										</div>
									</div>
								</div>
								<div className="row">
									<div className="columns padded">
										<div className={passwordError ? 'panel-error' : ''}>
											<label htmlFor="create-account-password" className="flex-container flex-dir-column">
												<div className="flex-child-grow flex-container align-left-middle">{ t('create_password_field_label') }<span className="asterisk">*</span></div>
												<input
													onChange={handleInputChange}
													value={password}
													className="create-account-input"
													id="create-account-password"
													name="password"
													pattern=".{1,}"
													required
													type="password"
												/>
											</label>
											<p className="warning">
												<span className={(passwordError ? 'panel-error show' : '')}>
													{ t('password_requirements') }
												</span>
											</p>
										</div>
									</div>
								</div>
								{/*
								<div className="row">
									<div className="columns padded">
										<span className="account-checkbox-container" onClick={this.handleCheckboxChange}>
											<img src={CheckboxImagePath} className='account-checkbox' />
											<span>Remember Me</span>
										</span>
									</div>
								</div>
								*/}
								<span className="row account-sign-in">
									<span className="columns padded">
										<NavLink to="/create-account">
											{ t('do_not_have_account') }
										</NavLink>
									</span>
								</span>
								<div className="row">
									<div className="columns wide align-right">
										<button type="submit" className="account-submit">
											<span>{ t('panel_menu_signin') }</span>
										</button>
									</div>
								</div>
							</div>
						</form>
					</div>
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
	loginSuccess: PropTypes.bool.isRequired,
	loginErrorText: PropTypes.string.isRequired,
	handleSubmit: PropTypes.func.isRequired,
	handleInputChange: PropTypes.func.isRequired,
};

export default LogInView;
