/**
 * Navigation Component
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
import { NavLink } from 'react-router-dom';
import ClassNames from 'classnames';

/**
 * @class The nagivation component handles navigating through the steps of the Setup flow
 * @extends Component
 * @memberof SetupViews
 */
class Navigation extends Component {
	constructor(props) {
		super(props);
		this.state = {
			orderedPaths: [
				'/',
				'/blocking',
				'/additional-features',
				'/display',
				'/log-in',
				'/data-collection',
				'/done',
			],
		};
	}

	/**
	* Lifecycle event
	*/
	componentWillReceiveProps(nextProps) {
		if (nextProps.triggerNext) {
			this._next();
		}
	}

	/**
	 * Calls the action to sign into your account
	 */
	_signIn = () => {
		this.props.actions.triggerSignIn();
	}

	/**
	 * Calls the action to create an account
	 */
	_createAccount = () => {
		this.props.actions.triggerCreateAccount();
	}

	/**
	 * Handles the event of going to the next step in the Setup flow
	 */
	_next = () => {
		const { pathname } = this.props.location;
		const index = this.state.orderedPaths.indexOf(pathname);
		if (index >= 0 && index !== this.state.orderedPaths.length - 1) {
			this.props.history.push(this.state.orderedPaths[index + 1]);
		}
	}

	/**
	 * Handles the action of going to the previous step in the Setup flow
	 */
	_prev = () => {
		const { pathname } = this.props.location;
		const index = this.state.orderedPaths.indexOf(pathname);
		if (index >= 0 && index !== 0) {
			this.props.history.push(this.state.orderedPaths[index - 1]);
		}
	}

	/**
	 * Calls the action of closing the Setup flow
	 */
	_close = () => {
		this.props.actions.close();
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Navigation
	 */
	render() {
		const { pathname } = this.props.location;
		const { nextButtons } = this.props;
		return (
			<div id="navigation">
				<div className={`${(pathname === '/' || pathname === '/upgrade') ? 'hide' : ''} row align-center align-middle`}>
					<div className="columns shrink">
						<button className="button hollow ghostery-button" onClick={this._prev}>
							{ t('setup_button_previous') }
						</button>
					</div>
					<div className="columns text-center navigation-dots">
						<div className="circles">
							<NavLink to="/" exact />
							<NavLink to="/blocking" exact />
							<NavLink to="/additional-features" exact />
							<NavLink to="/display" exact />
							<NavLink to="/log-in" exact />
							<NavLink to="/data-collection" exact />
							<NavLink to="/done" exact />
						</div>
					</div>
					{nextButtons.map((button, i) => {
						const buttonClasses = ClassNames('button ghostery-button', {
							hollow: nextButtons.length > 1 && i === 0,
							loading: this.props.loading && i === 1,
						});
						return (
							<div key={button.title} className="columns shrink" >
								<button onClick={this[`_${button.action}`]} className={buttonClasses}>
									<span className="title">{button.title}</span>
									<span className="loader" />
								</button>
							</div>
						);
					})}
				</div>
			</div>
		);
	}
}

export default Navigation;
