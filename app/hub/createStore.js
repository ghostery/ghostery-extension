/**
 * React Store Init
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2018 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 *
 * @namespace HubReactStore
 */

import {
	applyMiddleware,
	compose,
	combineReducers,
	createStore
} from 'redux';
import thunk from 'redux-thunk';

import { reducer as home } from './Views/HomeView';
import { reducer as setup } from './Views/SetupView';
import { reducer as tutorial } from './Views/TutorialView';

const reducer = combineReducers({
	setup,
	tutorial,
	home,
});

/**
 * Build store using combined reducers and middleware
 * @return {[type]} [description]
 * @return {Object}
 * @memberof HubReactStore
 */
export default function () {
	return createStore(
		reducer,
		compose(
			applyMiddleware(thunk),
			window.devToolsExtension ? window.devToolsExtension() : f => f
		),
	);
}
