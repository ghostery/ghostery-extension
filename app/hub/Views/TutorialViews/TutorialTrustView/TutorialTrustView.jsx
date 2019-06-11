/**
 * Tutorial Trust View Component
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
 * A Functional React component for rendering the Tutorial Trust and Restrict View
 * @return {JSX} JSX for rendering the Tutorial Trust and Restrict View of the Hub app
 * @memberof HubComponents
 */
const TutorialTrustView = () => (
	<div className="TutorialTrustView TutorialView--mediumFlexColumn row align-center-middle">
		<div className="columns small-10 medium-8 large-6">
			<div className="TutorialView__imageTitle">
				{t('hub_tutorial_simple_view')}
			</div>
			<img
				className="TutorialTrustView__image simple"
				src="/app/images/hub/tutorial/trustrestrict-simple.png"
				alt={t('hub_tutorial_simple_view')}
			/>
			<div className="TutorialView__imageTitle">
				{t('hub_tutorial_detailed_view')}
			</div>
			<img
				className="TutorialTrustView__image detailed"
				src="/app/images/hub/tutorial/trustrestrict-detailed.png"
				alt={t('hub_tutorial_detailed_view')}
			/>
		</div>
		<div className="columns small-12 medium-8 large-4 large-offset-1">
			<div className="TutorialView__title">
				{t('hub_tutorial_trust_title')}
			</div>
			<div className="TutorialView__tagline">
				{t('hub_tutorial_trust_tagline')}
			</div>
			<div className="TutorialTrustView__key">
				<div className="TutorialView__keyButton trust button secondary hollow">
					{t('summary_trust_site')}
				</div>
				<div className="TutorialView__keyText">
					{t('hub_tutorial_trust_trust_site')}
				</div>
				<div className="TutorialView__keyButton restrict button secondary hollow">
					{t('summary_restrict_site')}
				</div>
				<div className="TutorialView__keyText TutorialView--removeMarginBottom">
					{t('hub_tutorial_trust_restrict_site')}
				</div>
			</div>
		</div>
	</div>
);

// No need for PropTypes. The SideNavigationViewContainer has no props.

export default TutorialTrustView;
