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

const viewport = document.getElementById('viewport');
const rewardsContainer = document.createElement('div');
const channelsSupported = (typeof chrome.runtime.connect === 'function');

let port;
/* TODO remove test reward data */
let reward = {
	rewardCode: 'SDF75DSUI90',
	expireTime: '14 days',
	termsLink: 'https://www.ghostery.com/about-ghostery/browser-extension-privacy-policy/',
	redeemLink: 'https://www.ghostery.com/',
	benefit: '2 Free',
	headline: 'Audio Books',
	description: 'Description of the offer. There is a lot of exciting stuff going on.'
}

rewardsContainer.id = 'rewards-container';

function handleMessages(request, sender, response) {
	/* TODO get new reward from request, and set it as new reward */
	if (document.readyState === "complete") {
		console.log('re render root react')
		ReactDOM.render(<MainView reward={reward} />, document.getElementById('rewards-container'));
	}
}

if (channelsSupported) {
	port = chrome.runtime.connect({ name: 'rewardsPort' });
	if (port) {
		port.onMessage.addListener(handleMessages);
		port.postMessage({ name: 'rewardsLoaded' });
	}
} else {
	onMessage.addListener(handleMessages);
}

const MainView = (props) => {
	console.log('MainView props:', props);
	return (
		<Router history={history}>
			<div className="ghostery-rewards-container ghostery-top ghostery-right ghostery-collapsed">
				<Route exact path="/" render={ ()=> <HotDog reward={props.reward} /> } />
				<Route path="/hotdog" render={ ()=> <HotDog reward={props.reward} /> } />
				<Route path="/offercard" render={ ()=> <OfferCard reward={props.reward} /> } />
			</div>
		</Router>
	)
};

document.addEventListener('DOMContentLoaded', (event) => {
	document.body.appendChild(rewardsContainer);
	ReactDOM.render(<MainView reward={reward}/>, document.getElementById('rewards-container'));
});
