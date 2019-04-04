/**
 * Dispatcher Class
 *
 * Simple Pub/Sub class for handling events. All Conf properties will
 * automatically trigger dispatcher 'save' events whenever the property is set.
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

/* eslint no-param-reassign: 0 */

import { log } from '../utils/common';
/**
 * Class for dispatching events. Though generic, it is used
 * solely by 'set' trap of Conf proxy to notify subscribers
 * that a user property has been set.
 * @memberOf  BackgroundClasses
 */
class Dispatcher {
	constructor() {
		this.handlers = new Map();
	}

	// subscribe
	on(event, handler, context) {
		log('dispatcher.on called from', event);
		if (typeof context === 'undefined') {
			context = handler;
		}
		this.handlers.set(event, handler.bind(context));
	}

	// publish
	trigger(event, args) {
		const handler = this.handlers.get(event);
		if (handler) {
			handler(args);
		}
	}
}

// return the class as a singleton
export default new Dispatcher();
