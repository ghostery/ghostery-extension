/**
 * Tutorial Blocking View Component
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
 * A Functional React component for rendering the Tutorial Blocking View
 * @return {JSX} JSX for rendering the Tutorial Blocking View of the Hub app
 * @memberof HubComponents
 */
const TutorialBlockingView = () => (
	<div className="TutorialBlockingView row align-center-middle flex-container">
		<div className="columns small-11 small-offset-1 medium-6">
			<div className="TutorialView__imageTitle">
				{t('detailed_view')}
			</div>
			<img
				className="TutorialBlockingView__image blocking-detailed"
				src="/app/images/hub/tutorial/blocking-detailed.png"
				alt={t('detailed_view')}
			/>
			<div className="TutorialView__imageTitle">
				{t('hub_tutorial_detailed_expanded_view')}
			</div>
			<img
				className="TutorialBlockingView__image blocking-detailed-expanded"
				src="/app/images/hub/tutorial/blocking-detailed-expanded.png"
				alt={t('hub_tutorial_detailed_expanded_view')}
			/>
		</div>
		<div className="columns small-12 medium-5 large-4">
			<div className="TutorialView__title">
				{t('hub_tutorial_blocking_title')}
			</div>
			<div className="TutorialView__tagline">
				{t('hub_tutorial_blocking_tagline')}
			</div>
			<div className="TutorialBlockingView__key flex-container flex-dir-column">
				<div className="TutorialView__keyText allow">
					{t('hub_tutorial_blocking_allow')}
				</div>
				<div className="TutorialView__keyText block">
					{t('hub_tutorial_blocking_block')}
				</div>
				<div className="TutorialView__keyText block-global">
					{t('hub_tutorial_blocking_block_always')}
				</div>
			</div>
		</div>
	</div>
);

// No need for PropTypes. The SideNavigationViewContainer has no props.

export default TutorialBlockingView;
