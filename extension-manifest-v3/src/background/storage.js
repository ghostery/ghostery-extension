/**
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2017-present Ghostery GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */
import bugs from '../rule_resources/bugs.json';
import categories from '../rule_resources/categories.json';
import trackers from '../rule_resources/trackers.json';
import tracker_domains from '../rule_resources/tracker_domains.json';

const storage = new Map();

storage.set('bugs', bugs);
storage.set('categories', categories);
storage.set('trackers', trackers);
storage.set('tracker_domains', tracker_domains);

export default storage;
