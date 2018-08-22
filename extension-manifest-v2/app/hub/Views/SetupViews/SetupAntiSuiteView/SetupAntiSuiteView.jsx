/**
 * Setup Anti-Suite View Component
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
import ClassNames from 'classnames';
import { ToggleSwitch } from '../../../../shared-components';

/**
 * A Functional React component for rendering the Setup Anti-Suite View
 * @return {JSX} JSX for rendering the Setup Anti-Suite View of the Hub app
 * @memberof HubComponents
 */
const SetupAntiSuiteView = props => (
	<div className="row align-center">
		<div className="columns small-12 medium-10 large-8">
			{props.features.map((feature) => {
				const iconClassNames = ClassNames(feature.id, {
					SetupAntiSuite__icon: true,
					active: feature.enabled,
				});

				return (
					<div key={`feature-${feature.id}`} className="SetupAntiSuite__feature row align-center-middle">
						<div className="columns shrink">
							<div className={iconClassNames} />
						</div>
						<div className="columns shrink">
							<ToggleSwitch
								checked={feature.enabled}
								onChange={feature.toggle}
							/>
						</div>
						<div className="columns small-12 large-8">
							<div className="flex-container align-middle">
								<div className="SetupAntiSuite__feature_title display-inline">
									{feature.name}
								</div>
								{feature.enabled && (
									<div className="SetupAntiSuite__feature_enabled display-inline">
										{t('hub_setup_antisuite_feature_enabled')}
									</div>
								)}
							</div>
							<div className="SetupAntiSuite__feature_description">
								{feature.description}
							</div>
						</div>
					</div>
				);
			})}
		</div>
	</div>
);

// PropTypes ensure we pass required props of the correct type
SetupAntiSuiteView.propTypes = {
	features: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.string.isRequired,
		name: PropTypes.string.isRequired,
		enabled: PropTypes.bool.isRequired,
		toggle: PropTypes.func.isRequired,
		description: PropTypes.string.isRequired,
	})).isRequired,
};

export default SetupAntiSuiteView;
