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

/*
  This is a workaround for registering listeners in Safari
  in ES modules loaded with `async` attribute
*/
chrome.runtime.onMessage.addListener(() => {});
chrome.webNavigation.onCommitted.addListener(() => {});
chrome.webNavigation.onBeforeNavigate.addListener(() => {});
