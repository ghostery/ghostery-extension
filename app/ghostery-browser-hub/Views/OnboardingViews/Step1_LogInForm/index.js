/**
 * Point of entry index.js file for Ghostery Browser Hub Onboarding Login View
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

import { buildReduxHOC } from '../../../../shared-hub/utils';

import Step1_LogInFormContainer from './Step1_LogInFormContainer';
import {
	login,
	getUser,
	getUserSettings,
	resetPassword
} from '../../../../Account/AccountActions';
import { getTheme } from '../../../../panel/actions/PanelActions';
import setToast from '../../../../shared-hub/actions/ToastActions';
import { setSetupStep } from '../../../../shared-hub/actions/SetupLifecycleActions';

const stateSlices = ['account'];
const actionCreators = {
	setToast,
	login,
	getUser,
	getUserSettings,
	getTheme,
	resetPassword,
	setSetupStep,
};

export default buildReduxHOC(stateSlices, actionCreators, Step1_LogInFormContainer);
