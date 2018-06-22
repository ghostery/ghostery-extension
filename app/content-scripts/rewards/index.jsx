/**
 * Ghostery Rewards
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
import ShadowDOM from 'react-shadow';
import HotDog from './HotDog';
import OfferCard from './OfferCard';
import msgModule from '../utils/msg';
import history from '../../panel/utils/history';
import globals from '../../../src/classes/Globals';

const msg = msgModule('rewards');
const { sendMessage } = msg;
const { BROWSER_INFO, onMessage } = globals;
const viewport = document.getElementById('viewport');
const channelsSupported = (typeof chrome.runtime.connect === 'function');

/**
 * @class Injects Ghostery Rewards components
 * @memberOf RewardsContentScript
 */
class RewardsApp {
	constructor() {
		this.reward = null;
		this.conf = null;
		this.rewardsContainer = document.createElement('div');
		this.rewardsApp = document.createElement('div');
		this.rewardsIframe = null;
		this.iframeStyle = null;
		this.port = null;
		this.mainView = null;
		this.rewardsApp.id = 'ghostery-rewards-app';
		this.rewardsApp.className = 'show';

		this.handleMessages = this.handleMessages.bind(this);
		this.sendSignal = this.sendSignal.bind(this);
		this.messageBackground = this.messageBackground.bind(this);
		this.removeFocusListener = this.removeFocusListener.bind(this);
		this.focusListener = this.focusListener.bind(this);
		this.addRewardSeenListener = this.addRewardSeenListener.bind(this);

		this.actions = {
			sendSignal: this.sendSignal,
			messageBackground: this.messageBackground,
			removeFocusListener: this.removeFocusListener,
			addRewardSeenListener: this.addRewardSeenListener
		};

		this.init();
	}

	init() {
		if (document.readyState === 'complete'
		|| document.readyState === 'loaded'
		|| document.readyState === 'interactive'
		) {
			this.start();
		} else {
			document.addEventListener('DOMContentLoaded', (event) => {
				this.start();
			});
		}
	}

	start() {
		if (document.head.createShadowRoot || document.head.attachShadow) {
			this.renderShadow();
		} else {
			// use iframe to encapsulate CSS - fallback for everything else besides chrome
			this.renderIframe();
		}
	}

	renderReact() {
		const MainView = this.mainView;
		ReactDOM.render(<MainView reward={this.reward} conf={this.conf} actions={this.actions} />, this.rewardsApp);
	}

	renderShadow() {
		// use shadowDOM to encapsulate CSS - fully supported in Chrome
		this.rewardsContainer.appendChild(this.rewardsApp);
		document.body.appendChild(this.rewardsContainer);
		this.mainView = props => (
			<Router history={history}>
				<ShadowDOM include={[chrome.extension.getURL('dist/css/rewards_styles.css')]}>
					<div id="ghostery-shadow-root">
						<Route
							exact
							path="/"
							render={
								() => <HotDog reward={props.reward} port={this.port} actions={props.actions} />
							}
						/>
						<Route
							path="/hotdog"
							render={
								() => <HotDog reward={props.reward} port={this.port} actions={props.actions} />
							}
						/>
						<Route
							path="/offercard"
							render={
								() => <OfferCard reward={props.reward} conf={props.conf} port={this.port} actions={props.actions} />
							}
						/>
					</div>
				</ShadowDOM>
			</Router>
		);
		this.renderReact();
		this.initListener();
	}

	renderIframe() {
		this.rewardsIframe = document.createElement('iframe');
		this.rewardsIframe.id = 'ghostery-iframe-container';
		this.rewardsIframe.classList.add('hot-dog');
		this.rewardsIframe.onload = () => {
			this.iframeStyle = document.createElement('link');
			this.iframeStyle.rel = 'stylesheet';
			this.iframeStyle.type = 'text/css';
			this.iframeStyle.href = chrome.extension.getURL('dist/css/rewards_styles.css');

			this.rewardsIframe.contentWindow.document.head.appendChild(this.iframeStyle);
			this.rewardsContainer = this.rewardsIframe.contentWindow.document.body;

			this.rewardsApp.classList.add('iframe-child');
			this.rewardsContainer.appendChild(this.rewardsApp);
			this.mainView = props => (
				<Router history={history}>
					<div>
						<Route
							exact
							path="/"
							render={
								() => <HotDog reward={props.reward} port={this.port} actions={props.actions} />
							}
						/>
						<Route
							path="/hotdog"
							render={
								() => <HotDog reward={props.reward} port={this.port} actions={props.actions} />
							}
						/>
						<Route
							path="/offercard"
							render={
								() => <OfferCard reward={props.reward} conf={props.conf} port={this.port} actions={props.actions} />
							}
						/>
					</div>
				</Router>
			);
			this.renderReact();
			this.initListener();
		};
		document.body.appendChild(this.rewardsIframe);
	}

	initListener() {
		if (channelsSupported) {
			this.port = chrome.runtime.connect({ name: 'rewardsPort' });
			if (this.port) {
				this.port.onMessage.addListener(this.handleMessages);
				this.port.postMessage({ name: 'rewardsLoaded' });
			}
		} else {
			// TODO listen for this in background.js
			sendMessage('rewardsLoaded');
			onMessage.addListener(this.handleMessages);
		}
	}

	handleMessages(request, sender, response) {
		if (request.name === 'showHotDog') {
			this.reward = request.reward;
			this.conf = request.conf;
		}
		if (document.readyState === 'complete' || document.readyState === 'interactive') {
			this.renderReact();
		}
	}

	focusListener() {
		this.sendSignal('offer_shown');
	}

	addRewardSeenListener() {
		window.addEventListener('focus', this.focusListener);
	}

	removeFocusListener() {
		window.removeEventListener('focus', this.focusListener);
	}

	messageBackground(name, message) {
		if (this.port) {
			this.port.postMessage({
				name,
				message
			});
		} else {
			sendMessage(name, message);
		}
	}

	sendSignal(actionId, offerSignal = true) {
		// Cliqz metrics
		const offerId = offerSignal ? this.reward.offer_id : null;
		const message = {
			offerId,
			actionId,
			origin: 'rewards-hotdog-card',
			type: !offerSignal ? 'action-signal' : 'offer-action-signal',
		};
		this.messageBackground('rewardSignal', message);
	}
}

const rewardsApp = new RewardsApp();
