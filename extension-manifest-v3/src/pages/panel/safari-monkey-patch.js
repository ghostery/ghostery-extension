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

// Safari has a buggy implementation of the AdoptedStyleSheets API,
// which causes sometimes the panel to not render properly.
// More info here: https://bugs.webkit.org/show_bug.cgi?id=254844
//
// The bug relates to updating the list of stylesheets. If we disable
// the API on document level, the layout engine will fallback
// to the <style> element, so the list of styles are set only once.
if (__PLATFORM__ === 'safari') {
  Object.defineProperty(document, 'adoptedStyleSheets', {
    value: undefined,
    writable: true,
  });
}
