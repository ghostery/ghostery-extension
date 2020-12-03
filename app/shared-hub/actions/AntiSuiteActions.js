/**
 * Anti Suite Action Creators for the Hubs to use
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
	SET_ANTI_TRACKING,
	SET_AD_BLOCK,
	SET_SMART_BLOCK
} from '../constants/AntiSuiteConstants';

export const setAntiTracking =
		actionData => makeDeferredDispatcher(SET_ANTI_TRACKING, actionData);

export const setAdBlock =
		actionData => makeDeferredDispatcher(SET_AD_BLOCK, actionData);

export const setSmartBlocking =
		actionData => makeDeferredDispatcher(SET_SMART_BLOCK, actionData);
