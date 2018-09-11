/**
 * Tutorial Video View Component
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
 * A Functional React component for rendering the Tutorial Video View
 * @return {JSX} JSX for rendering the Tutorial Video View of the Hub app
 * @memberof HubComponents
 */
const TutorialVideoView = () => (
	<div className="TutorialView--paddingTopLarge row align-center">
		<div className="columns small-12 medium-10 large-8">
			<div className="TutorialView__title text-center">
				{t('hub_tutorial_video_title')}
			</div>
			<div className="TutorialVideoView__videoContainer text-center">
				<video
					controls
					height="360"
					width="640"
					preload="metadata"
					poster="/app/images/hub/tutorial/video-poster.png"
				>
					<source type="video/mp4" src="https://www.ghostery.com/wp-content/uploads/2018/08/ghostery_promo.mp4?_=1" />
					<source type="video/webm" src="https://www.ghostery.com/wp-content/uploads/2018/08/ghostery_promo.webm?_=1" />
					<source type="video/ogg" src="https://www.ghostery.com/wp-content/uploads/2018/08/ghostery_promo.ogv?_=1" />
				</video>
			</div>
			<div className="TutorialView__tagline text-center">
				{t('hub_tutorial_video_tagline')}
			</div>
		</div>
	</div>
);

// No need for PropTypes. The SideNavigationViewContainer has no props.

export default TutorialVideoView;
