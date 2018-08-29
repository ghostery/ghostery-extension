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
		enable_human_web,
		changeHumanWeb,
		account_text,
		account_link,
	} = props;
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
			<div className="columns small-12 medium-10 large-8">
				<div className="HomeView__header row align-center-middle">
					<img className="columns" src="/app/images/hub/home/ghosty-bubble-heart.svg" />
					<div className="HomeView__title columns">
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
						<div className="HomeView__supportContainer flex-container align-middle">
							<ToggleCheckbox
								checked={enable_human_web}
								onChange={changeHumanWeb}
							/>
							<div>
								<span>{t('hub_home_header_checkbox_label')}</span>
								<NavLink to="/faq">
									{t('hub_home_header_checkbox_link')}
								</NavLink>
							</div>
						</div>
					</div>
				</div>
				<div className="HomeView__subHeader row align-justify">
					<div>
						{t('hub_home_subheader_optimize')}
					</div>
					<NavLink to={account_link}>
						{account_text}
					</NavLink>
				</div>
				<div className="HomeView__onboarding row">
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
					<div className="HomeView__onboardingFeatureDivider column shrink" />
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
				<div className="HomeView__supporter row">
					<div className="HomeView__supporterFeature columns flex-container align-middle">
						<div className="HomeView__featureText columns">
							{t('hub_home_feature_supporter_text')}
						</div>
						<div className="HomeView__featureIcon columns shrink feature-supporter" />
						<div className="columns flex-container align-center-middle">
							<NavLink to="/supporter" className="HomeView__featureButton button primary">
								{t('hub_home_feature_supporter_button')}
							</NavLink>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

// PropTypes ensure we pass required props of the correct type
HomeView.propTypes = {
	setup_complete: PropTypes.bool.isRequired,
	tutorial_complete: PropTypes.bool.isRequired,
	enable_human_web: PropTypes.bool.isRequired,
	changeHumanWeb: PropTypes.func.isRequired,
	account_text: PropTypes.string.isRequired,
	account_link: PropTypes.string.isRequired,
};

export default HomeView;
