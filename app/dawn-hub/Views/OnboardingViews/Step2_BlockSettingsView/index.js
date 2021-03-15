/**
 * Point of entry index.js file for Dawn Hub onboarding flow Onboarding Block Settings View
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

import { withRouter } from 'react-router-dom';
import BlockSettingsView from './BlockSettingsView';
import { buildReduxHOC } from '../../../../shared-hub/utils';
import { setAntiTracking, setAdBlock, setSmartBlocking } from '../../../../shared-hub/actions/AntiSuiteActions';
import setBlockingPolicy from '../../../../shared-hub/actions/BlockingPolicyActions';
import setToast from '../../../../shared-hub/actions/ToastActions';
import { setSetupStep, setBlockSetupSeen } from '../../../../shared-hub/actions/SetupLifecycleActions';

const actionCreators = {
	setAntiTracking,
	setAdBlock,
	setSmartBlocking,
	setBlockingPolicy,
	setBlockSetupSeen,
	setToast,
	setSetupStep,
};

export default withRouter(buildReduxHOC(['setupLifecycle', 'antiSuite', 'blockingPolicy'], actionCreators, BlockSettingsView));
