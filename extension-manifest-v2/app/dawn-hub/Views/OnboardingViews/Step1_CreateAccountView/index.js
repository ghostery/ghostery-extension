/**
 * Point of entry index.js file for Dawn Hub onboarding flow Create Account View
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
import Step1_CreateAccountView from './Step1_CreateAccountView';
import { setSetupStep } from '../../../../shared-hub/actions/SetupLifecycleActions';
import setToast from '../../../../shared-hub/actions/ToastActions';

const actionCreators = {
	setSetupStep,
	setToast
};

export default buildReduxHOC(['account'], actionCreators, Step1_CreateAccountView);
