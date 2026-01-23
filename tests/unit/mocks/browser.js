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

export const BROWSER_KIND = {
  chromium: 'chromium',
  firefox: 'firefox',
  safari: 'safari',
};

const NEWTAB_URL = {
  [BROWSER_KIND.chromium]: 'chrome://newtab',
  [BROWSER_KIND.firefox]: 'about:newtab',
  // Safari shows `favorites://` from `location.href` but they
  // will use `about:blank` when preloading top-hit from their
  // address bar.
  [BROWSER_KIND.safari]: 'about:blank',
};

const TAB_STATUS = {
  loading: 'loading',
  complete: 'complete',
};

function createBrowserAPI(newTabUrl = NEWTAB_URL.chrome) {
  const context = {
    // We don't need any "Window" mock object but this structure
    // will be kept for the future. Implement additional
    // properties as required.
    windows: [
      {
        id: 0,
        tabs: [
          {
            id: 0,
            // We can always generate it.
            // index: `number`,
            active: true,
            discarded: false, // e.g. memory saver
            hidden: false,
            openerTabId: -1,
            status: TAB_STATUS.loading,
            url: newTabUrl,
          },
        ],
        isUserDragging: false,
      },
    ],
    // `eventListeners` are the actual listeners attached to the
    // event using `browser...addEventListener` method.
    eventListeners: [],
    // This property is set when no callback is given to the
    // extension API.
    lastError: null,
  };

  // -- Helper functions.
  function addEventListener(scope, func) {
    if (typeof func !== 'function') {
      throw new Error(
        `Cannot add event listener to "${scope}": expected "function" but got "${typeof func}"!`,
      );
    }

    for (const [scope, listener] of context.eventListeners) {
      if (scope === 'tabs.onRemoved' && listener === func) {
        throw new Error(`Cannot add duplicate event listener to "${scope}"!`);
      }
    }

    context.eventListeners.push([scope, func]);
  }

  function removeEventListener(scope, func) {
    if (typeof func !== 'function') {
      throw new Error(
        `Cannot remove event listener from "${scope}": expected "function" but got "${typeof func}"!`,
      );
    }

    let i = context.eventListeners.length;
    while (i--) {
      const [target, listener] = context.eventListeners[i];

      if (target === scope && listener === func) {
        context.eventListeners.splice(i, 1);

        break;
      }
    }
  }

  function createEventListener(scope) {
    return {
      addEventListener(func) {
        addEventListener(scope, func);
      },
      removeEventListener(func) {
        removeEventListener(scope, func);
      },
    };
  }

  function emitEvent(scope, eventArgs) {
    if (Array.isArray(eventArgs) === false) {
      throw new Error(
        `Cannot emit the "${scope}" event to the listeners: expected "eventArgs" to be "Array"!`,
      );
    }

    for (const [target, listener] of context.eventListeners) {
      if (target === scope) {
        listener.call(null, eventArgs);
      }
    }
  }

  function error(func, message) {
    if (typeof func === 'function') {
      context.lastError = {
        message,
      };

      return func.call(null, []);
    }

    throw new Error(message);
  }

  function callbackOrPromise(func, callArgs, promisedResp) {
    if (typeof func === 'function') {
      return func.call(
        null,
        ...callArgs.map(function (callArg) {
          // We use `structuredClone` as we don't want any side-
          // effects from outside.
          return structuredClone(callArg);
        }),
      );
    }

    // If `promisedResp` available, prefer it.
    return new Promise(function (resolve) {
      resolve(structuredClone(promisedResp ?? callArgs[0]));
    });
  }

  const browser = {
    tabs: {
      query(_conditions, callback) {
        // We don't fully implement `tabs.query` as we don't need
        // it.
        if (context.windows[0].isUserDragging) {
          return error(
            callback,
            'Tab cannot be queried right now (user may be dragging a tab)',
          );
        }

        return callbackOrPromise(callback, [context.windows[0].tabs]);
      },
      onRemoved: createEventListener('tabs.onRemoved'),
      onReplaced: createEventListener('tabs.onReplaced'),
    },
    webNavigation: {
      getAllFrames({ tabId } = {}) {
        if (typeof tabId !== 'number') {
          return callbackOrPromise(null, []);
        }

        return callbackOrPromise(null, [
          context.windows[0].tabs.find(function (tab) {
            return tab.id === tabId;
          }),
        ]);
      },
    },
  };

  return {
    context,
    browser,
    emitEvent,
  };
}

export function createWebExtensionAPIMock(kind = BROWSER_KIND.chromium) {
  const globals = {
    browser: null,
    chrome: null,
  };
  let api = createBrowserAPI(NEWTAB_URL[kind]);

  function register() {
    if (typeof globalThis.browser !== 'undefined') {
      globals.browser = globalThis.browser;
    }
    if (typeof globalThis.chrome !== 'undefined') {
      globals.chrome = globalThis.chrome;
    }

    globalThis.browser = globalThis.chrome = api.browser;

    return api;
  }

  function unregister() {
    if (globals.browser !== null) {
      globalThis.browser = globals.browser;
    }
    if (globals.chrome !== null) {
      globalThis.chrome = globals.chrome;
    }

    api = null;
  }

  return {
    register,
    unregister,
  };
}
