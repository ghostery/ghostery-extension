/**
 * Ghostery Browser Hub Onboarding View Action creators
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

import { log, sendMessageInPromise } from '../../../hub/utils';
import {
	INIT_ONBOARDING_PROPS,
	SET_ONBOARDING_STEP,
	SET_ONBOARDING_NAVIGATION
} from './OnboardingViewConstants';

export function initOnboardingProps(data) {
	return {
		type: INIT_ONBOARDING_PROPS,
		data,
	};
}

export function setOnboardingStep(actionData) {
	return function(dispatch) {
		return sendMessageInPromise(SET_ONBOARDING_STEP, actionData).then((data) => {
			dispatch({
				type: SET_ONBOARDING_STEP,
				data,
			});
		}).catch((err) => {
			log('onboardingView Action setOnboardingStep Error', err);
		});
	};
}

export function setOnboardingNavigation(data) {
	return {
		type: SET_ONBOARDING_NAVIGATION,
		data,
	};
}
