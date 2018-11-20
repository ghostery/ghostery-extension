/**
 * Ghostery Hub React App Init
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
 * @namespace HubComponents
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import createStore from './createStore';

// Components
import App from './components/App';

// Containers
import HomeView from './Views/HomeView';
import SetupView from './Views/SetupView';
import TutorialView from './Views/TutorialView';
import SupporterView from './Views/SupporterView';
import RewardsView from './Views/RewardsView';
import ProductsView from './Views/ProductsView';
import CreateAccountView from './Views/CreateAccountView';
import LogInView from './Views/LogInView';

const store = createStore();

/**
 * Top-Level Component for the Ghostery Hub
 * @memberof HubComponents
 */
const Hub = () => (
	<App>
		<Route exact path="/" component={HomeView} />
		<Route path="/setup" component={SetupView} />
		<Route path="/tutorial" component={TutorialView} />
		<Route exact path="/supporter" component={SupporterView} />
		<Route exact path="/rewards" component={RewardsView} />
		<Route exact path="/products" component={ProductsView} />
		<Route exact path="/create-account" component={CreateAccountView} />
		<Route exact path="/log-in" component={LogInView} />
	</App>
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
