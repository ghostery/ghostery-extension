/**
 * Tutorial Anti Suite View Component
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
import PropTypes from 'prop-types';

/**
 * A Functional React component for rendering the Tutorial Anti Suite View
 * @return {JSX} JSX for rendering the Tutorial Anti Suite View of the Hub app
 * @memberof HubComponents
 */
const TutorialAntiSuiteView = ({ isAndroid }) => (
	<div className="TutorialAntiSuiteView TutorialView--mediumFlexColumn row align-center-middle">
		<div className="columns small-10 small-offset-1 medium-8 large-6">
			<div className="TutorialView__imageTitle">
				{t('simple_view')}
			</div>
			<img
				className="TutorialAntiSuiteView__image antisuite-simple"
				src={`/app/images/hub/tutorial/antisuite-simple${isAndroid ? '-android' : ''}.png`}
				alt={t('simple_view')}
			/>
			{ !isAndroid && (
				<div>
					<div className="TutorialView__imageTitle">
						{t('detailed_view')}
					</div>
					<img
						className="TutorialAntiSuiteView__image antisuite-detailed"
						src="/app/images/hub/tutorial/antisuite-detailed.png"
						alt={t('detailed_view')}
					/>
				</div>
			)}
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
							{t('enhanced_anti_tracking')}
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
							{t('enhanced_ad_blocking')}
						</div>
						<div className="TutorialView__keyText">
							{t('ad_blocking_DESC')}
						</div>
					</div>
				</div>
				<div className="TutorialView__keyItem flex-container align-middle">
					<div className="TutorialView__keyImage smart-block" />
					<div>
						<div className="TutorialView__keyTitle">
							{t('smart_blocking')}
						</div>
						<div className="TutorialView__keyText">
							{t('smart_blocking_DESC')}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
);

TutorialAntiSuiteView.propTypes = {
	isAndroid: PropTypes.bool.isRequired
};

export default TutorialAntiSuiteView;
