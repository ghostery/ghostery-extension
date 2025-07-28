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

export async function asyncAction(event, promise) {
  const button = event.currentTarget;
  const el = button.children[0];
  const origText = el.textContent;

  button.disabled = true;
  el.textContent = '...';

  const response = await promise;

  if (response) {
    el.textContent = response;

    setTimeout(() => {
      button.disabled = false;
      el.textContent = origText;
    }, 2000);
  } else {
    button.disabled = false;
    el.textContent = origText;
  }
}
