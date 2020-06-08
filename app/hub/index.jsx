/**
 * Ghostery Hub React App Init
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2019 Ghostery, Inc. All rights reserved.
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

// Containers
import AppView from './Views/AppView';
import HomeView from './Views/HomeView';
import SetupView from './Views/SetupView';
import TutorialView from './Views/TutorialView';
import PlusView from './Views/PlusView';
import RewardsView from './Views/RewardsView';
import ProductsView from './Views/ProductsView';
import CreateAccountView from './Views/CreateAccountView';
import ForgotPasswordView from '../shared-components/ForgotPassword/ForgotPasswordContainer';
import LogInView from './Views/LogInView';
import UpgradePlanView from './Views/UpgradePlanView';

const store = createStore();

/**
 * Top-Level Component for the Ghostery Hub
 * @memberof HubComponents
 */
const Hub = () => (
	<AppView>
		<Route exact path="/" component={HomeView} />
		<Route exact path="/upgrade" component={UpgradePlanView} />
		<Route path="/setup" component={SetupView} />
		<Route path="/tutorial" component={TutorialView} />
		<Route exact path="/plus" component={PlusView} />
		<Route exact path="/rewards" component={RewardsView} />
		<Route exact path="/products" component={ProductsView} />
		<Route exact path="/create-account" component={CreateAccountView} />
		<Route exact path="/forgot-password" render={() => <ForgotPasswordView hub />} />
		<Route exact path="/log-in" component={LogInView} />
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
