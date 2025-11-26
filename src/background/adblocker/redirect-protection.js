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

/**
 * Redirect Protection for Firefox (MV2)
 *
 * This module handles redirecting blocked main_frame requests to the
 * redirect protection page, allowing users to decide whether to proceed.
 */

import Options from '/store/options.js';

// Store URLs that are temporarily allowed after user confirmation
const allowedRedirectUrls = new Set();

/**
 * Check if redirect protection should be applied for this request
 */
function shouldProtectRedirect(options, hostname) {
  if (!options.redirectProtection?.enabled) {
    return false;
  }

  // Check if this hostname is in the disabled list
  const disabledDomains = options.redirectProtection.disabled || [];
  return !disabledDomains.some((domain) => hostname.endsWith(domain));
}

/**
 * Handle redirect protection for a main_frame request
 *
 * @param {Object} details - webRequest details
 * @param {Object} request - Request object
 * @param {Object} options - Options store
 * @param {Function} isTrusted - Function to check if request is trusted
 * @param {Function} getEngine - Function to get the main engine
 * @param {Function} updateTabStats - Function to update tab stats
 * @returns {Object|undefined} - webRequest response or undefined
 */
export function handleRedirectProtection(
  details,
  request,
  options,
  isTrusted,
  getEngine,
  updateTabStats,
) {
  // Only handle main_frame requests
  if (details.type !== 'main_frame') {
    return undefined;
  }

  const hostname = request.hostname;

  // Check if this URL was temporarily allowed by the user
  if (allowedRedirectUrls.has(details.url)) {
    allowedRedirectUrls.delete(details.url);
    return undefined;
  }

  // Check if redirect protection should apply
  if (
    !shouldProtectRedirect(options, hostname) ||
    isTrusted(request, details.type)
  ) {
    return undefined;
  }

  // Check if the engine would block this request
  const engine = getEngine();
  const { redirect, match } = engine.match(request);

  if (match === true || redirect !== undefined) {
    // Mark as blocked and update stats
    request.blocked = true;
    updateTabStats(details.tabId, [request]);

    // Create redirect to protection page with encoded URL
    const encodedUrl = btoa(details.url);
    const protectionUrl =
      chrome.runtime.getURL('pages/redirect-protection/index.html') +
      '?url=' +
      encodedUrl;

    return { redirectUrl: protectionUrl };
  }

  return undefined;
}

/**
 * Allow a URL temporarily (called when user clicks "Continue Anyway")
 */
export function allowRedirectUrl(url) {
  allowedRedirectUrls.add(url);
}

/**
 * Add a hostname to the redirect protection disabled list
 */
export async function disableRedirectProtectionForHostname(hostname, Options) {
  const { store } = await import('hybrids');
  const options = await store.resolve(Options);

  const disabled = options.redirectProtection?.disabled || [];
  if (!disabled.includes(hostname)) {
    await store.set(Options, {
      redirectProtection: {
        ...options.redirectProtection,
        disabled: [...disabled, hostname],
      },
    });
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'allowRedirect') {
    if (!message.url) {
      sendResponse({ success: false, error: 'Missing URL' });
      return false;
    }

    try {
      allowRedirectUrl(message.url);
      sendResponse({ success: true });
    } catch (error) {
      console.error('[redirect-protection] Error allowing redirect:', error);
      sendResponse({ success: false, error: error.message });
    }

    return false;
  }

  if (message.action === 'disableRedirectProtection') {
    if (!message.hostname) {
      sendResponse({ success: false, error: 'Missing hostname' });
      return false;
    }

    disableRedirectProtectionForHostname(message.hostname, Options)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error(
          '[redirect-protection] Error disabling protection:',
          error,
        );
        sendResponse({
          success: false,
          error: error.message || String(error),
        });
      });

    return true;
  }

  return false;
});
