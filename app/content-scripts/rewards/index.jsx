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
import globals from '../../../src/classes/Globals';
import ShadowDOM from 'react-shadow';

const { BROWSER_INFO } = globals;
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

rewardsContainer.id = 'ghostery-rewards-container';
rewardsContainer.className = 'show ghostery-rewards-container';
// rewardsContainer.attachShadow({mode: 'open'});

function handleMessages(request, sender, response) {
	console.log(request);
	/* TODO get new reward from request, and set it as new reward */
	if (document.readyState === "complete") {
		console.log('re render root react')
		ReactDOM.render(<MainView reward={reward} />, document.getElementById('ghostery-rewards-container'));
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

let MainView;
if (BROWSER_INFO.name === 'chrome') {
	MainView = (props) => {
		return (
			<Router history={history}>
				<ShadowDOM include={[chrome.extension.getURL('dist/css/rewards_styles.css')]}>
					<div>
						<Route exact path="/" render={ ()=> <HotDog reward={props.reward} /> } />
						<Route path="/hotdog" render={ ()=> <HotDog reward={props.reward} /> } />
						<Route path="/offercard" render={ ()=> <OfferCard reward={props.reward} /> } />
					</div>
				</ShadowDOM>
			</Router>
		);
	}
} else {
	MainView = (props) => {
		return (
			<Router history={history}>
				<div>
					<Route exact path="/" render={ ()=> <HotDog reward={props.reward} /> } />
					<Route path="/hotdog" render={ ()=> <HotDog reward={props.reward} /> } />
					<Route path="/offercard" render={ ()=> <OfferCard reward={props.reward} /> } />
				</div>
			</Router>
		);
	}
}

document.addEventListener('DOMContentLoaded', (event) => {
	document.body.appendChild(rewardsContainer);
	ReactDOM.render(<MainView reward={reward}/>, document.getElementById('ghostery-rewards-container'));
});
