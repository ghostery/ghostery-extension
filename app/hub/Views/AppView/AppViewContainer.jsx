/**
 * App View Container
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
import PropTypes from 'prop-types';
import AppView from './AppView';

/**
 * @class Implement the Home View Container for the Ghostery Hub
 * @extends Component
 * @memberof HubContainers
 */
class AppViewContainer extends Component {
	/**
	 * Handle clicking to exit the Toast Message.
	 */
	_exitToast = () => {
		this.props.actions.setToast({
			toastMessage: '',
			toastClass: '',
		});
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Home View of the Hub app
	 */
	render() {
		const childProps = {
			...this.props,
			exitToast: this._exitToast,
		};
		return <AppView {...childProps} />;
	}
}

// PropTypes ensure we pass required props of the correct type
AppViewContainer.propTypes = {
	actions: PropTypes.shape({
		setToast: PropTypes.func.isRequired,
	}).isRequired,
	app: PropTypes.shape({
		toastMessage: PropTypes.string,
		toastClass: PropTypes.string,
	}),
};

// Default props used in the App
AppViewContainer.defaultProps = {
	app: {
		toastMessage: '',
		toastClass: '',
	},
};

export default AppViewContainer;
