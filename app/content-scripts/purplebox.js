/**
 * Ghostery PurpleBox
 *
 * This file injects the Ghostery Purplebox into
 * all pages except for ExtensionWeb and Platform pages
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
 * @namespace PurpleBoxContentScript
 */
/* eslint no-use-before-define: 0 */

import msgModule from './utils/msg';
import { log } from '../../src/utils/common';
import trackersCountImage from '../data-images/purple_box/trackersCountImage';
import closeIconImage from '../data-images/purple_box/closeIconImage';
import breakingIconImage from '../data-images/purple_box/breakingIconImage';
import slowIconImage from '../data-images/purple_box/slowIconImage';
import nonSecureIconImage from '../data-images/purple_box/nonSecureIconImage';
import nonSecureSlowIconImage from '../data-images/purple_box/nonSecureSlowIconImage';

const msg = msgModule('purplebox');
const { sendMessage } = msg;
const { onMessage } = chrome.runtime;
/**
 * Use to call init to initialize purplebox functionality
 * @var  {Object} initialized to an object with init method as its property
 */
const Ghostery = (function (win, doc) {
	const TIMEOUTS = {
		box_position_timeout: 0,
		box_destroy_timeout: 9999,
		box_none_timeout: 9999
	};
	const BOX_CONF = {};

	let	BOX_CREATED = false;
	let BOX_TRANSLATIONS = {};
	let HEIGHT = 0;
	let PREV_HEIGHT = 0;

	let ghostery;
	let box;
	let count;
	let pbIcons;
	let breakingIcon;
	let slowIcon;
	let nonSecureIcon;
	let nonSecureSlowIcon;
	let title;
	let minimizeContainer;
	let minimizeIcon;
	let close;
	let background;
	let list;
	/**
	 * Create element for the specified html tag
	 * @memberOf PurpleBoxContentScript
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
	 * @memberOf PurpleBoxContentScript
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

	const channelsSupported = (typeof chrome.runtime.connect === 'function');

	let port = null;
	/**
	 * Destroy purple box and notify background.
	 * @memberOf PurpleBoxContentScript
	 * @package
	 */
	const destroyPurpleBox = function () {
		if (ghostery && ghostery.parentNode) {
			ghostery.parentNode.removeChild(ghostery);
		}
		clearTimeout(TIMEOUTS.box_position_timeout);
		clearTimeout(TIMEOUTS.box_destroy_timeout);
		clearTimeout(TIMEOUTS.box_none_timeout);
		BOX_CREATED = false;
		if (channelsSupported && port) {
			port.postMessage({ name: 'onDestroyBox' });
		}
	};
	/**
	 * Reset timer which will destroy purple box
	 * after specified number of seconds.
	 * @memberOf PurpleBoxContentScript
	 * @package
	 */
	const resetDestroyTimer = function () {
		clearTimeout(TIMEOUTS.box_destroy_timeout);
		if (BOX_CONF.alert_bubble_timeout > 0) {
			TIMEOUTS.box_destroy_timeout = setTimeout(() => {
				destroyPurpleBox();
			}, 1000 * BOX_CONF.alert_bubble_timeout);
		}
	};
	/**
	 * Expand or contract purple box.
	 * @memberOf PurpleBoxContentScript
	 * @package
	 */
	const handleSizeChangeClick = function () {
		if (ghostery) {
			BOX_CONF.alert_expanded = !BOX_CONF.alert_expanded;
			doSizeChange();
		}
	};
	/**
	 * Remove purple box mouseclick listeners.
	 * @memberOf PurpleBoxContentScript
	 * @package
	 */
	const removeListeners = function () {
		close.removeEventListener('click', destroyPurpleBox);
		box.removeEventListener('click', handleSizeChangeClick);
		background.removeEventListener('click', handleSizeChangeClick);
	};
	/**
	 * Add purple box mouseclick listeners.
	 * background here is the backgrount element of purple box.
	 * @memberOf PurpleBoxContentScript
	 * @package
	 */
	const addListeners = function () {
		close.addEventListener('click', destroyPurpleBox);
		box.addEventListener('click', handleSizeChangeClick);
		background.addEventListener('click', handleSizeChangeClick);
	};
	/**
	 * Expand or contract purple box. The 'meat' of resizing code.
	 * Called by 'handleSizeChangeClick'.
	 * @memberOf PurpleBoxContentScript
	 * @package
	 */
	const doSizeChange = function () {
		const windowHeight = Math.max(win.innerHeight - 105, 55);

		resetDestroyTimer();
		if (channelsSupported) {
			if (port) {
				port.postMessage({ name: 'updateAlertConf', message: BOX_CONF });
			} else {
				log('Cannot post message. Port is null');
			}
		} else {
			sendMessage('updateAlertConf', BOX_CONF);
		}
		if (ghostery.classList.contains('ghostery-expanded')) {
			ghostery.classList.remove('ghostery-expanded');
			ghostery.classList.add('ghostery-collapsing');
			removeListeners();

			box.addEventListener('transitionend', function a(e) {
				e.target.removeEventListener('transitionend', a);
				ghostery.classList.remove('ghostery-collapsing');
				ghostery.classList.add('ghostery-collapsed');
				addListeners();
			});
		} else {
			if (ghostery.classList.contains('ghostery-none')) {
				clearTrackersNone();
			}

			ghostery.classList.remove('ghostery-collapsed');
			ghostery.classList.add('ghostery-expanding');
			removeListeners();
			box.addEventListener('transitionend', function a(e) {
				e.target.removeEventListener('transitionend', a);
				ghostery.classList.remove('ghostery-expanding');
				ghostery.classList.add('ghostery-expanded');

				background.style.height = `${HEIGHT}px`;
				if (PREV_HEIGHT === HEIGHT && HEIGHT === windowHeight) {
					background.style.setProperty('overflow-y', 'auto');
				}
				addListeners();
			});
		}

		setBoxHeights();
	};
	/**
	 * Adjust the height of purple box as new trackers are added to the list of trackers.
	 * Applicable to expanded state.
	 * @memberOf PurpleBoxContentScript
	 * @package
	 */
	const setBoxHeights = function () {
		let digits;

		const listHeight = (list.children.length * 18) + 20; // 20px for top/bottom padding

		const windowHeight = Math.max(win.innerHeight - 105, 55);

		const height = Math.min(listHeight, windowHeight);
		HEIGHT = height;

		if (ghostery.classList.contains('ghostery-expanded')) {
			background.style.setProperty('height', `${HEIGHT}px`);
			if (PREV_HEIGHT !== HEIGHT) {
				background.style.setProperty('overflow-y', 'hidden');
			} else if (HEIGHT === listHeight && list.children.length <= 9) {
				background.style.setProperty('overflow-y', 'hidden');
			} else {
				background.style.setProperty('overflow-y', 'auto');
			}
		}

		if (ghostery.classList.contains('ghostery-expanding') || ghostery.classList.contains('ghostery-expanded')) {
			// Set style on counter
			digits = count.textContent.length;
			if (digits === 1) {
				title.style.setProperty('left', '25px');
			} else if (digits === 2) {
				title.style.setProperty('left', '30px');
			} else if (digits === 3) {
				title.style.setProperty('left', '35px');
			}

			if (count.textContent === '0' && HEIGHT === listHeight) {
				setTimeout(() => {
					title.textContent = count.textContent === '1' ? BOX_TRANSLATIONS.tracker : BOX_TRANSLATIONS.trackers;
					if (BOX_CONF.alert_expanded && count.textContent === '0') {
						ghostery.classList.remove('ghostery-expanded');
						ghostery.classList.add('ghostery-collapsing');
						background.style.setProperty('height', '0px');
						box.addEventListener('transitionend', function a(e) {
							e.target.removeEventListener('transitionend', a);
							ghostery.classList.remove('ghostery-collapsing');
							ghostery.classList.add('ghostery-collapsed');
						});
					}
				}, 3000);
			}

			if (BOX_CONF.alert_bubble_pos.includes('l')) {
				ghostery.classList.remove('ghostery-right');
				ghostery.classList.add('ghostery-left');
			} else {
				ghostery.classList.remove('ghostery-left');
				ghostery.classList.add('ghostery-right');
			}

			if (BOX_CONF.alert_bubble_pos.includes('t')) {
				ghostery.classList.remove('ghostery-bottom');
				ghostery.classList.add('ghostery-top');
			} else {
				ghostery.classList.remove('ghostery-top');
				ghostery.classList.add('ghostery-bottom');
			}
		} else {
			background.style.setProperty('height', '');
			if (BOX_CONF.alert_bubble_pos.includes('l')) {
				ghostery.classList.remove('ghostery-right');
				ghostery.classList.add('ghostery-left');
			} else {
				ghostery.classList.remove('ghostery-left');
				ghostery.classList.add('ghostery-right');
			}

			if (BOX_CONF.alert_bubble_pos.includes('t')) {
				ghostery.classList.remove('ghostery-bottom');
				ghostery.classList.add('ghostery-top');
			} else {
				ghostery.classList.remove('ghostery-top');
				ghostery.classList.add('ghostery-bottom');
			}
		}

		PREV_HEIGHT = height;
	};
	/**
	 * Create tracker entry (div object) to be inserted into expanded purple box
	 * as a new tracker arrives.
	 * @memberOf PurpleBoxContentScript
	 * @package
	 *
	 * @return {Object} 	tracker div and hasIcon as its properties
	 */
	const createTrackerDiv = function (app) {
		let icon;
		let hasIcon = false;

		const liDiv = createEl('div');
		const tracker = createEl('span');
		const noIcon = createEl('span');

		noIcon.id = 'ghostery-no-tracker';

		liDiv.classList.add('ghostery-trackerContainer');
		tracker.classList.add('ghostery-tracker');
		if (app.hasLatencyIssue) {
			icon = slowIcon;
			icon.style.opacity = '1.0';
		} else if (app.hasCompatibilityIssue) {
			icon = breakingIcon;
			icon.style.opacity = '1.0';
		} else if (app.hasInsecureIssue) {
			icon = nonSecureIcon;
			icon.style.opacity = '1.0';
		} else if (app.hasInsecureIssue && app.hasLatencyIssue) {
			icon = nonSecureSlowIcon;
		} else {
			icon = noIcon;
		}
		hasIcon = icon.id !== 'ghostery-no-tracker';
		if (hasIcon) {
			box.classList.add('ghostery-icons-found');
		}
		if (app.blocked) {
			liDiv.classList.add('ghostery-tracker-disabled');
		} else {
			liDiv.classList.remove('ghostery-tracker-disabled');
		}

		const dup = icon.cloneNode(true);
		dup.classList.remove('ghostery-pb-tracker');
		dup.classList.add('ghostery-pb-tracker-list');

		tracker.textContent = app.name;

		appendChild(liDiv, dup, tracker);
		liDiv.setAttribute('category', app.cat);

		return { tracker: liDiv, hasIcon };
	};
	/**
	 * Update list of trackers in purple box as new trackers arrive.
	 * @memberOf PurpleBoxContentScript
	 * @package
	 */
	const handleNewTrackers = function (apps) {
		const trackersText = title;
		const trackers = list.childNodes;
		for (let n = 0; n < apps.length; n++) {
			const appName = apps[n].name.toLowerCase();
			// On rare occasions there may be multiple trackers with
			// the same name in different categories.
			// Example: Google Adsense happened to be in Advertizing and in Analytics categories.
			// Just in case it happens we record category to add tracker multiple times and keep
			// Purplebox tracker count in sync with button count and panel count.
			const appCategory = apps[n].cat.toLowerCase();
			if (!trackers.length) {
				const trackerObj = createTrackerDiv(apps[n]);
				appendChild(list, trackerObj.tracker);
			} else {
				let placed = false;
				for (let m = 0; m < trackers.length; m++) {
					const trackerName = trackers[m].textContent.toLowerCase();
					const trackerCategory = trackers[m].getAttribute('category');
					if (appName <= trackerName) {
						placed = true;
						const trackerObj = createTrackerDiv(apps[n]);
						// handleNewTrackers is called for the same app many times,
						// once for for each bug squished into it.
						// Up to 90 times on some occasions. We want to touch app entry
						// only when something changes. In our case it is icon which may change
						if ((appName === trackerName)) {
							if (appCategory === trackerCategory) {
								if (trackerObj.hasIcon) {
									list.replaceChild(trackerObj.tracker, trackers[m]);
								}
							} else {
								list.insertBefore(trackerObj.tracker, trackers[m]);
							}
						} else {
							list.insertBefore(trackerObj.tracker, trackers[m]);
						}
						break;
					}
				}

				if (!placed) {
					const trackerObj = createTrackerDiv(apps[n]);
					appendChild(list, trackerObj.tracker);
				}
			}
		}
		setBoxHeights();

		const newCount = list.childNodes.length;

		if (newCount > 0) {
			clearTrackersNone();
			ghostery.classList.remove('ghostery-none');
			count.textContent = newCount;
			trackersText.textContent = count.textContent === '1' ? BOX_TRANSLATIONS.tracker : BOX_TRANSLATIONS.trackers;
		} else {
			count.textContent = '0';
		}
	};
	/**
	 * Clear purplebox background in case of none trackers detected.
	 * @memberOf PurpleBoxContentScript
	 * @package
	 */
	const clearTrackersNone = function () {
		count.style.background = 'none';
		count.style.color = '#ffffff';
	};
	/**
	 * Assemble purple box from DOM elements, style it,
	 * append to the page body and add listeners to its parts.
	 * @memberOf PurpleBoxContentScript
	 * @package
	 */
	const createPurpleBox = function () {
		ghostery = createEl('div');
		box = createEl('div');
		count = createEl('div');
		pbIcons = createEl('div');
		breakingIcon = createEl('span');
		slowIcon = createEl('span');
		nonSecureIcon = createEl('span');
		nonSecureSlowIcon = createEl('span');
		title = createEl('div');
		minimizeContainer = createEl('div');
		minimizeIcon = createEl('span');
		close = createEl('span');
		background = createEl('div');
		list = createEl('div');

		const style = createEl('style');

		style.textContent = '@media print {#ghostery-purple-box {display:none !important}}';
		appendChild(doc.getElementsByTagName('head')[0], style);

		ghostery.id = 'ghostery-purple-box';
		ghostery.className = 'ghostery-bottom ghostery-right ghostery-none';
		box.id = 'ghostery-box';
		count.id = 'ghostery-count';

		count.style.background = `url(${trackersCountImage}) no-repeat center`;

		count.textContent = '0';
		count.style.color = 'transparent';
		pbIcons.id = 'ghostery-pb-icons-container';
		breakingIcon.id = 'ghostery-breaking-tracker';
		breakingIcon.className = 'ghostery-pb-tracker';
		breakingIcon.title = BOX_TRANSLATIONS.box_warning_compatibility;
		breakingIcon.style.background = `url(${breakingIconImage})`;
		breakingIcon.style.opacity = '0.5';
		slowIcon.id = 'ghostery-slow-tracker';
		slowIcon.className = 'ghostery-pb-tracker';
		slowIcon.title = BOX_TRANSLATIONS.box_warning_slow;
		slowIcon.style.background = `url(${slowIconImage})`;
		slowIcon.style.opacity = '0.5';
		nonSecureIcon.id = 'ghostery-non-secure-tracker';
		nonSecureIcon.className = 'ghostery-pb-tracker';
		nonSecureIcon.title = BOX_TRANSLATIONS.box_warning_nonsecure;
		nonSecureIcon.style.background = `url(${nonSecureIconImage})`;
		nonSecureIcon.style.opacity = '0.5';
		nonSecureSlowIcon.id = 'ghostery-non-secure-slow-tracker';
		nonSecureSlowIcon.className = 'ghostery-pb-tracker';
		nonSecureSlowIcon.style.background = `url(${nonSecureSlowIconImage})`;
		title.id = 'ghostery-title';
		title.textContent = BOX_TRANSLATIONS.looking;
		minimizeContainer.id = 'ghostery-minimize';
		minimizeIcon.id = 'ghostery-minimize-icon';
		close.id = 'ghostery-close';
		close.style.background = `url(${closeIconImage})`;
		background.id = 'ghostery-pb-background';
		list.id = 'ghostery-trackerList';

		if (BOX_CONF.alert_expanded && !ghostery.classList.contains('ghostery-expanded')) {
			ghostery.classList.add('ghostery-expanded');
		}

		appendChild(background, list);
		appendChild(minimizeContainer, minimizeIcon);
		appendChild(pbIcons, breakingIcon, slowIcon, nonSecureIcon);
		appendChild(box, count, pbIcons, title, minimizeContainer, close);
		appendChild(ghostery, box, background);

		TIMEOUTS.box_none_timeout = setTimeout(clearTrackersNone, 2000);

		if (doc.getElementsByTagName('body')[0]) {
			appendChild(doc.body, ghostery);
		} else {
			appendChild(doc.getElementsByTagName('html')[0], ghostery);
		}
		if (!BOX_CONF.alert_expanded) {
			ghostery.classList.add('ghostery-collapsed');
			ghostery.classList.remove('ghostery-expanded');
		} else {
			// HACK to trigger CSS transition on #box
			setTimeout(() => {
				const windowHeight = Math.max(win.innerHeight - 105, 55);

				resetDestroyTimer();
				if (channelsSupported) {
					if (port) {
						port.postMessage({ name: 'updateAlertConf', message: BOX_CONF });
					} else {
						log('Failed to post message. Port is null');
					}
				} else {
					sendMessage('updateAlertConf', BOX_CONF);
				}
				if (ghostery.classList.contains('ghostery-none')) {
					clearTrackersNone();
				}

				ghostery.classList.add('ghostery-expanded');

				background.style.height = `${HEIGHT}px`;
				if (PREV_HEIGHT === HEIGHT && HEIGHT === windowHeight) {
					background.style.setProperty('overflow-y', 'auto');
				}
				setBoxHeights();
			}, 100);
		}
		addListeners();
	};
	/**
	 * Handle messages coming from background.js
	 * @memberOf PurpleBoxContentScript
	 * @package
	 * @todo  check if channels are supported across the board. Then we can remove fallback code
	 * @todo  Investigate if we need to have explicit return values.
	 *
	 * @return {boolean}
	 */
	const handleMessages = function (request, sender, sendResponse) {
		// Filter out messages coming from Cliqz context script bundle
		if (request.source === 'cliqz-content-script') {
			return false;
		}

		const	{ name } = request;
		const reqMsg = request.message;
		if (name === 'createBox') {
			BOX_TRANSLATIONS = reqMsg.translations;
			BOX_CONF.language = reqMsg.conf.language;
			BOX_CONF.alert_bubble_timeout = reqMsg.conf.alert_bubble_timeout;
			BOX_CONF.alert_bubble_pos = reqMsg.conf.alert_bubble_pos;
			BOX_CONF.alert_expanded = reqMsg.conf.alert_expanded ? reqMsg.conf.alert_expanded : false;
			if (!BOX_CREATED) {
				BOX_CREATED = true;
				createPurpleBox();
			} else {
				while (list.firstChild) {
					list.removeChild(list.firstChild);
				}
			}
			setBoxHeights();
			resetDestroyTimer();
			if (channelsSupported) {
				port.postMessage({ name: 'onCreateBox' });
			}
		} else if (name === 'updateBox') {
			if (BOX_CREATED) {
				handleNewTrackers(reqMsg.apps);
				resetDestroyTimer();
			}
		}
		if (!channelsSupported) {
			if (sendResponse) {
				sendResponse();
			}
		}
		return true;
	};
	/**
	 * Initialize purplebox functionality, connect to channel if
	 * channels supported, set message listener as a fallback otherwise.
	 * @memberOf PurpleBoxContentScript
	 * @package
	 * @todo  check if channels are supported across the board. Then we can remove fallback code
	 */
	const _initialize = function () {
		if (channelsSupported) {
			port = chrome.runtime.connect({ name: 'purpleBoxPort' });
			if (port) {
				port.onMessage.addListener(handleMessages);
				port.postMessage({ name: 'purpleBoxLoaded' });
			}
		} else {
			onMessage.addListener(handleMessages);
		}
	};

	// Public API
	return {
		init() {
			_initialize();
		}
	};
}(window, document));

Ghostery.init();
