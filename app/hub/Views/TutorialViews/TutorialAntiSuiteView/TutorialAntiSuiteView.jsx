/**
 * Tutorial Anti Suite View Component
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
 * A Functional React component for rendering the Tutorial Anti Suite View
 * @return {JSX} JSX for rendering the Tutorial Anti Suite View of the Hub app
 * @memberof HubComponents
 */
const TutorialAntiSuiteView = () => (
	<div className="TutorialAntiSuiteView row align-center-middle">
		<div className="columns small-10 small-offset-1 medium-8 large-6">
			<div className="TutorialView__imageTitle">
				{t('hub_tutorial_simple_view')}
			</div>
			<img
				className="TutorialAntiSuiteView__image simple"
				src="/app/images/hub/tutorial/antisuite-simple.png"
				alt={t('hub_tutorial_simple_view')}
			/>
			<div className="TutorialView__imageTitle">
				{t('hub_tutorial_detailed_view')}
			</div>
			<img
				className="TutorialAntiSuiteView__image detailed"
				src="/app/images/hub/tutorial/antisuite-detailed.png"
				alt={t('hub_tutorial_detailed_view')}
			/>
		</div>
		<div className="columns small-12 medium-10 large-4">
			<div className="TutorialView__title">
				{t('hub_tutorial_antisuite_title')}
			</div>

			<div className="TutorialAntiSuiteView__key">
				<div className="TutorialView__keyItem flex-container align-middle">
					<div className="TutorialView__keyImage anti-track" />
					<div>
						<div className="TutorialView__keyTitle">
							{t('hub_tutorial_antisuite_antitracking_title')}
						</div>
						<div className="TutorialView__keyText">
							{t('hub_tutorial_antisuite_antitracking_description')}
						</div>
					</div>
				</div>
				<div className="TutorialView__keyItem flex-container align-middle">
					<div className="TutorialView__keyImage ad-block" />
					<div>
						<div className="TutorialView__keyTitle">
							{t('hub_tutorial_antisuite_adblocking_title')}
						</div>
						<div className="TutorialView__keyText">
							{t('hub_tutorial_antisuite_adblocking_description')}
						</div>
					</div>
				</div>
				<div className="TutorialView__keyItem flex-container align-middle">
					<div className="TutorialView__keyImage smart-block" />
					<div>
						<div className="TutorialView__keyTitle">
							{t('hub_tutorial_antisuite_smartblocking_title')}
						</div>
						<div className="TutorialView__keyText">
							{t('hub_tutorial_antisuite_smartblocking_description')}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
);

// No need for PropTypes. The SideNavigationViewContainer has no props.

export default TutorialAntiSuiteView;
