/**
 * Ghostery Notifications Content Script
 *
 * This file provides notification alerts for the CMP, update dialogs
 * and import/export functionality
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2020 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */
/**
 * @namespace  NotificationsContentScript
 */
import msgModule from './utils/msg';
import { log } from '../../src/utils/common';
import xImage from '../data-images/popup/xImage';
import logoImage from '../data-images/popup/logoImage';

const msg = msgModule('notifications');
const { sendMessage } = msg;
const { onMessage } = chrome.runtime;

/**
 * Use to call init to initialize functionality
 * @var  {Object} initialized to an object with init method as its property
 */
const NotificationsContentScript = (function(win, doc) {
	const ALERT_ID = 'ALERT_ID_6AEC0607-8CC8-4904-BDEB-00F947E5E3C2';
	let CMP_DATA = {};
	let CSS_INJECTED = false;
	let ALERT_SHOWN = false;
	const createEl = function(type) {
		return doc.createElement(type);
	};
	/**
	 * Append one or several children elements to parent
	 * @memberOf NotificationsContentScript
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
	 * Inject base css for CMP popups
	 * @memberOf NotificationsContentScript
	 * @package
	 */
	const injectCSS = function() {
		const style = createEl('style');
		const imp = ' !important;';
		const reset = 'padding:0;margin:0;font:13px Arial,Helvetica;text-transform:none;font-size: 100%;vertical-align:baseline;line-height:normal;color:#fff;position:static;';

		style.textContent =
			`@-webkit-keyframes pop${ALERT_ID} {` +
			'50% {' +
			'-webkit-transform:scale(1.2);' +
			'}' +
			'100% {' +
			'-webkit-transform:scale(1);' +
			'}' +
			'}' +
			`@keyframes pop${ALERT_ID} {` +
			'50% {' +
			'-webkit-transform:scale(1.2);' +
			'transform:scale(1.2);' +
			'}' +
			'100% {' +
			'-webkit-transform:scale(1);' +
			'transform:scale(1);' +
			'}' +
			'}' +

			`#${ALERT_ID}{${reset}
			border:none${imp}
			background:#fff${imp}
			color:#fff${imp}
			display:block${imp}
			height:auto${imp}
			max-height:500px${imp}
			margin:0${imp}
			opacity:1${imp}
			padding:0${imp}
			position:fixed${imp}
			visibility:visible${imp}
			width:325px${imp}
			z-index:2147483647${imp}
			-moz-border-radius:6px${imp/* TODO should we switch to non-prefixed ones? */}
			border-radius:6px${imp}
			-moz-box-shadow:0px 0px 20px #000${imp}
			box-shadow:0px 0px 20px #000${imp}
			}` +
			`#${ALERT_ID} br{display:inline-block${imp}${reset}}` +
			`#${ALERT_ID} div{${
				reset
			}letter-spacing:normal${imp
			}font:16px Roboto, sans-serif${imp
			}line-height:24px${imp
			}text-align:center${imp
			}text-shadow:none${imp
			}text-transform:none${imp
			}word-spacing:normal${imp
			}}` +
			`#${ALERT_ID} a{${
				reset
			}border:none${imp
			}font-weight:500${imp
			}background:#fff${imp
			}color:#00aef0${imp
			}}` +
			`@media print{#${ALERT_ID}{display:none${imp}}}`;

		appendChild(doc.getElementsByTagName('head')[0], style);
	};
	/**
	 * Destroy CMP or notification popup.
	 * @memberOf NotificationsContentScript
	 * @package
	 */
	const removeAlert = function() {
		const el = doc.getElementById(ALERT_ID);
		if (el) {
			el.parentNode.removeChild(el);
			ALERT_SHOWN = false;
		}
	};

	/**
	 * Helper for creating of a closing button for popup.
	 * @memberOf NotificationsContentScript
	 * @package
	 *
	 * @return {Object}  styled div DOM element
	 */
	const createCloseButton = function() {
		const closeButton = createEl('div');

		// .button class
		closeButton.style.cursor = 'pointer';
		closeButton.style.setProperty(
			'-webkit-touch-callout',
			'none'
		);

		closeButton.style.setProperty(
			'-webkit-user-select',
			'none'
		);

		closeButton.style.setProperty(
			'-khtml-user-select',
			'none'
		);

		closeButton.style.setProperty(
			'-moz-user-select',
			'none'
		);

		closeButton.style.setProperty(
			'-ms-user-select',
			'none'
		);

		closeButton.style.setProperty(
			'user-select',
			'none'
		);

		// The rest
		closeButton.style.cssFloat = 'right';
		closeButton.style.background = `url(${xImage}) no-repeat center`;
		closeButton.style.backgroundSize = '12.9px 12.9px';
		closeButton.style.width = '27.4px';
		closeButton.style.height = '27.4px';
		closeButton.style.margin = '4px 4px 4px 4px';

		return closeButton;
	};
	/**
	 * Helper for creating of an uniform popup header.
	 * @memberOf NotificationsContentScript
	 * @package
	 *
	 * @return {Object}  styled div DOM element
	 */
	const createNotificationHeader = function() {
		const header = createEl('div');
		header.style.backgroundColor = '#00aef0';
		header.style.borderTopLeftRadius = '6px';
		header.style.borderTopRightRadius = '6px';
		header.style.height = '46px';
		header.style.padding = '0 0 0 16px';

		const logo = createEl('div');

		logo.style.width = '82px';
		logo.style.height = '100%';

		logo.style.background = `url(${logoImage}) no-repeat center`;

		logo.style.backgroundSize = '100% auto';
		logo.style.cssFloat = 'left';

		appendChild(header, logo);

		const closeButton = createCloseButton();

		appendChild(header, closeButton);

		const clearDiv = createEl('div');
		clearDiv.style.clear = 'both';

		closeButton.addEventListener('click', (e) => {
			removeAlert();
			sendMessage('dismissCMPMessage', { cmp_data: CMP_DATA, reason: 'closeButton' });
			e.preventDefault();
		});

		appendChild(header, clearDiv);

		return header;
	};
	/**
	 * Helper for creating an uniform popup's content area.
	 * @memberOf NotificationsContentScript
	 * @package
	 *
	 * @return {Object}  styled div DOM element
	 */
	const createNotificationContent = function(message, linkUrl, linkText, linkClickFunc) {
		const content = createEl('div');
		content.style.borderRadius = '6px';
		content.style.setProperty(
			'background',
			'#fff',
			'important'
		);

		const header = createNotificationHeader();

		appendChild(content, header);
		const messageDiv = createEl('div');

		// Upgrade message
		messageDiv.style.setProperty(
			'padding',
			'22px 35px 17px 35px',
			'important'
		);

		const s = createEl('span');
		s.style.color = '#232323';
		s.style.border = 'none';
		s.style.fontWeight = '300';
		s.style.display = 'block';

		appendChild(s, doc.createTextNode(message));

		appendChild(messageDiv, s);
		appendChild(content, messageDiv);

		// Upgrade link
		const linkDiv = createEl('div');
		linkDiv.style.setProperty(
			'padding',
			'18px 35px 22px 35px',
			'important'
		);

		const link = createEl('a');
		link.style.color = '#00aef0';
		link.href = linkUrl || '#';
		if (linkUrl) {
			link.target = '_blank';
		}
		appendChild(link, doc.createTextNode(linkText));

		link.addEventListener('click', linkClickFunc);

		appendChild(linkDiv, link);
		appendChild(content, linkDiv);

		return content;
	};

	/**
	 * Helper for creating top level popup element.
	 * @memberOf NotificationsContentScript
	 * @package
	 *
	 * @return {Object}  styled div DOM element
	 */
	const createAlert = function() {
		let alert_div = doc.getElementById(ALERT_ID);
		if (alert_div) {
			alert_div.parentNode.removeChild(alert_div);
		}

		alert_div = createEl('div');
		alert_div.id = ALERT_ID;

		alert_div.style.setProperty(
			'right',
			'20px',
			'important'
		);
		alert_div.style.setProperty(
			'top',
			'15px',
			'important'
		);

		alert_div.textContent = '';

		if (doc.getElementsByTagName('body')[0]) {
			appendChild(doc.body, alert_div);
		} else {
			appendChild(doc.getElementsByTagName('html')[0], alert_div);
		}
		return alert_div;
	};
	/**
	 * Helper for creating dialog with 'Browse' used
	 * for import of user settings.
	 * @memberOf NotificationsContentScript
	 * @package
	 */
	const showBrowseWindow = function(translations) {
		if (ALERT_SHOWN) {
			return;
		}
		const content = createEl('div');
		content.style.borderRadius = '6px';
		content.style.setProperty(
			'background',
			'#fff',
			'important'
		);

		const header = createNotificationHeader();
		appendChild(content, header);
		const messageDiv = createEl('div');

		messageDiv.style.setProperty(
			'padding',
			'22px 35px 22px 35px',
			'important'
		);

		messageDiv.style.setProperty(
			'text-align',
			'center',
			'important'
		);

		const s = createEl('span');
		s.style.color = '#232323';
		s.style.border = 'none';
		s.style.fontWeight = '300';
		s.id = 'ghostery-browse-window-span';

		s.style.setProperty(
			'margin',
			'22px auto 22px',
			'important'
		);

		appendChild(s, doc.createTextNode(translations.select_file_for_import));
		appendChild(messageDiv, s);
		appendChild(content, messageDiv);

		const buttonDiv = createEl('div');
		buttonDiv.id = 'ghostery-browse-window-button';
		buttonDiv.style.setProperty(
			'padding',
			'2px 35px 28px 35px',
			'important'
		);

		buttonDiv.style.setProperty(
			'text-align',
			'center',
			'important'
		);

		// buttonDiv.style.height = '50px';

		const inputEl = createEl('input');
		inputEl.type = 'file';
		inputEl.name = 'image';
		inputEl.style.width = '1px';
		inputEl.style.height = '1px';
		inputEl.style.visibility = 'hidden';

		inputEl.addEventListener('change', () => {
			if (!inputEl.files.length) {
				while (s.firstChild) {
					s.removeChild(s.firstChild);
				}
				s.appendChild(document.createTextNode(translations.file_was_not_selected));
			} else {
				// @EDGE We cannot send file object directly on Edge. Have to read file here
				// and send the content. Chrome and Firefox allow to send file object.
				// Also cannot use callback here as it always returns 'undefined'.
				const fileToLoad = inputEl.files[0];

				const fileReader = new FileReader();
				fileReader.onload = (fileLoadedEvent) => {
					// Workaround for Edge. Callback cannot be undefined.
					const fallback = () => {
						if (chrome.runtime.lastError) {
							log('showBrowseWindow error:', chrome.runtime.lastError);
						}
					};
					chrome.runtime.sendMessage({
						origin: 'notifications',
						name: 'importFile',
						message: fileLoadedEvent.target.result
					}, fallback);
				};

				fileReader.readAsText(fileToLoad, 'UTF-8');
			}
		});

		appendChild(buttonDiv, inputEl);

		const buttonEl = createEl('span');
		appendChild(buttonEl, doc.createTextNode(translations.browse_button_label));
		buttonEl.style.backgroundColor = '#00aef0';
		buttonEl.style.borderRadius = '3px';
		buttonEl.style.height = '30px';
		buttonEl.style.color = 'white';
		buttonEl.style.cursor = 'pointer';
		buttonEl.style.setProperty(
			'padding',
			'6px 9px 7px 9px',
			'important'
		);

		buttonEl.addEventListener('click', () => {
			inputEl.click();
		});

		appendChild(buttonDiv, buttonEl);
		appendChild(content, buttonDiv);

		const alert_div = createAlert();
		appendChild(alert_div, content);
	};
	/**
	 * Helper for updating browse dialog's text to
	 * reflect the result of an import of user settings.
	 * @memberOf NotificationsContentScript
	 * @package
	 */
	const updateBrowseWindow = function(result = {}) {
		const s = doc.getElementById('ghostery-browse-window-span');
		while (s.firstChild) {
			s.removeChild(s.firstChild);
		}

		if (result.type !== 'message') {
			s.style.color = '#e74055';
		} else {
			const buttonDiv = doc.getElementById('ghostery-browse-window-button');
			if (buttonDiv) {
				buttonDiv.parentNode.removeChild(buttonDiv);
			}
			s.style.color = '#232323';
		}
		s.innerHTML = result.text;
	};
	/**
	 * Helper which executes 'Save' operation during export
	 * of user settings.
	 * @memberOf NotificationsContentScript
	 * @package
	 */
	const exportFile = function(content, type) {
		const textFileAsBlob = new Blob([content], { type: 'text/plain' });
		const ext = type === 'Ghostery-Backup' ? 'ghost' : 'json';
		const d = new Date();
		const dStr = `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`;
		const fileNameToSaveAs = `${type}-${dStr}.${ext}`;
		let url = '';
		if (window.URL) {
			url = window.URL.createObjectURL(textFileAsBlob);
		} else {
			url = window.webkitURL.createObjectURL(textFileAsBlob);
		}

		const link = createEl('a');
		link.href = url;
		link.setAttribute('download', fileNameToSaveAs);
		document.body.appendChild(link);
		link.click();
	};
	/**
	 * Show popup. It is called in an onMessage handler
	 * for messages coming from background.js.
	 * @memberOf NotificationsContentScript
	 * @package
	 *
	 * @param {string} type 	the type of notification to show
	 * @param {object} options 	message data to pass to the notification
	 */
	const showAlert = function(type, options) {
		if (ALERT_SHOWN) {
			return;
		}
		// only tear down the frame for upgrade notifications/walkthrough reminders
		let alert_contents;

		if (type === 'showCMPMessage') {
			alert_contents = createNotificationContent(
				options.campaign.Message,
				options.campaign.Link,
				options.campaign.LinkText,
				() => {
					removeAlert();
					sendMessage('dismissCMPMessage', { cmp_data: CMP_DATA, reason: 'link' });
				}
			);
		}

		const alert_div = createAlert();
		appendChild(alert_div, alert_contents);
	};
	/**
	 * Initialize functionality of this script. Set listener
	 * for messages coming from background.js.
	 * @memberOf NotificationsContentScript
	 * @package
	 * @todo  investigate if we need to explicitly return values in listeners.
	 *
	 * @return {boolean}
	 */
	const _initialize = function() {
		onMessage.addListener((request, sender, sendResponse) => {
			try {
				const alertMessages = [
					'showCMPMessage',
					'showBrowseWindow'
				];
				const { name, message } = request;

				log('notifications.js received message', name);

				if (alertMessages.includes(name)) {
					if (!CSS_INJECTED) {
						CSS_INJECTED = true;
						injectCSS();
					}
				}

				if (name === 'showCMPMessage') {
					CMP_DATA = message.data;
					showAlert('showCMPMessage', {
						campaign: CMP_DATA
					});
					ALERT_SHOWN = true;
				} else if (name === 'showBrowseWindow') {
					showBrowseWindow(message.translations);
					ALERT_SHOWN = true;
				} else if (name === 'onFileImported') {
					updateBrowseWindow(message);
				} else if (name === 'exportFile') {
					const { content, type } = message;
					exportFile(content, type);
				} else {
					log('Unexpected message type (not handled):', request.name);
					return false;
				}
			} catch (e) {
				log('Failed to handle message from request:', request.name, e);
				return false;
			}

			// message was successfully handled
			sendResponse();
			return undefined;
		});
	};

	return {
		/**
		 * Initialize functionality of this script.
		 * @memberOf NotificationsContentScript
		 * @public
		 */
		init() {
			_initialize();
		}
	};
}(window, document));

NotificationsContentScript.init();
