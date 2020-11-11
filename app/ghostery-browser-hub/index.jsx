/**
 * Ghostery Ghostery-Browser-Specific Hub React App Init
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
 * @namespace GhosteryBrowserHubComponents
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import createStore from './createStore';

// Containers
import AppView from './Views/AppView';
import MainView from './Views/MainView';

const store = createStore();

ReactDOM.render(
	(
		<Provider store={store}>
			<AppView>
				<MainView />
			</AppView>
		</Provider>
	), document.getElementById('root'),
);
