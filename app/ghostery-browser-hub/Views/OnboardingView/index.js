/**
 * Point of entry index.js file for Ghostery Browser Hub Onboarding View
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

import { withRouter } from 'react-router-dom';

import { buildReduxHOC } from '../../../shared-hub/utils';

import OnboardingViewContainer from './OnboardingViewContainer';
import OnboardingViewReducer from './OnboardingViewReducer';
import * as OnboardingViewActions from './OnboardingViewActions';
import {
	setAdBlock,
	setAntiTracking,
	setSmartBlocking,
} from '../../../shared-hub/actions/AntiSuiteActions';

import setSetupComplete from '../OnboardingViews/SetupDoneView/SetupDoneViewActions';

export const reducer = OnboardingViewReducer;

export default withRouter(buildReduxHOC(
	['setup', 'account'],
	{
		...OnboardingViewActions,
		setBlockingPolicy,
		setAntiTracking,
		setAdBlock,
		setSmartBlocking,
		setSetupComplete
	},
	OnboardingViewContainer
));
