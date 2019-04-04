/**
 * Tutorial Layout View Component
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

/**
 * A Functional React component for rendering the Tutorial Layout View
 * @return {JSX} JSX for rendering the Tutorial Layout View of the Hub app
 * @memberof HubComponents
 */
const TutorialLayoutView = () => (
	<div className="TutorialLayoutView TutorialView--mediumFlexColumn row align-center-middle flex-container">
		<div className="columns small-10 medium-8 large-6">
			<img
				className="TutorialLayoutView__image simple"
				src="/app/images/hub/tutorial/layout-simple.png"
				alt={t('hub_tutorial_simple_view')}
			/>
			<img
				className="TutorialLayoutView__image detailed"
				src="/app/images/hub/tutorial/layout-detailed.png"
				alt={t('hub_tutorial_detailed_view')}
			/>
		</div>
		<div className="columns small-10 medium-6 large-4 large-offset-1">
			<div className="TutorialView__title">
				{t('hub_tutorial_layout_title')}
			</div>
			<div className="TutorialView__tagline">
				{t('hub_tutorial_layout_tagline')}
			</div>
		</div>
	</div>
);

// No need for PropTypes. The SideNavigationViewContainer has no props.

export default TutorialLayoutView;
