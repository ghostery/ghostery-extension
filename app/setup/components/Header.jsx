/**
 * Header Component
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
import { log } from '../../../src/utils/common';

/**
 * @class Footer for the Setup flow
 * @extends React.Component
 * @memberof SetupViews
 */
class Header extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			inputEmail: '',
			password: '',
		};
	}

	/**
	* Lifecycle event
	*/
	componentWillMount() {
		this.props.actions.getUser();
	}

	/**
	 * Handles the onClick event for closing the alert
	 */
	clearMessage = () => {
		this.props.actions.clearMessage();
	}

	/**
	 * Handles the onChange event for the Sign In form
	 * @param  {Object} event
	 */
	_handleInputChange = (e) => {
		const { name, value } = e.target;
		this.setState({ [name]: value });
	}

	/**
	 * Handles the onSubmit event for the Sign In form
	 * @param  {Object} event
	 */
	_handleSignIn = (e) => {
		e.preventDefault();
		const { inputEmail, password } = this.state;
		this.props.actions.login(inputEmail, password)
			.then((success) => {
				if (success) {
					Promise.all([
						this.props.actions.getUser(),
						this.props.actions.getUserSettings(),
					]);
				}
			})
			.catch(err => log(err));
	}

	/**
	 * Handles the onClick event for expanding the sign in form on small screens
	 * @param  {Object} event
	 */
	_toggleSmallSignInState = () => {
		const hideSmallSignIn = !this.state.hideSmallSignIn;
		this.setState({ hideSmallSignIn });
	}

	/**
	 * Helper function for rendering the sign in portion of the header
	 * @return {JSX} The JSX for the right side of the header
	 */
	renderRight() {
		const { inputEmail, password } = this.state;
		const { loggedIn, user } = this.props;
		const email = user && user.email || '';
		return (
			<div>
				{ loggedIn &&
					<span>{ email }</span>
				}
				{ !loggedIn &&
					<div>
						<div className="show-for-small-only">
							<div className="signInToggle float-right" onClick={this._toggleSmallSignInState}>
								{this.state.hideSmallSignIn ? t('setup_header_sign_in') : `${t('setup_header_sign_in_hide')}` }
							</div>
						</div>
						<div className="show-for-medium">
							<form onSubmit={this._handleSignIn} method="POST">
								<input type="email" name="inputEmail" value={inputEmail} placeholder={t('setup_header_email')} onChange={this._handleInputChange} />
								<input type="password" name="password" value={password} placeholder={t('setup_header_password')} onChange={this._handleInputChange} />
								<button type="submit">
									{ t('setup_header_sign_in') }
								</button>
							</form>
						</div>
					</div>
				}
			</div>
		);
	}

	/**
	 * Helper function for rendering the sign in dropdown on small screens
	 * @return {JSX} The JSX for the sign in dropdown portion of the header
	 */
	renderSubHeader() {
		if (this.props.success || this.state.hideSmallSignIn) {
			return (<div />);
		}
		return (
			<div id="sub-header" className="row show-for-small-only">
				<div className="columns">
					<form onSubmit={this._handleSignIn} method="POST">
						<input type="email" name="email" value={this.state.email} placeholder={t('setup_header_email')} onChange={this._handleInputChange} />
						<input type="password" name="password" value={this.state.password} placeholder={t('setup_header_password')} onChange={this._handleInputChange} />
						<button className="float-right" type="submit">
							{ t('setup_header_sign_in') }
						</button>
					</form>
				</div>
			</div>
		);
	}

	/**
	 * Helper function for rendering the callout
	 * @return {JSX} The JSX for the callout
	 */
	renderCallout() {
		return (
			<div className="callout-container">
				<div className={`${(!this.props.message ? 'hide ' : '') + (this.props.success ? 'success ' : 'alert')} callout`}>
					<svg onClick={this.clearMessage} width="15px" height="15px" viewBox="0 0 15 15" className="close-button">
						<g>
							<path strokeWidth="3" strokeLinecap="round" d="M3,3 L12,12 M3,12 L12,3" />
						</g>
					</svg>
					<span className="callout-text" >
						{this.props.message}
						<span dangerouslySetInnerHTML={{ __html: this.props.notificationText }} />
					</span>
				</div>
			</div>
		);
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Header view
	 */
	render() {
		return (
			<div>
				<div id="header">
					<div className="row align-middle full-height">
						<div className="columns shrink">
							<img className="logo" src="/app/images/setup/logo-title-white.svg" />
						</div>
						<div className="columns text-right">
							{this.renderRight()}
						</div>
					</div>
				</div>
				{this.renderSubHeader()}
				{this.renderCallout()}
			</div>
		);
	}
}

export default Header;
