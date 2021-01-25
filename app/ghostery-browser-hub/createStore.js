/**
 * Ghostery Browser Hub React Store Init
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2021 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 *
 * @namespace GhosteryBrowserHubReactStore
 */

import thunk from 'redux-thunk';

import { makeStoreCreator } from '../shared-hub/utils/index';

import toast from '../shared-hub/reducers/ToastReducer';
import antiSuite from '../shared-hub/reducers/AntiSuiteReducer';
import blockingPolicy from '../shared-hub/reducers/BlockingPolicyReducer';
import defaultSearch from './Views/OnboardingViews/Step3_ChooseDefaultSearchView/ChooseDefaultSearchReducer';
import setupLifecycle from '../shared-hub/reducers/SetupLifecycleReducer';
import account from '../Account/AccountReducer';
import settings from '../panel/reducers/settings';

const reducers = {
	toast,
	antiSuite,
	blockingPolicy,
	defaultSearch,
	setupLifecycle,
	account,
	settings
};

export default makeStoreCreator(reducers, [thunk]);
