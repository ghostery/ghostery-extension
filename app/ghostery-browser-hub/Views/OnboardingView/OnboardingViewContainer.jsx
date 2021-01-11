/**
 * Ghostery Browser Hub Onboarding View Container
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2021 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import OnboardingView from './OnboardingView';
import { BLOCKING_POLICY_RECOMMENDED } from '../../../shared-hub/constants/BlockingPolicyConstants';

// Component Views
import WelcomeView from '../OnboardingViews/Step0_WelcomeView';
import Step1_CreateAccountView from '../OnboardingViews/Step1_CreateAccountView';
import BlockSettingsView from '../OnboardingViews/Step2_BlockSettingsView';
import ChooseDefaultSearchView from '../OnboardingViews/Step3_ChooseDefaultSearchView';
import ChoosePlanView from '../OnboardingViews/Step4_ChoosePlanView';
import SuccessView from '../OnboardingViews/Step5_SuccessView';
import {
	ONBOARDING,
	WELCOME,
	LOGIN,
	BLOCK_SETTINGS,
	CHOOSE_DEFAULT_SEARCH,
	CHOOSE_PLAN,
	SUCCESS
} from './OnboardingConstants';

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
		history.push(`/${ONBOARDING}/${WELCOME}`);

		// TODO verify what document title we should use
		const title = t('ghostery_browser_hub_onboarding_page_title');
		window.document.title = title;

		// TODO modify this as needed
		const { actions, setup } = this.props;
		actions.setSetupStep({ setup_step: 7, origin: ONBOARDING });
		actions.initSetupProps(setup);

		// TODO modify this as needed
		const { origin, pathname, hash } = window.location;
		window.history.pushState({}, '', `${origin}${pathname}${hash}`);

		// TODO only invoke if there are no existing settings
		if (true) {
			this.state = {
				sendMountActions: true
			};
			actions.setSetupStep({ setup_step: 8, origin: ONBOARDING });
			actions.setBlockingPolicy({ blockingPolicy: BLOCKING_POLICY_RECOMMENDED });
			actions.setAntiTracking({ enable_anti_tracking: true }); // covered
			actions.setAdBlock({ enable_ad_block: true }); // covered
			actions.setSmartBlocking({ enable_smart_block: true }); // covered
		}
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
				path: `/${ONBOARDING}/${WELCOME}`,
				bodyComponents: [WelcomeView],
			},
			{
				index: 1,
				path: `/${ONBOARDING}/${LOGIN}`,
				bodyComponents: [Step1_CreateAccountView],
			},
			{
				index: 2,
				path: `/${ONBOARDING}/${BLOCK_SETTINGS}`,
				bodyComponents: [BlockSettingsView],
			},
			{
				index: 3,
				path: `/${ONBOARDING}/${CHOOSE_DEFAULT_SEARCH}`,
				bodyComponents: [ChooseDefaultSearchView],
			},
			{
				index: 4,
				path: `/${ONBOARDING}/${CHOOSE_PLAN}`,
				bodyComponents: [ChoosePlanView],
			},
			{
				index: 5,
				path: `/${ONBOARDING}/${SUCCESS}`,
				bodyComponents: [SuccessView],
			}
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
	setup: PropTypes.shape({
		blockingPolicy: PropTypes.string,
		enable_anti_tracking: PropTypes.bool,
		enable_ad_block: PropTypes.bool,
		enable_smart_block: PropTypes.bool,
	}),
	actions: PropTypes.shape({
		initSetupProps: PropTypes.func.isRequired,
		setSetupStep: PropTypes.func.isRequired,
		setSetupComplete: PropTypes.func.isRequired,
		setBlockingPolicy: PropTypes.func.isRequired,
		setAntiTracking: PropTypes.func.isRequired,
		setAdBlock: PropTypes.func.isRequired,
		setSmartBlocking: PropTypes.func.isRequired,
	}).isRequired,
};

// Default props used throughout the Onboarding flow
OnboardingViewContainer.defaultProps = {
	setup: {
		blockingPolicy: BLOCKING_POLICY_RECOMMENDED,
		enable_anti_tracking: true,
		enable_ad_block: true,
		enable_smart_block: true,
	},
};

export default OnboardingViewContainer;
