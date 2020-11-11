/**
 * Home View Component
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
import ClassNames from 'classnames';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import globals from '../../../../src/classes/Globals';
import { ToggleCheckbox } from '../../../shared-components';

const { BROWSER_INFO } = globals;

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
		isPremium,
		sendPing,
	} = props;
	const accountHref = globals.ACCOUNT_BASE_URL;

	let headerInfoText = t('hub_home_header_info');
	if (BROWSER_INFO.name === 'firefox') {
		headerInfoText = t('hub_home_header_info_opted_out');
	}

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
	const upgradeContainerClassNames = ClassNames('HomeView__upgradeContainer row align-center-middle', {
		'purple-border': !isPremium
	});

	/**
	 * Sends the necessary ping to background
	 */
	const _sendUpgradePing = () => {
		sendPing({ type: 'intro_hub_home_upgrade' });
	};

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
								{headerInfoText}
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
							{t('create_account')}
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
							{tutorial_complete ? t('hub_home_feature_tutorial_button_alt') : t('start')}
						</NavLink>
					</div>
					<div className="HomeView__dividerVertical column shrink show-for-large" />
					<div className="HomeView__dividerHorizontal hide-for-large" />
					<div className={setupFeatureClassNames}>
						<div className="HomeView__featureIcon" />
						<div className="HomeView__featureTitle">
							{t('customize_setup')}
						</div>
						<div className="HomeView__featureText flex-child-grow">
							{t('hub_home_feature_setup_text')}
						</div>
						<NavLink to="/setup" className={setupButtonClassNames}>
							{setup_complete ? t('hub_home_feature_setup_button_alt') : t('hub_home_feature_setup_button')}
						</NavLink>
					</div>
				</div>
				<div className={upgradeContainerClassNames}>
					<div className="HomeView__upgradeIcon" />
					<div className="HomeView__upgradeText">
						{t('hub_home_plus_upgrade_text')}
					</div>
					<div className="HomeView__buttonContainer columns flex-container">
						<NavLink to="/" className="HomeView__featureButton button primary" onClick={_sendUpgradePing}>
							{isPremium ? t('hub_home_plus_full_protection') : t('hub_home_plus_upgrade_button_text')}
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
	isPremium: PropTypes.bool.isRequired,
};

export default HomeView;
