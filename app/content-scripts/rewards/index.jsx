/**
 * Ghostery Rewards
 *
 * This file injects Ghostery Rewards
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
 * @namespace RewardsContentScript
 */
/* eslint no-use-before-define: 0 */

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route } from 'react-router-dom';
import history from '../../panel/utils/history';
import HotDog from './HotDog';
import OfferCard from './OfferCard';

// import closeIconImage from '../data-images/purple_box/closeIconImage';

const viewport = document.getElementById('viewport');
const rewardsContainer = document.createElement('div');
rewardsContainer.id = 'rewards-container';

const MainView = () => (
	<Router history={history}>
		<div className="ghostery-rewards-container ghostery-top ghostery-right ghostery-collapsed">
			<Route exact path="/" component={HotDog} />
			<Route path="/hotdog" component={HotDog} />
			<Route path="/offercard" component={OfferCard} />
		</div>
	</Router>
);

document.addEventListener('DOMContentLoaded', (event) => {
	document.body.appendChild(rewardsContainer);
	ReactDOM.render(<MainView />, document.getElementById('rewards-container'));
});
