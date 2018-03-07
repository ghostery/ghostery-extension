/**
 * Ghostery Setup Page React App Init
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

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from './store/configureStore';

// components
import App from './components/App';

// containers
import UpgradeView from './components/Views/UpgradeView';
import SetupChoiceView from './containers/Views/SetupChoiceViewContainer';
import BlockingView from './containers/Views/BlockingViewContainer';
import CustomBlockView from './containers/Views/CustomBlockContainer';
import AdditionalFeaturesView from './containers/Views/AdditionalFeaturesViewContainer';
import DisplayView from './containers/Views/DisplayViewContainer';
import LogInView from './containers/Views/LogInViewContainer';
import DataCollectionView from './containers/Views/DataCollectionViewContainer';
import DoneView from './containers/Views/DoneViewContainer';

const store = configureStore();

/**
 * Top-Level Component for Ghostery Setup flow.
 * @memberof SetupClasses
 */
const Setup = () => (
	<App store={store}>
		<Route exact path="/" component={SetupChoiceView} />
		<Route path="/blocking" component={BlockingView} />
		<Route path="/blocking/custom" component={CustomBlockView} />
		<Route path="/additional-features" component={AdditionalFeaturesView} />
		<Route path="/display" component={DisplayView} />
		<Route path="/log-in" component={LogInView} />
		<Route path="/data-collection" component={DataCollectionView} />
		<Route path="/done" component={DoneView} />
		<Route path="/upgrade" component={UpgradeView} />
	</App>
);

ReactDOM.render(
	(
		<Provider store={store}>
			<Router hashType="noslash">
				<Setup />
			</Router>
		</Provider>
	), document.getElementById('root'),
);
