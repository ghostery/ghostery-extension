/**
 * Point of entry index.js file for Ghostery Browser Hub Create Account Form
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
import Step1_CreateAccountFormContainer from './Step1_CreateAccountFormContainer';
import { register, getUser, subscribeToEmailList } from '../../../../Account/AccountActions';
import { setToast } from '../../../../hub/Views/AppView/AppViewActions';

const stateSlices = ['account'];
const actionCreators = {
	setToast,
	register,
	getUser,
	subscribeToEmailList
};

export default buildReduxHOC(stateSlices, actionCreators, Step1_CreateAccountFormContainer);
