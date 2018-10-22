/**
 * Setup Done View Component
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
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';

/**
 * A Functional React component for rendering the Setup Done View
 * @return {JSX} JSX for rendering the Setup Done View of the Hub app
 * @memberof HubComponents
 */
const SetupDoneView = props => (
	<div className="row align-center">
		<div className="columns small-12 large-10">
			<div className="SetupDone">
				<div className="SetupDone__title_bar row align-middle">
					<div className="SetupDone__bar columns" />
					<div className="SetupDone__title columns shrink">
						{t('hub_setup_ready_heading')}
					</div>
					<div className="SetupDone__bar columns" />
				</div>

				<div className="SetupDone__featureList row align-spaced flex-container">
					{props.features.map((feature) => {
						const iconClassNames = `SetupDone__featureIcon feature-${feature.id}`;

						return (
							<div key={`feature-${feature.id}`} className="SetupDone__feature columns flex-container flex-dir-column">
								<div className={iconClassNames} />
								<div className="SetupDone__featureTitle flex-container align-center-middle">
									{feature.title}
								</div>
								<div className="SetupDone__bar" />
								<div className="flex-child-grow">{feature.description}</div>
								<NavLink className="SetupDone__featureButton button primary" to={feature.buttonHref}>
									{feature.buttonText}
								</NavLink>
							</div>
						);
					})}
				</div>

			</div>
		</div>
	</div>
);

// PropTypes ensure we pass required props of the correct type
SetupDoneView.propTypes = {
	features: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
		description: PropTypes.string.isRequired,
		buttonText: PropTypes.string.isRequired,
		buttonHref: PropTypes.string.isRequired,
	})).isRequired,
};

export default SetupDoneView;
