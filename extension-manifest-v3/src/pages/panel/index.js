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
import { define } from 'hybrids';

define.from(import.meta.glob('./**/*.js', { eager: true, import: 'default' }), {
  root: ['components', 'views'],
  prefix: 'gh-panel',
});

/*
  Safari extension popup has a bug, which focuses visibly the first element on the page
  when the popup is opened. This is a workaround to remove the focus.
*/
window.addEventListener('load', () => {
  setTimeout(() => {
    document.body.focus();
    document.body.addEventListener(
      'focus',
      () => {
        document.body.removeAttribute('tabIndex');
      },
      { once: true },
    );
  }, 100);
});
