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
class LogInView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			email: '',
			password: '',
			loading: false,
			emailError: false,
			passwordError: false,
			loginSuccess: false,
			loginError: false,
			loginErrorText: '',
		//	rememberMeChecked: true,
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
	// handleCheckboxChange = () => {
	// 	const rememberMeChecked = !this.state.rememberMeChecked;
	// 	this.setState({rememberMeChecked});
	// 	if(rememberMeChecked) {
	// 		// action 1
	// 	} else {
	// 		// action 2
	// 	}
	// }
	/**
	 * Validate entered login data and, if it is good, trigger Login action.
	 */
	handleSubmit = (e) => {
		e.preventDefault();
		const { email, password } = this.state;
		const emailIsValid = email && validateEmail(email);

		this.setState({
			emailError: !emailIsValid,
			passwordError: !password,
		});
		if (!emailIsValid || !password) { return; }

// 		////////////////////////////////////////////////////
// 							console.log("RESULT", result);
// 					const success = (result === true);
// 					if (success) {
// 						this.setState({ 
// 							loading: false,
// 							createAccountSuccess: true,
// 						});
// 						new RSVP.Promise((resolve) => {
// 							this.props.actions.getUser()
// 								.then(result => {
// 									const {errors, user} = result;
// 									if(errors || !user) {
// 										this.setState({ 
// 											loading: false,
// 											createAccountSuccess: false,
// 											createAccountErrorText: result[0].detail || "Create Account Error"
// 										});
// 									} else {
// 										this.setState({ accountCreated: true });
// 										if(this.state.promotionsChecked) {
// 											console.log("USER", user);
// 											sendMessage("account.promotions", true);
// 										}
// 									}
// 									resolve();
// 									console.log("CREATE ACCOUNT AND GET USER SUCCEDED");
// 								})
// 								.catch(() => resolve());
// 						}).finally(() => {
// 						});
// 					} else {
// 						this.setState({ 
// 							loading: false,
// 							createAccountSuccess: true,
// 							createAccountErrorText: result[0].detail || "Create Account Error"
// 						});
// 					}
// 				});
// ///
		

		this.setState({ loading: true }, () => {
			this.props.actions.login(email, password)
				.then(result => {
					const success = (result === true);
					if (success) {
						new RSVP.Promise((resolve, reject) => {
							this.props.actions.getUser()
								.then(result1 => {
									const {errors1} = result1;
									if(errors1) {
										reject(new Error(this._actionErrorsToText(errors1)));
									} else {
										this.props.actions.getUserSettings()
										.then(result2 = {
											const {errors2} = result2;
											if(errors2) {
												reject(new Error(this._actionErrorsToText(errors2)));
											} else {
												this.setState({ 
													loginSuccess: true,
													loading: false, 
												});
												resolve();
											}
										});
									}
								}





										this.setState({ accountCreated: true });
										if(this.state.promotionsChecked) {
											console.log("USER", user);
											sendMessage("account.promotions", true);
										}
									}
									resolve();
									console.log("CREATE ACCOUNT AND GET USER SUCCEDED");
								})


						RSVP.all([
							this.props.actions.getUser(),
							this.props.actions.getUserSettings(),
						])
						.catch(err => {
							this.setState({ 
								loading: false,
								loginErrorText: err, 
							});
						})
					} else {
						this.setState({ loading: false });
					}
				})
				.catch(err => log(err));
		});
	}
	/**
	 * Render Create Account panel.
	 * @return {ReactComponent}   ReactComponent instance
	 */
	 render() {
		const {
			email, password, emailError, passwordError, loading, loginSuccess, loginError		
		} = this.state;
		console.log("CREATE ACCOUNT SUCCESS", loginSuccess);
		console.log("CREATE ACCOUNT ERROR", loginError);
		const createLoginAlert = ClassNames({
			'create-account-result': true, 
			'success': loginSuccess || false, 
			'error': loginError || false
		});
		const CheckboxImagePath = this.state.rememberMeChecked ? '/app/images/hub/account/account-checkbox-on.svg' : '/app/images/hub/account/account-checkbox-off.svg';
		return (
			<div className="full-height flex-container flex-dir-column">
				<div className="flex-child-grow">
					<div>
						<SetupHeader  
							title = { t('setup_sign_in') }
							titleImage = {"/app/images/hub/account/ghosty-account.svg" } 
						/>
						<div className="row align-center account-content">
							<div className={createLoginAlert}>
								{loginError ? loginErrorText : loginSuccess ? 'Successful Login' : ''}
							</div>
							<form onSubmit={this.handleSubmit}>
								<div className="LogIn">
									<div className="row" style={{border: 'red solid 1px'}}>
										<div className="columns padded" style={{border: 'green solid 1px'}}>
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
									</div>
									<div className="row" style={{border: 'red solid 1px'}}>
										<div className="columns padded" style={{border: 'green solid 1px'}}>
											<div className={passwordError ? 'panel-error' : ''}>
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
													<span className={(passwordError ? 'panel-error show' : '')}>
														{ t('password_requirements') }
													</span>
												</p>								
											</div>
										</div>
									</div>
									{/*
									<div className="row" style={{border: 'red solid 1px'}}>
										<div className="columns padded" style={{border: 'green solid 1px'}}>
											<span className="account-checkbox-container" onClick={this.handleCheckboxChange}>
												<img src={CheckboxImagePath} className='account-checkbox' />
												<span>Remember Me</span>
											</span>
										</div>								
									</div>
									*/}
									<span className="row account-sign-in" style={{border: 'red solid 1px'}}>
										<span className="columns padded" style={{border: 'green solid 1px'}}>
											<NavLink to='/create-account'>
												{ t('do_not_have_account') }
											</NavLink>
										</span>
									</span>
									<div className="row" style={{border: 'red solid 1px'}}>
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
	}
}

// PropTypes ensure we pass required props of the correct type
LogInView.propTypes = {
};

export default LogInView;

