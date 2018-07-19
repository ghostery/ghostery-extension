/**
 * Combine Reducers
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2018 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import { combineReducers } from 'redux';
import blocking from './blocking';
import additionalFeatures from './additionalFeatures';
import display from './display';
import dataCollection from './dataCollection';
import topContent from './topContent';
import login from './login';
import navigation from './navigation';
import settings from '../../panel/reducers/settings';
import account from '../../Account/AccountReducer';

const Reducers = combineReducers({
	blocking,
	additionalFeatures,
	display,
	dataCollection,
	topContent,
	login,
	navigation,
	settings,
	account,
});

export default Reducers;
