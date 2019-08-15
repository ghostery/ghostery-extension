/**
 * Ghostery Page Performance
 *
 * This file generates page-level metrics using the
 * Web Performance API. It is called via background.js `onNavigationCompleted()`.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/performance
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
 * @namespace PagePerformanceContentScript
 */
import msgModule from './utils/msg';
import { log } from '../../src/utils/common';

const msg = msgModule('page_performance');
const { sendMessage } = msg;
/**
 * Use to call init to initialize functionality
 * @var  {Object} initialized to an object with init method as its property
 */
const PageInfo = (function(window, document) {
	let state = document.readyState;
	/**
	 * Calculate page domain and latency. Send pageInfo to background.js.
	 * @memberOf PagePerformanceContentScript
	 * @package
	 */
	const analyzePageInfo = function() {
		const { host, pathname, protocol } = document.location;
		const pTime = (performance.timing.domContentLoadedEventStart - performance.timing.requestStart);
		const pageLatency = pTime || 0;

		log('Sending latency from page_performance', pageLatency);

		sendMessage('recordPageInfo', {
			domain: `${protocol}//${host}${pathname}`,
			latency: pageLatency,
			performanceAPI: {
				timing: {
					navigationStart: performance.timing.navigationStart,
					loadEventEnd: performance.timing.loadEventEnd
				}
			}
		});
	};
	/**
	 * Initialize functionality of this script.
	 * @memberOf PagePerformanceContentScript
	 * @package
	 */
	const _initialize = function() {
		// manually check to see if the onLoad event has fired, since this script runs at document_idle
		// and does not guarantee that onLoad has triggered
		if (state !== 'complete') {
			document.onreadystatechange = function() {
				state = document.readyState;
				if (state === 'complete') {
					analyzePageInfo();
				}
			};
		} else {
			analyzePageInfo();
		}
	};

	return {
		/**
		 * Initialize functionality of this script.
		 * @memberOf PagePerformanceContentScript
		 * @public
		 */
		init() {
			_initialize();
		}
	};
}(window, document));

PageInfo.init();
