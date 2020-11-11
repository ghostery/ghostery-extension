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

import {
	applyMiddleware,
	compose,
	combineReducers,
	createStore
} from 'redux';
import thunk from 'redux-thunk';

import { reducer as app } from './Views/AppView';
import { reducer as main } from './Views/MainView';
import account from '../Account/AccountReducer';
import settings from '../panel/reducers/settings';

const reducer = combineReducers({
	app,
	account,
	settings,
});

/**
 * Build store using combined reducers and middleware
 * @return {Object}
 * @memberof HubReactStore
 */
export default function() {
	return createStore(
		reducer,
		compose(
			applyMiddleware(thunk),
			window.devToolsExtension ? window.devToolsExtension() : f => f
		),
	);
}
