/**
 * Ghostery Browser Hub Onboarding View Container
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2020 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import OnboardingView from './OnboardingView';
import { BLOCKING_POLICY_RECOMMENDED } from './OnboardingViewConstants';

// Component Views
import WelcomeView from '../OnboardingViews/Step0_WelcomeView';
import LoginView from '../OnboardingViews/Step1_LoginView';
import BlockSettingsView from '../OnboardingViews/Step2_BlockSettingsView';
import ChooseDefaultSearchView from '../OnboardingViews/Step3_ChooseDefaultSearchView';
import ChoosePlanView from '../OnboardingViews/ChoosePlanView';
import SuccessView from '../OnboardingViews/Step5_SuccessView';

/**
 * @class Implement the Onboarding View for the Ghostery Browser Hub
 * @extends Component
 * @memberof GhosteryBrowserHubContainers
 */
class OnboardingViewContainer extends Component {
	constructor(props) {
		super(props);
		this.state = {
			sendMountActions: false,
		};

		const { history } = this.props;
		if (!props.preventRedirect) {
			history.push('/onboarding/1');
		}

		// TODO verify what document title we should use
		const title = t('ghostery_browser_hub_onboarding_page_title');
		window.document.title = title;

		// TODO modify this as needed
		const { actions, setup } = this.props;
		actions.setSetupStep({ setup_step: 7 });
		actions.initSetupProps(setup);

		// TODO modify this as needed
		const { origin, pathname, hash } = window.location;
		window.history.pushState({}, '', `${origin}${pathname}${hash}`);
		this._setDefaultSettings();
	}

	/**
	 * Function to persist the default settings to background
	 */
	// TODO modify this as needed
	_setDefaultSettings() {
		this.setState({ sendMountActions: true });
		const { actions } = this.props;
		actions.setSetupStep({ setup_step: 8 });
		actions.setBlockingPolicy({ blockingPolicy: BLOCKING_POLICY_RECOMMENDED });
		actions.setAntiTracking({ enable_anti_tracking: true }); // covered
		actions.setAdBlock({ enable_ad_block: true }); // covered
		actions.setSmartBlocking({ enable_smart_block: true }); // covered
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Onboarding View of the Ghostery Browser Hub app
	 */
	render() {
		const { sendMountActions } = this.state;
		const steps = [
			{
				index: 0,
				path: '/onboarding/0',
				bodyComponent: WelcomeView,
			}
			{
				index: 1,
				path: '/onboarding/1',
				bodyComponent: LoginView,
			},
			{
				index: 2,
				path: '/onboarding/2',
				bodyComponent: BlockSettingsView,
			},
			{
				index: 3,
				path: '/onboarding/3',
				bodyComponent: ChooseDefaultSearchView,
			},
			{
				index: 4,
				path: '/onboarding/4',
				bodyComponent: ChoosePlanView,
			},
		];

		return (
			<div className="full-height">
				<OnboardingView steps={steps} sendMountActions={sendMountActions} />
			</div>
		);
	}
}

// PropTypes ensure we pass required props of the correct type
// Note: isRequired is not needed when a prop has a default value
OnboardingViewContainer.propTypes = {
	preventRedirect: PropTypes.bool,
	setup: PropTypes.shape({
		navigation: PropTypes.shape({
			activeIndex: PropTypes.number,
			hrefPrev: PropTypes.oneOfType([
				PropTypes.bool,
				PropTypes.string,
			]),
			hrefNext: PropTypes.oneOfType([
				PropTypes.bool,
				PropTypes.string,
			]),
			hrefDone: PropTypes.oneOfType([
				PropTypes.bool,
				PropTypes.string,
			]),
			textPrev: PropTypes.oneOfType([
				PropTypes.bool,
				PropTypes.string,
			]),
			textNext: PropTypes.oneOfType([
				PropTypes.bool,
				PropTypes.string,
			]),
			textDone: PropTypes.oneOfType([
				PropTypes.bool,
				PropTypes.string,
			]),
		}),
		setup_show_warning_override: PropTypes.bool,
		blockingPolicy: PropTypes.string,
		enable_anti_tracking: PropTypes.bool,
		enable_ad_block: PropTypes.bool,
		enable_smart_block: PropTypes.bool,
		enable_human_web: PropTypes.bool,
	}),
	actions: PropTypes.shape({
		getSetupShowWarningOverride: PropTypes.func.isRequired,
		setSetupShowWarningOverride: PropTypes.func.isRequired,
		initSetupProps: PropTypes.func.isRequired,
		setSetupStep: PropTypes.func.isRequired,
		setSetupNavigation: PropTypes.func.isRequired,
		setBlockingPolicy: PropTypes.func.isRequired,
		setAntiTracking: PropTypes.func.isRequired,
		setAdBlock: PropTypes.func.isRequired,
		setSmartBlocking: PropTypes.func.isRequired,
		setHumanWeb: PropTypes.func.isRequired,
		setSetupComplete: PropTypes.func.isRequired,
	}).isRequired,
};

// Default props used throughout the Onboarding flow
OnboardingViewContainer.defaultProps = {
	preventRedirect: false,
	setup: {
		navigation: {
			activeIndex: 0,
			hrefPrev: false,
			hrefNext: false,
			hrefDone: false,
			textPrev: false,
			textNext: false,
			textDone: false,
		},
		setup_show_warning_override: true,
		blockingPolicy: BLOCKING_POLICY_RECOMMENDED,
		enable_anti_tracking: true,
		enable_ad_block: true,
		enable_smart_block: true,
		enable_human_web: true,
	},
};

export default OnboardingViewContainer;
