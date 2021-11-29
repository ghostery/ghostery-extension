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

function findTopLink(elem) {
  while (elem && !elem.href) {
    elem = elem.parentElement;
  }
  return elem;
}

function safeLinkClick(event) {
  const link = findTopLink(event.target);
  if (!link) {
    return;
  }

  link.removeAttribute('ping');
  link.removeAttribute('onmousedown');
  event.stopImmediatePropagation();

  try {
    const directUrl = new URL(link.href).searchParams.get('url');
    if (directUrl) {
      console.debug('safeLinkClick changed:', link.href, '->', directUrl);
      event.preventDefault();
      window.location = directUrl;
    }
  } catch (e) {
    console.error(e);
  }
}

function linkCleaner(event) {
    const link = findTopLink(event.target);
    if (!link) {
      return;
    }

    link.removeAttribute('ping');
    try {
      const directUrl = new URL(link.href).searchParams.get('url');
      if (directUrl) {
        console.debug('linkCleaner changed:', link.href, '->', directUrl);
        link.href = directUrl;
      }
    } catch (e) {
      console.error(e);
    }
}

document.addEventListener('click', safeLinkClick, true);
document.addEventListener('onmousedown', linkCleaner, true);
document.addEventListener('touchstart', linkCleaner, true);
