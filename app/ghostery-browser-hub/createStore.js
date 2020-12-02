/**
 * Ghostery Browser Hub React Store Init
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2020 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 *
 * @namespace GhosteryBrowserHubReactStore
 */

import thunk from 'redux-thunk';

import { createStoreFactory } from '../shared-hub/utils/index';

import { reducer as app } from './Views/AppView';
import { reducer as onboarding } from './Views/OnboardingView';
import account from '../Account/AccountReducer';
import settings from '../panel/reducers/settings';

const reducers = {
	app,
	onboarding,
	account,
	settings
};

export default () => createStoreFactory(reducers, [thunk]);
