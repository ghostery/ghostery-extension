/**
 * Log In View Component
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
import { Route } from 'react-router-dom';

// Components
//import SetupNavigation from '../SetupViews/SetupNavigation';
import SetupHeader from '../SetupViews/SetupHeader';

/**
 * A Functional React component for rendering the Setup Blocking View
 * @return {JSX} JSX for rendering the Setup Blocking View of the Hub app
 * @memberof HubComponents
 */
const LogInView = props => (
	<div className="full-height flex-container flex-dir-column">
		<div className="flex-child-grow">
			<div>
				<SetupHeader  
					title = { t('setup_sign_in') }
					titleImage = {"/app/images/hub/account/ghosty-account.svg" } 
				/>
				{/*<step.bodyComponent index={step.index} sendMountActions={props.sendMountActions} /> */}
			</div>
		</div>
	</div>
);

// PropTypes ensure we pass required props of the correct type
LogInView.propTypes = {
};

export default LogInView;
