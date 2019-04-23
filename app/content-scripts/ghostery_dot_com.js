/**
 * Ghostery.com Extension Support
 *
 * This file connects the extension to the Ghostery website
 * located at https://www.ghostery.com/products/
 * and Apps pages located at https://apps.ghostery.com/ and
 * https://gcache.ghostery.com/
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
 * @namespace  GhosteryDotComContentScript
 */
/* eslint import/no-extraneous-dependencies: 0 */

import $ from 'jquery';
import msgModule from './utils/msg';
import './vendor/bootstrap_tooltip';

const msg = msgModule('ghostery_dot_com');
const { sendMessage } = msg;
const { onMessage } = chrome.runtime;
/**
 * This context script is injected statically through manifest.json
 * Along with it a stylesheet ghostery_dot_com_css is injected, also
 * through the manifest. Functions in this script refer both to element
 * selectors provided by pages and to style class names provided by
 * injected stylesheet.
 *
 * Use this variable to call init and initialize functionality of this script.
 * @var {Object}   	initialized with an object with init as its property
 */
const GhosteryDotComContentScript = (function (window) {
	/**
	 * Update https://www.ghostery.com/Products page to signify
	 * that Ghoster extension is installed.
	 * @memberOf  GhosteryDotComContentScript
	 * @package
	 */
	const productsPage = function () {
		const $installButton = $('.install-button').not('.disabled');
		$installButton.addClass('success').text('Installed ✓');
		$installButton.removeAttr('onclick');
		$('.success').on('click', (e) => {
			e.preventDefault();
		});
	};

	/**
	 * Animate blocking tracker button on tracker pages
	 * https://apps.ghostery.com/en/apps/<tracker_name>
	 * @memberOf  GhosteryDotComContentScript
	 * @package
	 */
	const toggleBlocking = function (blocked, duration) {
		if (!blocked) {
			$('#app-global-blocking').animate({ 'background-position-x': '-17px' }, {
				duration,
				complete() {
					$(this).removeClass('blocked').addClass('unblocked');
					$(this).parent().removeClass('blocked').addClass('unblocked');
				}
			});
		} else {
			$('#app-global-blocking').animate({ 'background-position-x': '3px' }, {
				duration,
				complete() {
					$(this).removeClass('unblocked').addClass('blocked');
					$(this).parent().removeClass('unblocked').addClass('blocked');
				}
			});
		}
	};
	/**
	 * Connect to blocking box on https://apps.ghostery.com/en/apps/<tracker_name>
	 * @memberOf  GhosteryDotComContentScript
	 * @package
	 */
	const appsPages = function () {
		const $appGlobalBlocking = $('#app-global-blocking');
		const $blockingBox = $('#blockingbox');
		const app_id = $blockingBox.data('id');
		let	alreadyLoaded = false;
		let tooltipTimeout;

		sendMessage('appsPageLoaded', {
			id: app_id
		});

		onMessage.addListener((request) => {
			if (request.source === 'cliqz-content-script') {
				return false;
			}

			const { name } = request;
			let { blocked } = request.message;

			if (name === 'appsPageData' && !alreadyLoaded) {
				// TODO why does background page occasionally send response twice?
				alreadyLoaded = true;

				$('#ghosterybox').hide();
				$blockingBox.show();

				toggleBlocking(blocked, 0);

				$appGlobalBlocking.on('click', () => {
					blocked = !blocked;

					sendMessage('panelSelectedAppsUpdate', {
						app_id,
						app_selected: blocked
					});

					$('#global-blocking-control')
						.tooltip('destroy')
						.tooltip({
							trigger: 'manual',
							title: `Tracker ${blocked ? 'blocked' : 'unblocked'}`,
							placement: 'bottom'
						})
						.tooltip('show');

					window.clearTimeout(tooltipTimeout);
					tooltipTimeout = window.setTimeout(() => {
						$('#global-blocking-control').tooltip('destroy');
					}, 1400);

					toggleBlocking(blocked, 'fast');
				});
			}
			return false;
		});
	};
	/**
	 * Selectively initialize functionality for www.ghostery.com,
	 * apps.ghostery.com or gcache.ghostery.com platform pages.
	 * @memberOf  GhosteryDotComContentScript
	 * @package
	 */
	const _initialize = function () {
		// initialize products page
		if ($('section.products-template').length) {
			productsPage();
		}
		// initialize apps pages
		if ($('#ghosterybox').length) {
			appsPages();
		}
	};

	// Public API
	return {
		/**
		 * Initialize functionality for product pages.
		 * @memberOf  GhosteryDotComContentScript
		 * @public
		 */
		init() {
			_initialize();
		}
	};
}(window));

// Run our init on DOMReady
$(document).ready(() => {
	GhosteryDotComContentScript.init();
});
