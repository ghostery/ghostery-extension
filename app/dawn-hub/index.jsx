/**
 * Dawn Hub React App Init
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
 * @namespace DawnHubViews
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { HashRouter as Router, Route } from 'react-router-dom';

import createStore from './createStore';

// Views
import AppView from './Views/AppView';
import OnboardingView from './Views/OnboardingView';

const store = createStore();

/**
 * Top-Level view for the Dawn Hub
 * @memberof DawnHubViews
 */
const Hub = () => (
	<AppView>
		<Route path="/" component={OnboardingView} />
	</AppView>
);

ReactDOM.render(
	(
		<Provider store={store}>
			<Router hashType="noslash">
				<Hub />
			</Router>
		</Provider>
	), document.getElementById('root'),
);
