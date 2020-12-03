/**
 * Setup Lifecycle Actions for the Hubs
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

import { makeDeferredDispatcher } from '../utils';
import {
	INIT_SETUP_PROPS,
	SET_SETUP_STEP,
	SET_SETUP_NAVIGATION,
	SET_SETUP_COMPLETE
} from '../constants/SetupLifecycleConstants';

export function initSetupProps(data) {
	return {
		type: INIT_SETUP_PROPS,
		data,
	};
}

export const setSetupStep =
	actionData => makeDeferredDispatcher(SET_SETUP_STEP, actionData);

export function setSetupNavigation(data) {
	return {
		type: SET_SETUP_NAVIGATION,
		data,
	};
}

export const setSetupComplete =
	actionData => makeDeferredDispatcher(SET_SETUP_COMPLETE, actionData);
