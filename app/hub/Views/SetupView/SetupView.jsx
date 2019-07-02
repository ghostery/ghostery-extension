/**
 * Setup View Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2019 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';

// Components
import SetupNavigation from '../SetupViews/SetupNavigation';
import SetupHeader from '../SetupViews/SetupHeader';

/**
 * A Functional React component for rendering the Setup View
 * @return {JSX} JSX for rendering the Setup View of the Hub app
 * @memberof HubComponents
 */
const SetupView = (props) => {
	const { extraRoutes, sendMountActions, steps } = props;

	return (
		<div className="full-height flex-container flex-dir-column">
			<div className="flex-child-grow">
				{steps.map(step => (
					<Route
						key={`route-${step.index}`}
						path={step.path}
						render={() => (
							<div>
								<SetupHeader {...step.headerProps} />
								<step.bodyComponent index={step.index} sendMountActions={sendMountActions} />
							</div>
						)}
					/>
				))}
				{extraRoutes.map(route => (
					<Route
						key={`extra-route-${route.name}`}
						path={route.path}
						render={() => <route.component sendMountActions={sendMountActions} />}
					/>
				))}
			</div>

			<SetupNavigation totalSteps={steps.length} />
		</div>
	);
};

// PropTypes ensure we pass required props of the correct type
SetupView.propTypes = {
	steps: PropTypes.arrayOf(PropTypes.shape({
		index: PropTypes.number.isRequired,
		path: PropTypes.string.isRequired,
		bodyComponent: PropTypes.shape.isRequired,
		headerProps: PropTypes.shape({
			title: PropTypes.string.isRequired,
			titleImage: PropTypes.string.isRequired,
		}).isRequired,
	})).isRequired,
	extraRoutes: PropTypes.arrayOf(PropTypes.shape({
		name: PropTypes.string.isRequired,
		path: PropTypes.string.isRequired,
		component: PropTypes.func.isRequired,
	})).isRequired,
	sendMountActions: PropTypes.bool.isRequired,
};

export default SetupView;
