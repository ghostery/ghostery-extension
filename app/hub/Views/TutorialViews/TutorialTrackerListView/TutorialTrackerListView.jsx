/**
 * Tutorial Tracker List View Component
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
 * A Functional React component for rendering the Tutorial Tracker List View
 * @return {JSX} JSX for rendering the Tutorial Tracker List View of the Hub app
 * @memberof HubComponents
 */
const TutorialTrackerListView = () => (
	<div className="TutorialView--paddingTopLarge row align-center">
		<div className="columns small-12 medium-9">
			image goes here
		</div>
		<div className="columns small-12 medium-3">
			<div className="TutorialView__title">
				{t('hub_tutorial_trackerlist_title')}
			</div>
			<div className="TutorialView__tagline">
				{t('hub_tutorial_trackerlist_tagline')}
			</div>
		</div>
	</div>
);

export default TutorialTrackerListView;
