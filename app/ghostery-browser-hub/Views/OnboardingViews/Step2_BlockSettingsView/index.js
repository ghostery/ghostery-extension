/**
 * Point of entry index.js file for Ghostery Browser Hub Onboarding Block Settings View
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

import BlockSettingsView from './BlockSettingsView';
import { buildReduxHOC } from '../../../../shared-hub/utils';
import { logout } from '../../../../Account/AccountActions';
import { setAntiTracking, setAdBlock, setSmartBlocking } from '../../../../shared-hub/actions/AntiSuiteActions';
import setBlockingPolicy from '../../../../shared-hub/actions/BlockingPolicyActions';
import setToast from '../../../../shared-hub/actions/ToastActions';
import { setSetupStep } from '../../../../shared-hub/actions/SetupLifecycleActions';

const actionCreators = {
	logout,
	setAntiTracking,
	setAdBlock,
	setSmartBlocking,
	setBlockingPolicy,
	setToast,
	setSetupStep,
};

export default buildReduxHOC(null, actionCreators, BlockSettingsView);
