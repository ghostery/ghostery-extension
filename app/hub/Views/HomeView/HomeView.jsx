/**
 * Home View Component
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
import ClassNames from 'classnames';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import globals from '../../../../src/classes/Globals';
import { ToggleCheckbox } from '../../../shared-components';

/**
 * A Functional React component for rendering the Home View
 * @return {JSX} JSX for rendering the Home View of the Hub app
 * @memberof HubComponents
 */
const HomeView = (props) => {
	const {
		justInstalled,
		setup_complete,
		tutorial_complete,
		enable_metrics,
		changeMetrics,
		email,
		isPlus,
	} = props;
	const accountHref = `https://account.${globals.GHOSTERY_DOMAIN}.com`;
	const tutorialFeatureClassNames = ClassNames('HomeView__onboardingFeature columns flex-container align-middle flex-dir-column', {
		'feature-tutorial-complete': tutorial_complete,
		'feature-tutorial': !tutorial_complete,
	});
	const tutorialButtonClassNames = ClassNames('HomeView__featureButton button primary', {
		hollow: tutorial_complete,
	});
	const setupFeatureClassNames = ClassNames('HomeView__onboardingFeature columns flex-container align-middle flex-dir-column', {
		'feature-setup-complete': setup_complete,
		'feature-setup': !setup_complete,
	});
	const setupButtonClassNames = ClassNames('HomeView__featureButton button primary', {
		hollow: setup_complete,
	});

	return (
		<div className="HomeView row align-center">
			<div className="HomeView__display columns small-10 large-8">
				<div className="HomeView__header row large-unstack align-center-middle">
					<img className="HomeView--firefoxImageSize columns" src="/app/images/hub/home/ghosty-bubble-heart.svg" />
					<div className="columns">
						<h1>
							{t('hub_home_header_text')}
						</h1>
						{justInstalled && (
							<div className="HomeView__headerTagline">
								{t('hub_home_header_tagline')}
							</div>
						)}
						<div className="HomeView__headerTagline HomeView--bolded">
							{t('hub_home_header_tagline_2')}
						</div>
						<div className="HomeView__supportContainer HomeView--pad-left HomeView--firefoxFontSize">
							<span>
								{t('hub_home_header_info')}
							</span>
							<a href="https://www.ghostery.com/faqs/" alt={t('hub_home_header_info_link')} target="_blank" rel="noopener noreferrer">
								{t('hub_home_header_info_link')}
							</a>
						</div>
						<div className="HomeView__supportContainer flex-container align-middle">
							<ToggleCheckbox
								className="flex-shrink-none"
								checked={enable_metrics}
								onChange={changeMetrics}
							/>
							<span className="clickable HomeView--firefoxFontSize" onClick={changeMetrics}>
								{t('hub_home_header_checkbox_label')}
							</span>
						</div>
					</div>
				</div>
				<div className="HomeView__subHeader row align-justify">
					<div>
						{t('hub_home_subheader_optimize')}
					</div>
					{email ? (
						<a href={accountHref} target="_blank" rel="noopener noreferrer">
							{email}
						</a>
					) : (
						<NavLink to="/create-account">
							{t('hub_home_subheader_create_account')}
						</NavLink>
					)}
				</div>
				<div className="HomeView__onboarding row large-unstack align-center">
					<div className={tutorialFeatureClassNames}>
						<div className="HomeView__featureIcon" />
						<div className="HomeView__featureTitle">
							{t('hub_home_feature_tutorial_title')}
						</div>
						<div className="HomeView__featureText flex-child-grow">
							{t('hub_home_feature_tutorial_text')}
						</div>
						<NavLink to="/tutorial" className={tutorialButtonClassNames}>
							{tutorial_complete ? t('hub_home_feature_tutorial_button_alt') : t('hub_home_feature_tutorial_button')}
						</NavLink>
					</div>
					<div className="HomeView__dividerVertical column shrink show-for-large" />
					<div className="HomeView__dividerHorizontal hide-for-large" />
					<div className={setupFeatureClassNames}>
						<div className="HomeView__featureIcon" />
						<div className="HomeView__featureTitle">
							{t('hub_home_feature_setup_title')}
						</div>
						<div className="HomeView__featureText flex-child-grow">
							{t('hub_home_feature_setup_text')}
						</div>
						<NavLink to="/setup" className={setupButtonClassNames}>
							{setup_complete ? t('hub_home_feature_setup_button_alt') : t('hub_home_feature_setup_button')}
						</NavLink>
					</div>
				</div>
				<div className="HomeView__plus row large-unstack">
					<div className="HomeView__featureIcon feature-plus hide-for-large" />
					<div className="HomeView__featureText columns">
						{t('hub_home_feature_supporter_text')}
					</div>
					<div className="HomeView__featureIcon columns shrink feature-plus show-for-large" />
					<div className="columns flex-container align-center-middle">
						<NavLink to="/plus" className="HomeView__featureButton button primary">
							{isPlus ? t('hub_home_feature_supporter_button_alt') : t('hub_home_feature_supporter_button')}
						</NavLink>
					</div>
				</div>
			</div>
		</div>
	);
};

// PropTypes ensure we pass required props of the correct type
HomeView.propTypes = {
	justInstalled: PropTypes.bool.isRequired,
	setup_complete: PropTypes.bool.isRequired,
	tutorial_complete: PropTypes.bool.isRequired,
	enable_metrics: PropTypes.bool.isRequired,
	changeMetrics: PropTypes.func.isRequired,
	email: PropTypes.string.isRequired,
	isPlus: PropTypes.bool.isRequired,
};

export default HomeView;
