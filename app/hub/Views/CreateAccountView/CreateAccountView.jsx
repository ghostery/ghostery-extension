/**
 * Create Account View Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2018 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 *
 * ToDo: Update this file.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { NavLink, Route } from 'react-router-dom';
import ClassNames from 'classnames';
import RSVP from 'rsvp';
import { validateEmail, validatePassword } from '../../../panel/utils/utils';
import {sendMessage} from '../../../panel/utils/msg';

// Components
import SetupHeader from '../SetupViews/SetupHeader';
/**
 * A Functional React component for rendering the Setup Blocking View
 * @return {JSX} JSX for rendering the Setup Blocking View of the Hub app
 * @memberof HubComponents
 */
class CreateAccountView extends React.Component {
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
		this.setState({promotionsChecked});
		if(this.state.createAccountSuccess) {
			sendMessage("account.promotions", promotionsChecked);
		}
	}

	/**
	 * Helper to extract text error from errors object returned by actions.
	 */
	_actionErrorsToText = errors=> {
		return (errors && errors.length === 1 && errors[0].detail) || t('create_account_error');
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
			this.setState({ 
					loading: true, 
					createAccountSuccess: false,
					createAccountErrorText: '',
					confirmEmailError: false,
					passwordInvalidError: false,
					passwordLengthError: false,
				 }, () => {
				if (!validateEmail(email)) {
					this.setState({
						emailError: true,
						loading: false,
					});
					return;
				}
				if (!validateEmail(confirmEmail)) {
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
				this.props.actions.register(email, confirmEmail, firstName, lastName, password).then(result => {
					console.log("RESULT", result);
					const success = (result === true);
					if (success) {
						new RSVP.Promise((resolve, reject) => {
							this.props.actions.getUser()
								.then(res => {
									const {errors} = res;
									if(errors) {
										reject(new Error(this._actionErrorsToText(errors)));
									} else {
										this.setState({
											loading: false,
											createAccountSuccess: true, 
										}, () => {
											if(this.state.promotionsChecked) {
												sendMessage("account.promotions", true);
											}
										});
									}
									resolve();
									console.log("CREATE ACCOUNT AND GET USER SUCCEDED");
								})
								.catch(err => {
									this.setState({ 
										loading: false,
										createAccountErrorText: err || t('create_account_error')
									});

									resolve();
								});
						})
						.finally(() =>{});
					} else {
						this.setState({ 
							loading: false,
							createAccountErrorText: this._actionErrorsToText(result),
						});
					}
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
			email, confirmEmail, firstName, lastName, password, consentChecked, loading, emailError, confirmEmailError, 
			passwordInvalidError, passwordLengthError, createAccountErrorText, createAccountSuccess
		} = this.state;
		console.log("CREATE ACCOUNT SUCCESS", createAccountSuccess);
		console.log("CREATE ACCOUNT ERROR", createAccountErrorText);
		const createAccountAlert = ClassNames({
			'create-account-result': true, 
			'success': createAccountSuccess || false, 
			'error': !!createAccountErrorText || false
		});
		const CheckboxImagePath = this.state.promotionsChecked ? '/app/images/hub/account/account-checkbox-on.svg' : '/app/images/hub/account/account-checkbox-off.svg';
		return (
			<div className="full-height flex-container flex-dir-column">
				<div className="flex-child-grow">
					<div>
						<SetupHeader  
							title = { t('setup_create_account') }
							titleImage = {"/app/images/hub/account/ghosty-account.svg" } 
						/>
						<div className="row align-center account-content">
							<div className={createAccountAlert}>
								{createAccountErrorText ? createAccountErrorText : createAccountSuccess ? 'Account Created' : ''}
							</div>
							<form onSubmit={this.handleSubmit}>
								<div className="CreateAccount">
									<div className="row" style={{border: 'red solid 1px'}}>
										<div className="columns" style={{border: 'green solid 1px'}}>
											<div className={(emailError ? 'panel-error' : '')}>
												<label htmlFor="create-account-email" className="flex-container flex-dir-column">
													<div className="flex-child-grow flex-container align-left-middle">{ t('email_field_label') }<span className="asterisk">*</span></div>
													<input
														onChange={this.handleInputChange}
														value={email}
														id="create-input-email" 
														name="email" 
														pattern=".{1,}" 
														autoComplete="off" 
														required 
														type="text" 
														style={{border: 'green solid 1px'}}
													/>
												</label>
												<p className="warning">{ t('invalid_email_create') }</p>												
											</div>
										</div>
										<div className="columns" style={{border: 'green solid 1px'}}>
											<div className={(confirmEmailError ? 'panel-error' : '')}>
												<label htmlFor="create-input-email-confirm" className="flex-container flex-dir-column">
													<div className="flex-child-grow flex-container align-left-middle">{ t('email_confirm_field_label') }<span className="asterisk">*</span></div>
													<input
														onChange={this.handleInputChange} 
														value={confirmEmail} 
														id="create-input-email-confirm" 
														name="confirmEmail" 
														pattern=".{1,}" 
														autoComplete="off" 
														required 
														type="text"
													/>
												</label>
												<p className="warning">{ t('invalid_email_confirmation') }</p>
											</div>
										</div>
									</div>
									<div className="row" style={{border: 'red solid 1px'}}>
										<div className="columns" style={{border: 'green solid 1px'}}>
											<div>
												<label htmlFor="ccreate-input-first-name" className="flex-container flex-dir-column">
													<div className="flex-child-grow flex-container align-left-middle">{ t('first_name_field_label') }</div>
													<input 
														onChange={this.handleInputChange} 
														value={firstName} 
														id="create-input-first-name" 
														name="firstName" 
														pattern=".{1,}" 
														type="text" 
													/>
												</label>
											</div>
										</div>
										<div className="columns style={{border: 'green solid 1px'}}">
											<div>
												<label htmlFor="create-input-last-name" className="flex-container flex-dir-column">
													<div className="flex-child-grow flex-container align-left-middle">{ t('last_name_field_label') }</div>
													<input 
														onChange={this.handleInputChange} 
														value={lastName} 
														id="create-input-last-name" 
														name="lastName" 
														pattern=".{1,}" 
														type="text" 
													/>
												</label>
											</div>
										</div>		
									</div>
									<div className="row" style={{border: 'red solid 1px'}}>
										<div className="columns" style={{border: 'green solid 1px'}}>
											<div className={(passwordInvalidError || passwordLengthError ? 'panel-error' : '')}>
												<label htmlFor="create-account-password" className="flex-container flex-dir-column">
													<div className="flex-child-grow flex-container align-left-middle">{ t('create_password_field_label') }<span className="asterisk">*</span></div>
													<input 
														onChange={this.handleInputChange} 
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
													<span className={(passwordLengthError ? 'panel-error show' : '')}>
														{ t('password_requirements') }
													</span>
													<span className={(passwordInvalidError ? 'panel-error show' : '')}>
														{ t('password_characters_requirements') }
													</span>
												</p>								
											</div>
										</div>
										<div className="columns" style={{border: 'green solid 1px'}}>
											<span className="account-checkbox-container" onClick={this.handleCheckboxChange}>
												<img src={CheckboxImagePath} className='account-checkbox' />
												<span>{ t('create_account_promotions') }</span>
											</span>
										</div>		
									</div>
									<span className="row account-sign-in" style={{border: 'red solid 1px'}}>
										<span className="columns" style={{border: 'green solid 1px'}}>
											<NavLink to='/log-in'>
												{ t('account_already_present') }
											</NavLink>
										</span>
									</span>
									<div className="row align-right" style={{border: 'red solid 1px'}}>
										<button type="submit" className="account-submit">
											<span>{ t('panel_title_create_account') }</span>
										</button>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

// PropTypes ensure we pass required props of the correct type
CreateAccountView.propTypes = {
};

export default CreateAccountView;

