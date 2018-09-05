/**
 * Tutorial Layout View Component
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

/**
 * A Functional React component for rendering the Tutorial Layout View
 * @return {JSX} JSX for rendering the Tutorial Layout View of the Hub app
 * @memberof HubComponents
 */
const TutorialLayoutView = () => (
	<div className="TutorialView--paddingTopSmall row align-center-middle">
		<div className="columns small-12 medium-6">
			<div>image 1</div>
			<div>image 2</div>
		</div>
		<div className="columns small-12 medium-4 medium-offset-1">
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
