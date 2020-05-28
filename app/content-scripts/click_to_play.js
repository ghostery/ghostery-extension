/**
 * Ghostery Click2Play
 *
 * This file injects Click2Play functionality into a given tab
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2019 Ghostery, Inc. All rights reserved.
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
const Click2PlayContentScript = (function(win, doc) {
	/**
	 * Create element for the specified html tag
	 * @memberof Click2PlayContentScript
	 * @package
	 *
	 * @param  {string} type 	html tag
	 * @return {Object}      	DOM element
	 */
	const createEl = function(type) {
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
	const appendChild = function(parent, ...args) {
		for (let i = 0; i < args.length; i++) {
			parent.appendChild(args[i]);
		}
	};
	/**
	 * Helper function called by applyC2P(). This function creates a
	 * DOM fragment used to replace a social tracker. It also sets
	 * listeners for mouse 'click' events.
	 * @memberof Click2PlayContentScript
	 * @package
	 *
	 * @param  	{Object} c2pFrame 		iframe DOM element
	 * @param 	{Object} c2pAppDef 		replacement data
	 * @param 	{string} html 			a fragment of html to be used in replacement.
	 */
	const buildC2P = function(c2pFrame, c2pAppDef, html) {
		c2pFrame.addEventListener('load', () => {
			const idoc = c2pFrame.contentDocument;
			idoc.documentElement.innerHTML = html;
			if (c2pAppDef.button) {
				c2pFrame.style.width = '30px';
				c2pFrame.style.height = '19px';
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
					}, () => {
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
					}, () => {
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
	const applyC2P = function(app_id, c2p_app, html) {
		c2p_app.forEach((c2pAppDef, idx) => {
			const els = doc.querySelectorAll(c2pAppDef.ele);
			for (let i = 0; i < els.length; i++) {
				const el = els[i];
				const c2pFrame = createEl('iframe');

				buildC2P(c2pFrame, c2pAppDef, html[idx]);
				c2pFrame.style.display = 'inline-block';

				// Attach C2P frame inside the parentNode
				if ((c2pAppDef.attach && c2pAppDef.attach === 'parentNode') || (el.nodeName === 'IFRAME')) {
					if (el.parentNode && el.parentNode.nodeName !== 'BODY' && el.parentNode.nodeName !== 'HEAD') {
						el.parentNode.replaceChild(c2pFrame, el);
					}
				} else {
					// Replace existing node with C2P content
					el.textContent = '';
					el.style.display = 'inline-block';
					appendChild(el, c2pFrame);
				}
			}
		});
	};
	/**
	 * Initialize Click2PlayContentScript. This function sets a listener for 'c2p' messages
	 * with tracker-related data. This script is injected on document_idle after DOM complete.
	 * Called by exported init() function.
	 * @memberof Click2PlayContentScript
	 * @package
	 */
	const _initialize = function() {
		onMessage.addListener((request, sender, sendResponse) => {
			if (request.source === 'cliqz-content-script') {
				return false;
			}

			const { name, message } = request;
			log('click_to_play.js received message', name);

			if (name === 'c2p') {
				if (message) {
					// Dequeue C2P data stored while the script injection was taking place
					const messageKeys = Object.keys(message);
					for (let i = 0; i < messageKeys.length; i++) {
						const app_id = messageKeys[i];
						applyC2P(app_id, message[app_id].data, message[app_id].html);
						delete message[app_id];
					}
				}
			}

			sendResponse();
			return false;
		});
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
