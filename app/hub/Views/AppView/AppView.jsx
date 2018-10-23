/**
 * App View Component
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
import SideNavigation from '../SideNavigationView';
import { ToastMessage } from '../../../shared-components';

/**
 * A Functional React Component for rendering the Ghostery Hub App
 * @return {JSX} JSX for rendering the Ghostery Hub App
 * @memberof HubComponents
 */
class AppView extends Component {
	constructor(props) {
		super(props);
		this.mainContent = React.createRef();
	}

	componentDidUpdate() {
		this.mainContent.current.scroll(0, 0);
	}

	render() {
		const { app, exitToast, children } = this.props;

		return (
			<div className="App full-height full-width flex-container">
				<SideNavigation />
				<div ref={this.mainContent} className="App__mainContent full-height full-width" >
					<ToastMessage toastText={app.toastMessage} toastClass={app.toastClass} toastExit={exitToast} />
					{children}
				</div>
			</div>
		);
	}
}

// PropTypes ensure we pass required props of the correct type
AppView.propTypes = {
	app: PropTypes.shape({
		toastMessage: PropTypes.string.isRequired,
		toastClass: PropTypes.string.isRequired,
	}).isRequired,
	exitToast: PropTypes.func.isRequired,
};

export default AppView;
