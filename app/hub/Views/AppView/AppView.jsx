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
 *
 * ToDo: Update this file.
 */

import React from 'react';
import SideNavigation from '../SideNavigationView';

/**
 * A Functional React Component for rendering the Ghostery Hub App
 * @return {JSX} JSX for rendering the Ghostery Hub App
 * @memberof HubComponents
 */
const AppView = props => (
	<div className="App full-height full-width flex-container">
		<SideNavigation />
		<div className="App__mainContent full-height flex-child-grow">
			{props.children}
		</div>
	</div>
);

export default AppView;
