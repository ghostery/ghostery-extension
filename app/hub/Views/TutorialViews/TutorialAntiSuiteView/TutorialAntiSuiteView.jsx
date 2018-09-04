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
 *
 * ToDo: Update this file.
 */

import React from 'react';


/**
 * A Functional React component for rendering the Tutorial Anti Suite View
 * @return {JSX} JSX for rendering the Tutorial Anti Suite View of the Hub app
 * @memberof HubComponents
 */
const TutorialAntiSuiteView = () => (
	<div className="TutorialView--paddingTopSmall row align-center-middle">
		<div className="columns small-12 medium-6">
			<div className="TutorialView__imageTitle">
				{t('hub_tutorial_simple_view')}
			</div>
			<div>image 1</div>
			<div className="TutorialView__imageTitle">
				{t('hub_tutorial_detailed_view')}
			</div>
			<div>image 2</div>
		</div>
		<div className="columns small-12 medium-4 medium-offsert-1">
			<div className="TutorialView__title">
				{t('hub_tutorial_antisuite_title')}
			</div>

			<div className="TutorialAntiSuiteView__key">
				<div className="TutorialView__keyItem flex-container align-middle">
					<div className="TutorialView__keyImage">image</div>
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
					<div className="TutorialView__keyImage">image</div>
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
					<div className="TutorialView__keyImage">image</div>
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

export default TutorialAntiSuiteView;
