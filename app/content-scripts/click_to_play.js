/**
 * Ghostery Click2Play
 *
 * This file injects Click2Play functionality into a given tab
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
 * @namespace  Click2PlayContentScript
 */
import msgModule from './utils/msg';
import { log } from '../../src/utils/common';

const msg = msgModule('click_to_play');
const { sendMessage } = msg;
const { onMessage } = chrome.runtime;
/**
 * Use to call init function and initialize Click2PlayContentScript functionality.
 * @var {Object}   initialized with an object with exported init as its property
 */
const Click2PlayContentScript = (function (win, doc) {
	const	C2P_DATA = {};
	/**
	 * Create element for the specified html tag
	 * @memberof Click2PlayContentScript
	 * @package
	 *
	 * @param  {string} type 	html tag
	 * @return {Object}      	DOM element
	 */
	const createEl = function (type) {
		return doc.createElement(type);
	};
	/**
	 * Append one or several children elements to parent
	 * @memberof Click2PlayContentScript
	 * @package
	 *
	 * @param  	{Object} 	parent 	parent DOM element
	 * @param 	{...Object} args 	children DOM element(s)
	 */
	const appendChild = function (parent, ...args) {
		for (let i = 0; i < args.length; i++) {
			parent.appendChild(args[i]);
		}
	};
	/**
	 * Helper called by applyC2P
	 * This function creates a fragment of DOM used for replacement
	 * of a social tracker.
	 * It also sets listeners to mouse 'click' events.
	 * @memberof Click2PlayContentScript
	 * @package
	 *
	 * @param  	{Object} c2pFrame 		iframe DOM element
	 * @param 	{Object} c2pAppDef 		replacement data
	 * @param 	{string} html 			a fragment of html to be used in replacement.
	 */
	const buildC2P = function (c2pFrame, c2pAppDef, html) {
		c2pFrame.addEventListener('load', () => {
			const idoc = c2pFrame.contentDocument;

			idoc.documentElement.innerHTML = html;
			const image = idoc.getElementById('ghostery-button');

			if (c2pAppDef.button) {
				c2pFrame.style.width = `${image.width}px`;
				c2pFrame.style.height = `${image.height}px`;
				c2pFrame.style.border = '0px';
			} else {
				c2pFrame.style.width = '100%';
				c2pFrame.style.border = '1px solid #ccc';
				c2pFrame.style.height = '80px';
			}

			if (c2pAppDef.frameColor) {
				c2pFrame.style.background = c2pAppDef.frameColor;
			}

			const actionOnce = idoc.getElementById('action-once');
			if (actionOnce) {
				actionOnce.addEventListener('click', (e) => {
					sendMessage('processC2P', {
						action: 'once',
						app_ids: c2pAppDef.allow
					}, (result) => {
						doc.location.reload();
					});

					e.preventDefault();
				}, true);
			}

			const actionAlways = idoc.getElementById('action-always');
			if (actionAlways) {
				actionAlways.addEventListener('click', (e) => {
					sendMessage('processC2P', {
						action: 'always',
						app_ids: c2pAppDef.allow
					}, (result) => {
						doc.location.reload();
					});

					e.preventDefault();
				}, true);
			}
		}, false);
	};
	/**
	 * Create a visual replacement for a detected social tracker.
	 * @memberof Click2PlayContentScript
	 * @package
	 *
	 * @param  	{number} app_id 		social tracker id
	 * @param 	{Object} c2p_app		an array with replacement data
	 * @param 	{string} html 			a fragment of html to be used in replacement.
	 */
	const applyC2P = function (app_id, c2p_app, html) {
		c2p_app.forEach((c2pAppDef, idx) => {
			const els = doc.querySelectorAll(c2pAppDef.ele);
			for (let i = 0, num_els = els.length; i < num_els; i++) {
				const el = els[i];

				const c2pFrame = createEl('iframe');
				buildC2P(c2pFrame, c2pAppDef, html[idx]);
				c2pFrame.style.display = 'inline-block';

				if ((c2pAppDef.attach && c2pAppDef.attach === 'parentNode') ||
					(el.nodeName === 'IFRAME')) {
					if (el.parentNode && el.parentNode.nodeName !== 'BODY' && el.parentNode.nodeName !== 'HEAD') {
						el.parentNode.replaceChild(c2pFrame, el);
						return;
					}
				}

				el.textContent = '';

				el.style.display = 'inline-block';
				appendChild(el, c2pFrame);
			}
		});
	};
	/**
	 * Initialize Click2PlayContentScript.
	 * This function sets listener for 'c2p' message coming from background with
	 * tracker-related data. It also sets listener for windows 'load' event.
	 * Called by exported init function.
	 * @memberof Click2PlayContentScript
	 * @package
	 */
	const _initialize = function () {
		onMessage.addListener((request, sender, sendResponse) => {
			if (request.source === 'cliqz-content-script') {
				return false;
			}

			const	{ name } = request;
			const reqMsg = request.msg;

			log('click_to_play.js received message', name);

			if (name === 'c2p') {
				// queue Click-to-Play data so that we process multiple Twitter buttons at once, for example
				C2P_DATA[reqMsg.app_id] = [reqMsg.app_id, reqMsg.data, reqMsg.html];

				if (doc.readyState === 'complete') {
					applyC2P(reqMsg.app_id, reqMsg.data, reqMsg.html);
				}
			}

			sendResponse();
			return true;
		});

		window.addEventListener('load', () => {
			for (const app_id in C2P_DATA) {
				if (C2P_DATA.hasOwnProperty(app_id)) {
					if (C2P_DATA[app_id].length >= 3) {
						applyC2P(C2P_DATA[app_id][0], C2P_DATA[app_id][1], C2P_DATA[app_id][2]);
					}
				}
			}
			// TODO clear C2P_DATA to free memory
		}, { capture: false, passive: true });
	};

	// Public API
	return {
		/**
		 * Initialize functionality
		 * @memberof Click2PlayContentScript
		 * @public
		 */
		init() {
			_initialize();
		}
	};
}(window, document));

Click2PlayContentScript.init();
