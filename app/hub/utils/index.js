/**
 * React Utility Imports
 * Import files from app to prevent duplicate code
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

// Imports utilities from elsewhere in the codebase to reduce duplicate code
import { log } from '../../../src/utils/common';
import { sendMessageInPromise as importedSMIP } from '../../panel/utils/msg';

const sendMessageInPromise = function (name, message) {
	return importedSMIP(name, message, 'ghostery-hub');
};

export { log, sendMessageInPromise };
