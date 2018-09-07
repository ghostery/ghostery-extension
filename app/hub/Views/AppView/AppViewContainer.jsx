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
import AppView from './AppView';

/**
 * @class Implement the Home View Container for the Ghostery Hub
 * @extends Component
 * @memberof HubContainers
 */
class AppViewContainer extends Component {
	constructor(props) {
		super(props);
		this.props.actions.getUser();
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Home View of the Hub app
	 */
	render() {
		return <AppView {...this.props} />;
	}
}

export default AppViewContainer;
