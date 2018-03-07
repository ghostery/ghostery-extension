/**
 * Navigation Action creators
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

import {
	SHOW_LOADING_NAVIGATION_BUTTON,
	HIDE_LOADING_NAVIGATION_BUTTON,
	UPDATE_NAVIGATION_NEXT_BUTTON,
	RESET_NAVIGATION_NEXT_BUTTON,
	NAVIGATION_NEXT,
	CREATE_ACCOUNT,
	SIGN_IN
} from '../constants/constants';
import { msg } from '../utils';

/**
 * Called from DoneView and LoginView's componentWillMount() function
 * @param  {Object} data
 * @return {Object}
 * @memberof SetupActions
 */
export function updateNavigationNextButtons(data) {
	return {
		type: UPDATE_NAVIGATION_NEXT_BUTTON,
		data,
	};
}

/**
 * Called from many SubView's componentWillMount() function
 * @return {Object}
 * @memberof SetupActions
 */
export function resetNavigationNextButton() {
	return {
		type: RESET_NAVIGATION_NEXT_BUTTON,
	};
}

/**
 * Called from Navigation and LoginView views
 * @return {Object}
 * @memberof SetupActions
 */
export function triggerCreateAccount() {
	return {
		type: CREATE_ACCOUNT,
	};
}

/**
 * Called from Navigation and LoginView views
 * @return {Object}
 * @memberof SetupActions
 */
export function triggerSignIn() {
	return {
		type: SIGN_IN,
	};
}

/**
 * Called from Navigation._close()
 * @memberof SetupActions
 */
export function close() {
	msg.sendMessage('closeSetup');
}

/**
 * Called from LoginView componentWillReceiveProps, _signIn, _createAccount funcitons
 * @return {Object}
 * @memberof SetupActions
 */
export function showLoading() {
	return {
		type: SHOW_LOADING_NAVIGATION_BUTTON,
	};
}

/**
 * Called from LoginView.componentWillReceiveProps() function
 * @return {Object}
 * @memberof SetupActions
 */
export function hideLoading() {
	return {
		type: HIDE_LOADING_NAVIGATION_BUTTON,
	};
}

/**
 * Called from LoginView.componentWillReceiveProps() function
 * @return {Object}
 * @memberof SetupActions
 */
export function navigationNext() {
	return {
		type: NAVIGATION_NEXT,
	};
}
