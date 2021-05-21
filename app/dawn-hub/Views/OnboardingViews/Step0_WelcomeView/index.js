/**
 * Point of entry index.js file for Dawn Hub onboarding flow Welcome View
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

import { buildReduxHOC } from '../../../../shared-hub/utils';
import WelcomeView from './WelcomeView';
import { setSetupStep } from '../../../../shared-hub/actions/SetupLifecycleActions';
import { getUser } from '../../../../Account/AccountActions';

const actionCreators = {
	setSetupStep,
	getUser
};

export default buildReduxHOC([], actionCreators, WelcomeView);
