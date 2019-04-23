/**
 * Ghostery Click2Play Redirect Blocking
 *
 * This file provides script support for Click2Play redirect blocking.
 * It is leveraged by app/blocked_redirect.html
 *
 * It goes like this: user clicks on a link. However this link may
 * not go to expected destination directly. Instead it navigates to
 * a tracker, which is supposed to redirect to the final destination.
 * We block tracker and redirect fails. It looks like Ghostery broke
 * the link. To inform user of what is actually happening we display
 * a generated page with information about the tracker and two buttons
 * which allow user to proceed just once or always (whitelist this tracker)
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
 * @namespace  BlockedRedirectContentScript
 */
import msgModule from './utils/msg';

const msg = msgModule('blocked_redirect');
const { sendMessage, sendMessageInPromise } = msg;

{
	let	APP_ID = 0;
	let URL = '';

	/**
	 * Wrapper of closures for blocked redirect
	 * This script serves the case when original request is not a tracker,
	 * but another one, down the chain of redirects - is. It is loaded
	 * by app/blocked_redirect.html when we navigate browser to it.
	 */
	(function BlockedRedirectContentScript(window, document) {
		/**
		 * Calculate window height.
		 * @memberof BlockedRedirectContentScript
		 * @package
		 *
		 * @return {number} 	inner height of the window
		 */
		function getWindowHeight() {
			let windowHeight = 0;
			if (typeof (window.innerHeight) === 'number') {
				windowHeight = window.innerHeight;
			} else if (document.documentElement && document.documentElement.clientHeight) {
				windowHeight = document.documentElement.clientHeight;
			} else if (document.body && document.body.clientHeight) {
				windowHeight = document.body.clientHeight;
			}
			return windowHeight;
		}
		/**
		 * Set content element to window.
		 * @memberof BlockedRedirectContentScript
		 * @package
		 */
		function setContent() {
			if (document.getElementById) {
				const windowHeight = getWindowHeight();
				if (windowHeight > 0) {
					const contentElement = document.getElementById('content');
					const contentHeight = contentElement.offsetHeight;
					if (windowHeight - contentHeight > 0) {
						contentElement.style.position = 'relative';
						contentElement.style.top = `${(windowHeight / 3) - (contentHeight / 2)}px`;
					} else {
						contentElement.style.position = 'static';
					}
				}
			}
		}
		/**
		 * Dynamically build blocked redirect page using app/blocked_redirect.html as a template.
		 * @memberof BlockedRedirectContentScript
		 * @package
		 */
		function setupDocument(blockedRedirectData) {
			URL = blockedRedirectData.url;
			APP_ID = blockedRedirectData.app_id;
			const { translations, blacklisted } = blockedRedirectData;
			document.title = translations.blocked_redirect_page_title;
			document.getElementById('redirect-prevent').innerHTML = translations.blocked_redirect_prevent;
			document.getElementById('action-always').firstChild.title = translations.blocked_redirect_action_always_title; // firstChild should be the action_always image
			document.getElementById('action-through-once').firstChild.title = translations.blocked_redirect_action_through_once_title; // firstChild should be the action_always image
			if (translations.blocked_redirect_url_content) {
				document.getElementById('redirect-url').innerHTML = translations.blocked_redirect_url_content;
				document.getElementById('redirect-url').style.display = 'block';
			}
			if (blacklisted) {
				// hide 'allow always' button if site is on the blacklist
				document.getElementById('action-always').style.display = 'none';
			}

			document.getElementById('content').style.display = 'block';
		}

		// Setting handler for window 'load' event.
		// The handler dynamically builds Blocked Redirect page for detected tracker.
		window.addEventListener('load', () => {
			setContent();

			const button1 = document.getElementById('action-through-once');
			if (button1) {
				button1.addEventListener('click', (e) => {
					sendMessage(
						'allow_once_page_c2p_tracker',
						{
							app_id: APP_ID,
							url: URL
						}
					);
					e.preventDefault();
				});
			}
			const button2 = document.getElementById('action-always');
			if (button2) {
				button2.addEventListener('click', (e) => {
					sendMessage(
						'allow_always_page_c2p_tracker',
						{
							app_id: APP_ID,
							url: URL
						}
					);
					e.preventDefault();
				});
			}
		});

		// Setting handler for window 'resize' event.
		// This handler recalculates the size of content
		// based on the new window height.
		window.addEventListener('resize', () => {
			setContent();
		});
		// This message delivers specific data for the intercepted tracker.
		sendMessageInPromise('getBlockedRedirectData').then(setupDocument);
	}(window, document));
}
