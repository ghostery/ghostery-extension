/**
 * Ghostery React App Init
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
/**
 * @namespace  PanelClasses
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import history from './utils/history';
import Panel from './containers/PanelContainer';
import Summary from './containers/SummaryContainer';
import Detail from './containers/DetailContainer';
import Settings from './containers/SettingsContainer';
import Subscription from './containers/SubscriptionContainer';
import Login from './containers/LoginContainer';
import CreateAccount from './containers/CreateAccountContainer';
import ForgotPassword from './containers/ForgotPasswordContainer';
import AccountSuccess from './containers/AccountSuccessContainer';
import configureStore from './store/configureStore';
import Help from './components/Help';
import About from './components/About';
import Subscribe from './components/Subscribe';
// import { sendMessageInPromise } from './utils/msg';
// import { setTheme } from './utils/utils';

const store = configureStore();
/**
 * @var {ReactComponent} 	Ghostery	Top-level component for Ghostery panel.
 * @memberOf PanelClasses
 */
const Ghostery = () => (
	<Panel>
		{/* Load Summary on both "/"" and "/detail" paths */}
		<Route path="/(|detail)/" component={Summary} />
		<Route path="/detail" component={Detail} />
		<Route path="/settings" component={Settings} />
		<Route path="/help" component={Help} />
		<Route path="/about" component={About} />
		<Route path="/subscription" component={Subscription} />
		<Route path="/subscribe/:supporter" component={Subscribe} />
		<Route path="/login" component={Login} />
		<Route path="/create-account" component={CreateAccount} />
		<Route path="/forgot-password" component={ForgotPassword} />
		<Route path="/account-success" component={AccountSuccess} />
	</Panel>
);

// sendMessageInPromise('getPanelData', {
// 			view: 'subscription',
// 		}).then((data) => {
// 			setTheme(document, data.currentTheme, data.theme);
ReactDOM.render(
	(
		<Provider store={store}>
			<Router history={history}>
				<Ghostery />
			</Router>
		</Provider>
	), document.getElementById('ghostery-content'),
);
//		});

