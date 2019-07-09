/**
 * Tutorial View Component
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
import TutorialNavigation from '../TutorialViews/TutorialNavigation';

/**
 * A Functional React component for rendering the Tutorial View
 * @return {JSX} JSX for rendering the Setup View of the Hub app
 * @memberof HubComponents
 */
const TutorialView = (props) => {
	const { sendMountActions, steps } = props;

	return (
		<div className="full-height flex-container flex-dir-column">
			<div className="TutorialView--paddingTopLarge flex-child-grow flex-container align-middle">
				{steps.map(step => (
					<Route
						key={`route-${step.index}`}
						path={step.path}
						render={() => <step.bodyComponent index={step.index} sendMountActions={sendMountActions} />}
					/>
				))}
			</div>

			<TutorialNavigation totalSteps={steps.length} />
		</div>
	);
};

// PropTypes ensure we pass required props of the correct type
TutorialView.propTypes = {
	steps: PropTypes.arrayOf(PropTypes.shape({
		index: PropTypes.number.isRequired,
		path: PropTypes.string.isRequired,
		bodyComponent: PropTypes.shape.isRequired,
	})).isRequired,
	sendMountActions: PropTypes.bool.isRequired,
};

export default TutorialView;
