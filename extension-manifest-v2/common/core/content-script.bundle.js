/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/webextension-polyfill/dist/browser-polyfill.js":
/*!*********************************************************************!*\
  !*** ./node_modules/webextension-polyfill/dist/browser-polyfill.js ***!
  \*********************************************************************/
/***/ (function(module, exports) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else { var mod; }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (module) {
  /* webextension-polyfill - v0.7.0 - Tue Nov 10 2020 20:24:04 */

  /* -*- Mode: indent-tabs-mode: nil; js-indent-level: 2 -*- */

  /* vim: set sts=2 sw=2 et tw=80: */

  /* This Source Code Form is subject to the terms of the Mozilla Public
   * License, v. 2.0. If a copy of the MPL was not distributed with this
   * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
  "use strict";

  if (typeof browser === "undefined" || Object.getPrototypeOf(browser) !== Object.prototype) {
    const CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE = "The message port closed before a response was received.";
    const SEND_RESPONSE_DEPRECATION_WARNING = "Returning a Promise is the preferred way to send a reply from an onMessage/onMessageExternal listener, as the sendResponse will be removed from the specs (See https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage)"; // Wrapping the bulk of this polyfill in a one-time-use function is a minor
    // optimization for Firefox. Since Spidermonkey does not fully parse the
    // contents of a function until the first time it's called, and since it will
    // never actually need to be called, this allows the polyfill to be included
    // in Firefox nearly for free.

    const wrapAPIs = extensionAPIs => {
      // NOTE: apiMetadata is associated to the content of the api-metadata.json file
      // at build time by replacing the following "include" with the content of the
      // JSON file.
      const apiMetadata = {
        "alarms": {
          "clear": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "clearAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "get": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "bookmarks": {
          "create": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getChildren": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getRecent": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getSubTree": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getTree": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "move": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeTree": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "search": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        },
        "browserAction": {
          "disable": {
            "minArgs": 0,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "enable": {
            "minArgs": 0,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "getBadgeBackgroundColor": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getBadgeText": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getPopup": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getTitle": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "openPopup": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "setBadgeBackgroundColor": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setBadgeText": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setIcon": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "setPopup": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setTitle": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          }
        },
        "browsingData": {
          "remove": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "removeCache": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeCookies": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeDownloads": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeFormData": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeHistory": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeLocalStorage": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removePasswords": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removePluginData": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "settings": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "commands": {
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "contextMenus": {
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        },
        "cookies": {
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAllCookieStores": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "set": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "devtools": {
          "inspectedWindow": {
            "eval": {
              "minArgs": 1,
              "maxArgs": 2,
              "singleCallbackArg": false
            }
          },
          "panels": {
            "create": {
              "minArgs": 3,
              "maxArgs": 3,
              "singleCallbackArg": true
            },
            "elements": {
              "createSidebarPane": {
                "minArgs": 1,
                "maxArgs": 1
              }
            }
          }
        },
        "downloads": {
          "cancel": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "download": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "erase": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getFileIcon": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "open": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "pause": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeFile": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "resume": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "search": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "show": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          }
        },
        "extension": {
          "isAllowedFileSchemeAccess": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "isAllowedIncognitoAccess": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "history": {
          "addUrl": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "deleteAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "deleteRange": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "deleteUrl": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getVisits": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "search": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "i18n": {
          "detectLanguage": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAcceptLanguages": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "identity": {
          "launchWebAuthFlow": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "idle": {
          "queryState": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "management": {
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getSelf": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "setEnabled": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "uninstallSelf": {
            "minArgs": 0,
            "maxArgs": 1
          }
        },
        "notifications": {
          "clear": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "create": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getPermissionLevel": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        },
        "pageAction": {
          "getPopup": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getTitle": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "hide": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setIcon": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "setPopup": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setTitle": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "show": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          }
        },
        "permissions": {
          "contains": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "request": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "runtime": {
          "getBackgroundPage": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getPlatformInfo": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "openOptionsPage": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "requestUpdateCheck": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "sendMessage": {
            "minArgs": 1,
            "maxArgs": 3
          },
          "sendNativeMessage": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "setUninstallURL": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "sessions": {
          "getDevices": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getRecentlyClosed": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "restore": {
            "minArgs": 0,
            "maxArgs": 1
          }
        },
        "storage": {
          "local": {
            "clear": {
              "minArgs": 0,
              "maxArgs": 0
            },
            "get": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "getBytesInUse": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "remove": {
              "minArgs": 1,
              "maxArgs": 1
            },
            "set": {
              "minArgs": 1,
              "maxArgs": 1
            }
          },
          "managed": {
            "get": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "getBytesInUse": {
              "minArgs": 0,
              "maxArgs": 1
            }
          },
          "sync": {
            "clear": {
              "minArgs": 0,
              "maxArgs": 0
            },
            "get": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "getBytesInUse": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "remove": {
              "minArgs": 1,
              "maxArgs": 1
            },
            "set": {
              "minArgs": 1,
              "maxArgs": 1
            }
          }
        },
        "tabs": {
          "captureVisibleTab": {
            "minArgs": 0,
            "maxArgs": 2
          },
          "create": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "detectLanguage": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "discard": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "duplicate": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "executeScript": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getCurrent": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getZoom": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getZoomSettings": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "goBack": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "goForward": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "highlight": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "insertCSS": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "move": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "query": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "reload": {
            "minArgs": 0,
            "maxArgs": 2
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeCSS": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "sendMessage": {
            "minArgs": 2,
            "maxArgs": 3
          },
          "setZoom": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "setZoomSettings": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "update": {
            "minArgs": 1,
            "maxArgs": 2
          }
        },
        "topSites": {
          "get": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "webNavigation": {
          "getAllFrames": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getFrame": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "webRequest": {
          "handlerBehaviorChanged": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "windows": {
          "create": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "get": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getCurrent": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getLastFocused": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        }
      };

      if (Object.keys(apiMetadata).length === 0) {
        throw new Error("api-metadata.json has not been included in browser-polyfill");
      }
      /**
       * A WeakMap subclass which creates and stores a value for any key which does
       * not exist when accessed, but behaves exactly as an ordinary WeakMap
       * otherwise.
       *
       * @param {function} createItem
       *        A function which will be called in order to create the value for any
       *        key which does not exist, the first time it is accessed. The
       *        function receives, as its only argument, the key being created.
       */


      class DefaultWeakMap extends WeakMap {
        constructor(createItem, items = undefined) {
          super(items);
          this.createItem = createItem;
        }

        get(key) {
          if (!this.has(key)) {
            this.set(key, this.createItem(key));
          }

          return super.get(key);
        }

      }
      /**
       * Returns true if the given object is an object with a `then` method, and can
       * therefore be assumed to behave as a Promise.
       *
       * @param {*} value The value to test.
       * @returns {boolean} True if the value is thenable.
       */


      const isThenable = value => {
        return value && typeof value === "object" && typeof value.then === "function";
      };
      /**
       * Creates and returns a function which, when called, will resolve or reject
       * the given promise based on how it is called:
       *
       * - If, when called, `chrome.runtime.lastError` contains a non-null object,
       *   the promise is rejected with that value.
       * - If the function is called with exactly one argument, the promise is
       *   resolved to that value.
       * - Otherwise, the promise is resolved to an array containing all of the
       *   function's arguments.
       *
       * @param {object} promise
       *        An object containing the resolution and rejection functions of a
       *        promise.
       * @param {function} promise.resolve
       *        The promise's resolution function.
       * @param {function} promise.rejection
       *        The promise's rejection function.
       * @param {object} metadata
       *        Metadata about the wrapped method which has created the callback.
       * @param {integer} metadata.maxResolvedArgs
       *        The maximum number of arguments which may be passed to the
       *        callback created by the wrapped async function.
       *
       * @returns {function}
       *        The generated callback function.
       */


      const makeCallback = (promise, metadata) => {
        return (...callbackArgs) => {
          if (extensionAPIs.runtime.lastError) {
            promise.reject(extensionAPIs.runtime.lastError);
          } else if (metadata.singleCallbackArg || callbackArgs.length <= 1 && metadata.singleCallbackArg !== false) {
            promise.resolve(callbackArgs[0]);
          } else {
            promise.resolve(callbackArgs);
          }
        };
      };

      const pluralizeArguments = numArgs => numArgs == 1 ? "argument" : "arguments";
      /**
       * Creates a wrapper function for a method with the given name and metadata.
       *
       * @param {string} name
       *        The name of the method which is being wrapped.
       * @param {object} metadata
       *        Metadata about the method being wrapped.
       * @param {integer} metadata.minArgs
       *        The minimum number of arguments which must be passed to the
       *        function. If called with fewer than this number of arguments, the
       *        wrapper will raise an exception.
       * @param {integer} metadata.maxArgs
       *        The maximum number of arguments which may be passed to the
       *        function. If called with more than this number of arguments, the
       *        wrapper will raise an exception.
       * @param {integer} metadata.maxResolvedArgs
       *        The maximum number of arguments which may be passed to the
       *        callback created by the wrapped async function.
       *
       * @returns {function(object, ...*)}
       *       The generated wrapper function.
       */


      const wrapAsyncFunction = (name, metadata) => {
        return function asyncFunctionWrapper(target, ...args) {
          if (args.length < metadata.minArgs) {
            throw new Error(`Expected at least ${metadata.minArgs} ${pluralizeArguments(metadata.minArgs)} for ${name}(), got ${args.length}`);
          }

          if (args.length > metadata.maxArgs) {
            throw new Error(`Expected at most ${metadata.maxArgs} ${pluralizeArguments(metadata.maxArgs)} for ${name}(), got ${args.length}`);
          }

          return new Promise((resolve, reject) => {
            if (metadata.fallbackToNoCallback) {
              // This API method has currently no callback on Chrome, but it return a promise on Firefox,
              // and so the polyfill will try to call it with a callback first, and it will fallback
              // to not passing the callback if the first call fails.
              try {
                target[name](...args, makeCallback({
                  resolve,
                  reject
                }, metadata));
              } catch (cbError) {
                console.warn(`${name} API method doesn't seem to support the callback parameter, ` + "falling back to call it without a callback: ", cbError);
                target[name](...args); // Update the API method metadata, so that the next API calls will not try to
                // use the unsupported callback anymore.

                metadata.fallbackToNoCallback = false;
                metadata.noCallback = true;
                resolve();
              }
            } else if (metadata.noCallback) {
              target[name](...args);
              resolve();
            } else {
              target[name](...args, makeCallback({
                resolve,
                reject
              }, metadata));
            }
          });
        };
      };
      /**
       * Wraps an existing method of the target object, so that calls to it are
       * intercepted by the given wrapper function. The wrapper function receives,
       * as its first argument, the original `target` object, followed by each of
       * the arguments passed to the original method.
       *
       * @param {object} target
       *        The original target object that the wrapped method belongs to.
       * @param {function} method
       *        The method being wrapped. This is used as the target of the Proxy
       *        object which is created to wrap the method.
       * @param {function} wrapper
       *        The wrapper function which is called in place of a direct invocation
       *        of the wrapped method.
       *
       * @returns {Proxy<function>}
       *        A Proxy object for the given method, which invokes the given wrapper
       *        method in its place.
       */


      const wrapMethod = (target, method, wrapper) => {
        return new Proxy(method, {
          apply(targetMethod, thisObj, args) {
            return wrapper.call(thisObj, target, ...args);
          }

        });
      };

      let hasOwnProperty = Function.call.bind(Object.prototype.hasOwnProperty);
      /**
       * Wraps an object in a Proxy which intercepts and wraps certain methods
       * based on the given `wrappers` and `metadata` objects.
       *
       * @param {object} target
       *        The target object to wrap.
       *
       * @param {object} [wrappers = {}]
       *        An object tree containing wrapper functions for special cases. Any
       *        function present in this object tree is called in place of the
       *        method in the same location in the `target` object tree. These
       *        wrapper methods are invoked as described in {@see wrapMethod}.
       *
       * @param {object} [metadata = {}]
       *        An object tree containing metadata used to automatically generate
       *        Promise-based wrapper functions for asynchronous. Any function in
       *        the `target` object tree which has a corresponding metadata object
       *        in the same location in the `metadata` tree is replaced with an
       *        automatically-generated wrapper function, as described in
       *        {@see wrapAsyncFunction}
       *
       * @returns {Proxy<object>}
       */

      const wrapObject = (target, wrappers = {}, metadata = {}) => {
        let cache = Object.create(null);
        let handlers = {
          has(proxyTarget, prop) {
            return prop in target || prop in cache;
          },

          get(proxyTarget, prop, receiver) {
            if (prop in cache) {
              return cache[prop];
            }

            if (!(prop in target)) {
              return undefined;
            }

            let value = target[prop];

            if (typeof value === "function") {
              // This is a method on the underlying object. Check if we need to do
              // any wrapping.
              if (typeof wrappers[prop] === "function") {
                // We have a special-case wrapper for this method.
                value = wrapMethod(target, target[prop], wrappers[prop]);
              } else if (hasOwnProperty(metadata, prop)) {
                // This is an async method that we have metadata for. Create a
                // Promise wrapper for it.
                let wrapper = wrapAsyncFunction(prop, metadata[prop]);
                value = wrapMethod(target, target[prop], wrapper);
              } else {
                // This is a method that we don't know or care about. Return the
                // original method, bound to the underlying object.
                value = value.bind(target);
              }
            } else if (typeof value === "object" && value !== null && (hasOwnProperty(wrappers, prop) || hasOwnProperty(metadata, prop))) {
              // This is an object that we need to do some wrapping for the children
              // of. Create a sub-object wrapper for it with the appropriate child
              // metadata.
              value = wrapObject(value, wrappers[prop], metadata[prop]);
            } else if (hasOwnProperty(metadata, "*")) {
              // Wrap all properties in * namespace.
              value = wrapObject(value, wrappers[prop], metadata["*"]);
            } else {
              // We don't need to do any wrapping for this property,
              // so just forward all access to the underlying object.
              Object.defineProperty(cache, prop, {
                configurable: true,
                enumerable: true,

                get() {
                  return target[prop];
                },

                set(value) {
                  target[prop] = value;
                }

              });
              return value;
            }

            cache[prop] = value;
            return value;
          },

          set(proxyTarget, prop, value, receiver) {
            if (prop in cache) {
              cache[prop] = value;
            } else {
              target[prop] = value;
            }

            return true;
          },

          defineProperty(proxyTarget, prop, desc) {
            return Reflect.defineProperty(cache, prop, desc);
          },

          deleteProperty(proxyTarget, prop) {
            return Reflect.deleteProperty(cache, prop);
          }

        }; // Per contract of the Proxy API, the "get" proxy handler must return the
        // original value of the target if that value is declared read-only and
        // non-configurable. For this reason, we create an object with the
        // prototype set to `target` instead of using `target` directly.
        // Otherwise we cannot return a custom object for APIs that
        // are declared read-only and non-configurable, such as `chrome.devtools`.
        //
        // The proxy handlers themselves will still use the original `target`
        // instead of the `proxyTarget`, so that the methods and properties are
        // dereferenced via the original targets.

        let proxyTarget = Object.create(target);
        return new Proxy(proxyTarget, handlers);
      };
      /**
       * Creates a set of wrapper functions for an event object, which handles
       * wrapping of listener functions that those messages are passed.
       *
       * A single wrapper is created for each listener function, and stored in a
       * map. Subsequent calls to `addListener`, `hasListener`, or `removeListener`
       * retrieve the original wrapper, so that  attempts to remove a
       * previously-added listener work as expected.
       *
       * @param {DefaultWeakMap<function, function>} wrapperMap
       *        A DefaultWeakMap object which will create the appropriate wrapper
       *        for a given listener function when one does not exist, and retrieve
       *        an existing one when it does.
       *
       * @returns {object}
       */


      const wrapEvent = wrapperMap => ({
        addListener(target, listener, ...args) {
          target.addListener(wrapperMap.get(listener), ...args);
        },

        hasListener(target, listener) {
          return target.hasListener(wrapperMap.get(listener));
        },

        removeListener(target, listener) {
          target.removeListener(wrapperMap.get(listener));
        }

      }); // Keep track if the deprecation warning has been logged at least once.


      let loggedSendResponseDeprecationWarning = false;
      const onMessageWrappers = new DefaultWeakMap(listener => {
        if (typeof listener !== "function") {
          return listener;
        }
        /**
         * Wraps a message listener function so that it may send responses based on
         * its return value, rather than by returning a sentinel value and calling a
         * callback. If the listener function returns a Promise, the response is
         * sent when the promise either resolves or rejects.
         *
         * @param {*} message
         *        The message sent by the other end of the channel.
         * @param {object} sender
         *        Details about the sender of the message.
         * @param {function(*)} sendResponse
         *        A callback which, when called with an arbitrary argument, sends
         *        that value as a response.
         * @returns {boolean}
         *        True if the wrapped listener returned a Promise, which will later
         *        yield a response. False otherwise.
         */


        return function onMessage(message, sender, sendResponse) {
          let didCallSendResponse = false;
          let wrappedSendResponse;
          let sendResponsePromise = new Promise(resolve => {
            wrappedSendResponse = function (response) {
              if (!loggedSendResponseDeprecationWarning) {
                console.warn(SEND_RESPONSE_DEPRECATION_WARNING, new Error().stack);
                loggedSendResponseDeprecationWarning = true;
              }

              didCallSendResponse = true;
              resolve(response);
            };
          });
          let result;

          try {
            result = listener(message, sender, wrappedSendResponse);
          } catch (err) {
            result = Promise.reject(err);
          }

          const isResultThenable = result !== true && isThenable(result); // If the listener didn't returned true or a Promise, or called
          // wrappedSendResponse synchronously, we can exit earlier
          // because there will be no response sent from this listener.

          if (result !== true && !isResultThenable && !didCallSendResponse) {
            return false;
          } // A small helper to send the message if the promise resolves
          // and an error if the promise rejects (a wrapped sendMessage has
          // to translate the message into a resolved promise or a rejected
          // promise).


          const sendPromisedResult = promise => {
            promise.then(msg => {
              // send the message value.
              sendResponse(msg);
            }, error => {
              // Send a JSON representation of the error if the rejected value
              // is an instance of error, or the object itself otherwise.
              let message;

              if (error && (error instanceof Error || typeof error.message === "string")) {
                message = error.message;
              } else {
                message = "An unexpected error occurred";
              }

              sendResponse({
                __mozWebExtensionPolyfillReject__: true,
                message
              });
            }).catch(err => {
              // Print an error on the console if unable to send the response.
              console.error("Failed to send onMessage rejected reply", err);
            });
          }; // If the listener returned a Promise, send the resolved value as a
          // result, otherwise wait the promise related to the wrappedSendResponse
          // callback to resolve and send it as a response.


          if (isResultThenable) {
            sendPromisedResult(result);
          } else {
            sendPromisedResult(sendResponsePromise);
          } // Let Chrome know that the listener is replying.


          return true;
        };
      });

      const wrappedSendMessageCallback = ({
        reject,
        resolve
      }, reply) => {
        if (extensionAPIs.runtime.lastError) {
          // Detect when none of the listeners replied to the sendMessage call and resolve
          // the promise to undefined as in Firefox.
          // See https://github.com/mozilla/webextension-polyfill/issues/130
          if (extensionAPIs.runtime.lastError.message === CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE) {
            resolve();
          } else {
            reject(extensionAPIs.runtime.lastError);
          }
        } else if (reply && reply.__mozWebExtensionPolyfillReject__) {
          // Convert back the JSON representation of the error into
          // an Error instance.
          reject(new Error(reply.message));
        } else {
          resolve(reply);
        }
      };

      const wrappedSendMessage = (name, metadata, apiNamespaceObj, ...args) => {
        if (args.length < metadata.minArgs) {
          throw new Error(`Expected at least ${metadata.minArgs} ${pluralizeArguments(metadata.minArgs)} for ${name}(), got ${args.length}`);
        }

        if (args.length > metadata.maxArgs) {
          throw new Error(`Expected at most ${metadata.maxArgs} ${pluralizeArguments(metadata.maxArgs)} for ${name}(), got ${args.length}`);
        }

        return new Promise((resolve, reject) => {
          const wrappedCb = wrappedSendMessageCallback.bind(null, {
            resolve,
            reject
          });
          args.push(wrappedCb);
          apiNamespaceObj.sendMessage(...args);
        });
      };

      const staticWrappers = {
        runtime: {
          onMessage: wrapEvent(onMessageWrappers),
          onMessageExternal: wrapEvent(onMessageWrappers),
          sendMessage: wrappedSendMessage.bind(null, "sendMessage", {
            minArgs: 1,
            maxArgs: 3
          })
        },
        tabs: {
          sendMessage: wrappedSendMessage.bind(null, "sendMessage", {
            minArgs: 2,
            maxArgs: 3
          })
        }
      };
      const settingMetadata = {
        clear: {
          minArgs: 1,
          maxArgs: 1
        },
        get: {
          minArgs: 1,
          maxArgs: 1
        },
        set: {
          minArgs: 1,
          maxArgs: 1
        }
      };
      apiMetadata.privacy = {
        network: {
          "*": settingMetadata
        },
        services: {
          "*": settingMetadata
        },
        websites: {
          "*": settingMetadata
        }
      };
      return wrapObject(extensionAPIs, staticWrappers, apiMetadata);
    };

    if (typeof chrome != "object" || !chrome || !chrome.runtime || !chrome.runtime.id) {
      throw new Error("This script should only be loaded in a browser extension.");
    } // The build process adds a UMD wrapper around this file, which makes the
    // `module` variable available.


    module.exports = wrapAPIs(chrome);
  } else {
    module.exports = browser;
  }
});//# sourceMappingURL=browser-polyfill.js.map


/***/ }),

/***/ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/adblocker/content.js":
/*!***********************************************************************************************!*\
  !*** ../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/adblocker/content.js ***!
  \***********************************************************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var _adblockerCosmetics = _interopRequireDefault(__webpack_require__(/*! ../platform/lib/adblocker-cosmetics */ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/platform/lib/adblocker-cosmetics.js"));

var _register = __webpack_require__(/*! ../core/content/register */ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/content/register.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*!
 * Copyright (c) 2014-present Cliqz GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
(0, _register.registerContentScript)({
  module: 'adblocker',
  matches: ['http://*/*', 'https://*/*'],
  matchAboutBlank: true,
  allFrames: true,
  js: [(window, chrome, CLIQZ) => {
    /**
     * This function will immediatly query the background for cosmetics (scripts,
     * CSS) to inject in the page using its third argument function; then proceed
     * to the injection. It will also monitor the DOM using a MutationObserver to
     * know which cosmetics/scriptlets to inject.
     */
    (0, _adblockerCosmetics.default)(window, true,
    /* enable mutation observer */
    async payload => {
      const result = await CLIQZ.app.modules.adblocker.action('getCosmeticsFilters', payload);
      return result || {};
    });
  }]
});

/***/ }),

/***/ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/antitracking/content.js":
/*!**************************************************************************************************!*\
  !*** ../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/antitracking/content.js ***!
  \**************************************************************************************************/
/***/ (() => {

"use strict";
/*!
 * Copyright (c) 2014-present Cliqz GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */


/***/ }),

/***/ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/config.js":
/*!*****************************************************************************************!*\
  !*** ../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/config.js ***!
  \*****************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _default = {
  "platform": "webextension",
  "brocfile": "Brocfile.ghostery.js",
  "baseURL": "/cliqz/",
  "pack": "npm pack",
  "publish": "echo \"Uploading version: browser-core-$PACKAGE_VERSION.tgz\" && aws s3 cp browser-core-$PACKAGE_VERSION.tgz s3://cdncliqz/update/edge/ghostery/$BRANCH_NAME/$VERSION.${GIT_COMMIT:0:7}.tgz --acl public-read && aws s3 cp s3://cdncliqz/update/edge/ghostery/$BRANCH_NAME/$VERSION.${GIT_COMMIT:0:7}.tgz s3://cdncliqz/update/edge/ghostery/$BRANCH/latest.tgz --acl public-read",
  "sourceMaps": false,
  "format": "common",
  "settings": {
    "BACKGROUND_IMAGE_URL": "https://cdn.ghostery.net/brands-database/database/",
    "CDN_BASEURL": "https://cdn.ghostery.net",
    "ADBLOCKER_BASE_URL": "https://cdn.ghostery.com/adblocker/configs",
    "ANTITRACKING_BASE_URL": "https://cdn.ghostery.com/antitracking",
    "CONFIG_PROVIDER": "https://api.ghostery.net/api/v1/config",
    "ENDPOINT_ANONPATTERNSURL": "https://cdn2.ghostery.com/human-web-chromium/patterns-anon.gz",
    "ENDPOINT_HPNV2_DIRECT": "https://collector-hpn.ghostery.net",
    "ENDPOINT_HPNV2_ANONYMOUS": "https://collector-hpn.ghostery.net",
    "ENDPOINT_HUMAN_WEB_PATTERNS": "https://cdn2.ghostery.com/human-web-chromium/hw-patterns.gz",
    "ENDPOINT_PATTERNSURL": "https://cdn2.ghostery.com/human-web-chromium/patterns.gz",
    "ENDPOINT_SAFE_QUORUM_ENDPOINT": "https://safe-browsing-quorum.privacy.ghostery.net/",
    "ENDPOINT_SAFE_QUORUM_PROVIDER": "https://safe-browsing-quorum.privacy.ghostery.net/config",
    "FEEDBACK": "https://ghostery.net/feedback/",
    "PRIVACY_SCORE_URL": "https://anti-tracking.ghostery.net/api/v1/score?",
    "TRACKER_SCORE_URL": "https://cdn.ghostery.net/privacy-score/privacy_score.json",
    "RESULTS_PROVIDER": "https://api.ghostery.net/api/v2/results?nrh=1&q=",
    "RESULTS_PROVIDER_LOG": "https://api.ghostery.net/api/v1/logging?q=",
    "RICH_HEADER": "https://api.ghostery.net/api/v2/rich-header?path=/v2/map",
    "ROTATED_TOP_NEWS": "rotated-top-news.ghostery.net",
    "SAFE_BROWSING": "https://safe-browsing.ghostery.net",
    "STATISTICS": "https://stats.ghostery.net",
    "SUGGESTIONS_URL": "https://ghostery.net/search?q=",
    "UNINSTALL": "https://ghostery.net/home/offboarding",
    "WTM_API": "https://whotracks.me/data/",
    "SUPPORT_URL": "https://www.ghostery.com/support/",
    "PRIVACY_POLICY_URL": "https://www.ghostery.com/about-ghostery/privacy-statements/",
    "NEW_TAB_URL": "/freshtab/home.html",
    "channel": "CH80",
    "MSGCHANNEL": "web-extension",
    "URL_CHANGED_EVENT_DEBOUNCE": 500,
    "ATTRACK_TELEMETRY_PROVIDER": "hpnv2",
    "HW_CHANNEL": "ghostery",
    "ALLOWED_COUNTRY_CODES": ["ar", "at", "au", "be", "br", "ca", "ch", "cn", "cz", "de", "dk", "es", "fi", "fr", "gb", "gr", "hu", "id", "in", "it", "jp", "kr", "mx", "nl", "no", "nz", "ph", "pl", "pt", "ro", "ru", "se", "sg", "tr", "tw", "ua", "us"],
    "antitrackingPlaceholder": "ghostery",
    "antitrackingHeader": "Ghostery-AntiTracking",
    "HUMAN_WEB_LITE_COLLECTOR_VIA_PROXY": "https://collector-hpn.ghostery.net",
    "HUMAN_WEB_LITE_COLLECTOR_DIRECT": "https://collector-hpn.ghostery.net",
    "HUMAN_WEB_LITE_PATTERNS": "https://cdn2.ghostery.com/human-web-android/patterns.json",
    "HUMAN_WEB_LITE_AUTO_TRIGGER": true,
    "frameScriptWhitelist": ["http://localhost:3000/"]
  },
  "default_prefs": {
    "modules.human-web.enabled": true,
    "modules.antitracking.enabled": true,
    "modules.adblocker.enabled": true,
    "modules.insights.enabled": false,
    "cliqz-adb": 1,
    "attrackBloomFilter": true,
    "humanWeb": true,
    "attrackTelemetryMode": 1,
    "attrackDefaultAction": "placeholder",
    "sendAntiTrackingHeader": false,
    "attrackCookieTrustReferers": true,
    "attrack.cookieMode": "ghostery"
  },
  "bundles": ["core/content-script.bundle.js", "hpnv2/worker.wasm.bundle.js", "hpnv2/worker.asmjs.bundle.js", "human-web/rusha.bundle.js"],
  "modules": ["core", "human-web", "hpnv2", "antitracking", "webrequest-pipeline", "adblocker", "insights", "hpn-lite", "human-web-lite"],
  "environment": "development",
  "isBeta": false,
  "EXTENSION_VERSION": "1.3.16",
  "VERSION": "1.3.16"
};
exports["default"] = _default;

/***/ }),

/***/ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/content-script.js":
/*!*************************************************************************************************!*\
  !*** ../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/content-script.js ***!
  \*************************************************************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


__webpack_require__(/*! ../module-content-script */ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/module-content-script.js");

var _run = _interopRequireDefault(__webpack_require__(/*! ./content/run */ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/content/run.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*!
 * Copyright (c) 2014-present Cliqz GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * This file is the entry-point for content scripts for navigation-extension. At
 * build time, it will bundle the code from `content.es` for each module enabled
 * in the config (or nothing if `content.es` does not exist for a given module);
 * and take care of running selectively the scripts for modules which are
 * enabled and whose constraints are satisfied (as defined when registering the
 * content script with `registerContentScript`; typically `matches`,
 * `allFrames`, `matchAboutBlank`, etc.)
 *
 * Here we give an overview of how this mechanism works and how modules can
 * define their own content script(s). Conceptually, each module defining a
 * `content.es` has a chance to create its own content-script. This file
 * contains both the script (i.e.: `js`) to inject, as well as the specification
 * of when to inject it (the API is very similar to Firefox WebExtension API
 * `browser.contentScripts.register` or the `content_scripts` section of the
 * manifest).
 *
 * A module can inject zero, one or multiple content scripts from its
 * `content.es`, using the `registerContentScript` helper function defined in
 * `core/content/register.es`. This function takes one argument. Here is an
 * example:
 *
 *    // File: `modules/adblocker/sources/content.es`
 *    import { registerContentScript } from '../core/content/register';
 *
 *    registerContentScript({
 *      module: 'adblocker', // this should be the name of the module
 *      matches: ['<all_urls>'], // match any URL
 *      allFrames: true, // include iframes
 *      matchAboutBlank: true, // include iframes with `about:blank` as source
 *      js: [(window, chrome, CLIQZ) => {
 *        // Do the thing...
 *      }],
 *    })
 *
 *  The `js` attribute accepts an array of functions to evaluate in a given
 *  frame (here we give only one) and the `registerContentScript` function can
 *  be called multiple times for each module (but typically only once).
 *
 *  Functions injected can optionally return an object containing `actions` for
 *  this specific module's content-script. They can be called from background
 *  using the following core action:
 *
 *    this.core.action(
 *      'callContentAction',
 *      moduleName,
 *      actionName,
 *      { windowId: tabId }, // or { url } to target tabs by URL
 *      ...payloadForActionHandler,
 *    );
 *
 *  When building the extension with `fern.js`, our build-system will collect
 *  all the `content.es` files from enabled modules and bundle them together.
 *  This file is called `content-script.bundle.es`. It is registered in the
 *  manifest for Cliqz extension in `specific/browser/manifest.json`; which
 *  means it will be injected in every page.
 *
 *  This does not mean that the scripts registered by all modules run in every
 *  frame; the `registerContentScript` function only registers a new content
 *  script, but the injection only triggers if the following conditions are met:
 *
 *  1. the module's background needs to be enabled. For example if the adblocker
 *  is turned-off with the pref 'modules.adblocker.enabled' set to `false`, then
 *  even if `content-script.bundle.es` contains the adblocker's content-script,
 *  it will not run (because the module is disabled).
 *
 *  2. conditions specified when calling `registerContentScript` need to be
 *  satisfied. This includes `matches`, `allFrames` or `matchAboutBlank`.
 *
 *  When all conditions are met, then the functions provided in `js` will be
 *  executed in the context of the frame.
 *
 *  For more information about how all of this is implemented, see top-level
 *  comment in `core/content/run.es`.
 */
// Load content scripts from modules
(0, _run.default)();

/***/ }),

/***/ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/content.js":
/*!******************************************************************************************!*\
  !*** ../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/content.js ***!
  \******************************************************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var _helpers = __webpack_require__(/*! ./content/helpers */ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/content/helpers.js");

var _register = __webpack_require__(/*! ./content/register */ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/content/register.js");

/*!
 * Copyright (c) 2014-present Cliqz GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
function getContextHTML(ev) {
  let target = ev.target;
  let html;

  try {
    for (let count = 0; count < 5; count += 1) {
      html = target.innerHTML;

      if (html.indexOf('http://') !== -1 || html.indexOf('https://') !== -1) {
        return html;
      }

      target = target.parentNode;
      count += 1;
    }
  } catch (ee) {// Ignore error
  }

  return undefined;
}

function recordMouseDown(ev, CLIQZ) {
  const linksSrc = [];

  if (window.parent !== window) {
    // collect srcipt links only for frames
    if (window.document && window.document.scripts) {
      for (let i = 0; i < window.document.scripts.length; i += 1) {
        const src = window.document.scripts[i].src;

        if (src.startsWith('http')) {
          linksSrc.push(src);
        }
      }
    }
  }

  let node = ev.target;

  if (node.nodeType !== 1) {
    node = node.parentNode;
  }

  let href = null;

  if (node.closest('a[href]')) {
    href = node.closest('a[href]').getAttribute('href');
  }

  const event = {
    target: {
      baseURI: ev.target.baseURI,
      value: ev.target.value,
      href: ev.target.href,
      parentNode: {
        href: ev.target.parentNode ? ev.target.parentNode.href : null
      },
      linksSrc
    }
  };
  CLIQZ.app.modules.core.action('recordMouseDown', event, getContextHTML(ev), href);
}

function recordMeta(window, CLIQZ) {
  // don't analyse language for (i)frames
  if (!(0, _helpers.isTopWindow)(window)) {
    return;
  } // ReportLang


  const lang = window.document.getElementsByTagName('html').item(0).getAttribute('lang');
  const title = window.document.querySelector('title');
  const description = window.document.querySelector('meta[name=description]');
  const ogTitle = window.document.querySelector('meta[property="og:title"]');
  const ogDescription = window.document.querySelector('meta[property="og:description"]');
  const ogImage = window.document.querySelector('meta[property="og:image"]');
  CLIQZ.app.modules.core.action('recordMeta', window.location.href, {
    title: title && title.innerHTML,
    description: description && description.content,
    ogTitle: ogTitle && ogTitle.content,
    ogDescription: ogDescription && ogDescription.content,
    ogImage: ogImage && ogImage.content,
    lang
  });
}

function getHTML() {
  return window.document.documentElement.outerHTML;
}

function click(selector) {
  const el = window.document.querySelector(selector);

  try {
    el.click();
    return true;
  } catch (e) {
    return false;
  }
}

function queryHTML(selector, attribute, {
  shadowRootSelector = null,
  attributeType = 'property'
} = {}) {
  const root = shadowRootSelector ? window.document.querySelector(shadowRootSelector).shadowRoot : window.document;
  const attributes = attribute.split(',');

  const getAttr = (el, attr) => {
    if (attributeType === 'property') {
      return el[attr];
    }

    return el.getAttribute(attr);
  };

  return Array.prototype.map.call(root.querySelectorAll(selector), el => {
    if (attributes.length > 1) {
      return attributes.reduce((hash, attr) => ({ ...hash,
        [attr]: getAttr(el, attr)
      }), {});
    }

    return getAttr(el, attribute);
  });
}

function queryComputedStyle(selector) {
  const root = window.document;
  return Array.prototype.map.call(root.querySelectorAll(selector), el => window.getComputedStyle(el));
}

(0, _register.registerContentScript)({
  module: 'core',
  matches: ['<all_urls>'],
  allFrames: true,
  matchAboutBlank: true,
  js: [(window, chrome, CLIQZ) => {
    const onMouseDown = ev => {
      recordMouseDown(ev, CLIQZ);
    };

    window.addEventListener('mousedown', onMouseDown);

    const onDOMContentLoaded = () => {
      recordMeta(window, CLIQZ);
    };

    window.addEventListener('DOMContentLoaded', onDOMContentLoaded); // Stop listening

    window.addEventListener('pagehide', () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('DOMContentLoaded', onDOMContentLoaded);
    }, {
      once: true
    }); // Expose content actions

    return {
      getHTML,
      click,
      queryHTML,
      queryComputedStyle
    };
  }]
});

/***/ }),

/***/ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/content/actions-manager.js":
/*!**********************************************************************************************************!*\
  !*** ../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/content/actions-manager.js ***!
  \**********************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _remoteActionProvider = _interopRequireDefault(__webpack_require__(/*! ../../core/helpers/remote-action-provider */ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/helpers/remote-action-provider.js"));

var _runtime = _interopRequireDefault(__webpack_require__(/*! ../../platform/runtime */ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/platform/runtime.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Buffers messages received through `onMessage` API in memory until content
 * scripts are injected and actions can be triggered. Once actions are
 * available, we first re-play in-memory messages, then start listening to new
 * one.
 */
class RemoteMessagesBuffer {
  // Maximum number of action messages to buffer in memory before content
  // scripts are injected. This limit should never be reached but is still
  // necessary to make sure we do not leak memory in case status from App cannot
  // be received (which should not happen either).
  constructor() {
    _defineProperty(this, "MAX_BUFFER_LEN", 5000);

    this.buffer = []; // Start buffering until we get `actions` for content scripts

    this.onMessage = message => {
      if (this.buffer.length < this.MAX_BUFFER_LEN) {
        return new Promise((resolve, reject) => {
          this.buffer.push({
            message,
            resolve,
            reject
          });
        });
      }

      return Promise.reject(new Error(`content-script actions buffer limit exceeded: ${this.buffer.length} ${this.MAX_BUFFER_LEN}`));
    };
  }

  init() {
    _runtime.default.onMessage.addListener(this.onMessage);
  }

  unload() {
    _runtime.default.onMessage.removeListener(this.onMessage);
  }

}
/**
 * Buffers messages in memory until `actions` are specified then switches to
 * using `RemoteActionProvider` for each module to handle remote actions
 * requested by background code.
 */


class ContentScriptActionsManager {
  constructor() {
    // Not defined at first
    this.actions = null; // Start buffering messages in memory until we know about actions. The flow
    // here is this:
    //
    // 1. here (i.e.: `constructor`) we initialize `messageHandlers` as being a
    // single in-memory queue of messages received from other contexts, before
    // we know of registered content actions.
    // 2. in `setActionCallbacks(...)` we receive actions registered by injected
    // content scripts (see core/sources/content/run.es).
    // 3. the `unload(...)` method is called to remove the listener, then a new
    // remote action provider is created for each module having a content script
    // injected (e.g.: `anti-phishing`, `adblocker`, etc.); also replaying all
    // messages stored in-memory before that so that nothing is lost even before
    // we inject content scripts.
    //
    // Even though the array only contains one listener at first, we keep
    // `messageHandlers` as an array so that handling is uniform in the rest of
    // the code (e.g.: `unload(...)`).

    this.messageHandlers = [new RemoteMessagesBuffer()];

    for (const handler of this.messageHandlers) {
      handler.init();
    }
  }
  /**
   * Stop listening to messages
   */


  unload() {
    for (const handler of this.messageHandlers) {
      handler.unload();
    }

    this.messageHandlers = [];
  }
  /**
   * Register action callbacks once content scripts are injected.
   */


  setActionCallbacks(moduleActions) {
    // Stop current buffering of messages in memory
    const messages = this.messageHandlers[0].buffer;
    this.unload(); // Replay messages received so far with actual module actions

    for (const [module, actions] of Object.entries(moduleActions)) {
      const actionProvider = new _remoteActionProvider.default(module, actions);

      for (const {
        message,
        resolve,
        reject
      } of messages) {
        const response = actionProvider.onMessage(message);

        if (response !== undefined) {
          response.then(resolve).catch(reject);
        }
      } // Start listening


      actionProvider.init();
      this.messageHandlers.push(actionProvider);
    }
  }

}

exports["default"] = ContentScriptActionsManager;

/***/ }),

/***/ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/content/console.js":
/*!**************************************************************************************************!*\
  !*** ../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/content/console.js ***!
  \**************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _globals = __webpack_require__(/*! ../../platform/content/globals */ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/platform/content/globals.js");

var _config = _interopRequireDefault(__webpack_require__(/*! ../config */ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/config.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*!
 * Copyright (c) 2014-present Cliqz GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
function noop() {}
/**
 * In content context we only enable logging in developement build to not
 * pollute logs from visited web pages.
 */


var _default = _config.default.environment === 'development' ? _globals.window.console : new Proxy({}, {
  get() {
    return noop;
  }

});

exports["default"] = _default;

/***/ }),

/***/ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/content/helpers.js":
/*!**************************************************************************************************!*\
  !*** ../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/content/helpers.js ***!
  \**************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.documentBodyReady = documentBodyReady;
exports.isTopWindow = isTopWindow;

/*!
 * Copyright (c) 2014-present Cliqz GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Check if `window` is the top-level window.
 */
function isTopWindow(window) {
  return window.self === window.top;
}
/**
 * Return a `Promise` which resolves once `window.document.body` exists. If it's
 * already the case when the function is invoked, then the promise resolves
 * immediately, otherwise it waits for the `DOMContentLoaded` event to trigger.
 */


function documentBodyReady() {
  if (window.document && window.document.body) {
    return Promise.resolve();
  }

  return new Promise(resolve => {
    window.addEventListener('DOMContentLoaded', resolve, {
      once: true
    });
  });
}

/***/ }),

/***/ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/content/match-patterns.js":
/*!*********************************************************************************************************!*\
  !*** ../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/content/match-patterns.js ***!
  \*********************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = match;

/*!
 * Copyright (c) 2014-present Cliqz GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
// Implement pattern matching as described in the following document:
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns
// List of all supported schemes:
const SUPPORTED_SCHEMES = new Set(['http', 'https', 'ws', 'wss', 'ftp', 'ftps', 'data', 'file']); // Shallow validate a host by checking only allowed characters appear

const VALID_HOST = /^[.\w_-]+$/;
/**
 * Transform an arbitrary string into a RegExp compatible one:
 *  - escape special characters which can be encountered in RegExps (e.g.: '{' or '.')
 *  - replace '*' with '.*' to match anything
 *
 * The result from this function is a string which can be compiled to a RegExp
 * safely. For example: `new RegExp(compileToRegex('foo.bar'))`
 *
 *   > new RegExp(compileToRegex('foo*.[bar]'))
 *   /foo.*\.\[bar\]/
 *
 * '.', '[' and ']' have been escaped and '*' was replaced by '.*' (wildcard).
 */

function compileToRegex(str) {
  return str.replace(/([|.$+?{}()[\]\\])/g, '\\$1').replace(/\*/g, '.*');
}
/**
 * Compile the <scheme> part from a match pattern. The matcher is a set of
 * allowed schemes which will be used to check if a given URL's scheme is
 * accepted.
 */


function createSchemeMatcher(scheme) {
  if (scheme === '*') {
    // '*' in <scheme> only matches a subset of all valid protocols (see Mozilla
    // developer doc at the top for more details).
    return new Set(['http', 'https', 'ws', 'wss']);
  }

  if (SUPPORTED_SCHEMES.has(scheme)) {
    // Only this specific `scheme` will be accepted
    return new Set([scheme]);
  }

  throw new Error(`<scheme> is not valid: ${scheme}`);
}
/**
 * Compile the <host> part from a match pattern. The matcher is a RegExp object
 * which will be used to check the hostname attribute of a URL. This function
 * can also return `null`, which means that any hostname is accepted. In case of
 * failure, an exception is raised.
 */


function createHostMatcher(scheme, host) {
  if (host.includes(':')) {
    throw new Error('<host> must not include a port number');
  }

  if (host.length === 0) {
    // Only 'file:///' can appear without a <host> constraint
    if (scheme === 'file') {
      return /^$/;
    }

    throw new Error('<host> is optional only if the scheme is "file"');
  } // Validate <host> containing a wildcard


  const lastWildcardInHost = host.lastIndexOf('*');

  if (lastWildcardInHost !== -1) {
    //  '*' constraint means we accept anything
    if (host === '*') {
      return null;
    }

    if (lastWildcardInHost !== 0) {
      throw new Error('<host> wildcard may only appear at the start');
    }

    if (host[1] !== '.') {
      throw new Error('<host> only "*" and "*." followed by hostname parts are valid');
    } // At this point we know that `host` is of the form *.<host>


    const hostAfterWildcard = host.slice(2);

    if (VALID_HOST.test(hostAfterWildcard) === false) {
      throw new Error('<host> contains invalid characters');
    } // Hostname *may* start with labels and *must* be followed by `hostAfterWildcard`


    return new RegExp(`^(?:.*[.])?${compileToRegex(hostAfterWildcard)}$`);
  } // If no wildcard in <host> it should only be a valid hostname


  if (VALID_HOST.test(host) === false) {
    throw new Error('<host> contains invalid characters');
  }

  return new RegExp(`^${compileToRegex(host)}$`);
}
/**
 * Compile the <path> part from a match pattern. The matcher is a RegExp object
 * which will be used against the pathname + search of a URL object.
 */


function createPathMatcher(path) {
  return new RegExp(`^${compileToRegex(path)}$`);
}
/**
 * Compile a match pattern as specified in https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns
 *
 * The return value is an object with three attributes, each matching against
 * one part of the the URL:
 *
 * - `scheme` is a Set of accepted protocols from URL
 * - `host` is a RegExp to test `hostname` from URL (or `null` if no constraint)
 * - `path` is a RegExp to test `pathname` + `search` from URL (or `null`)
 */


function compile(pattern) {
  // Special <all_urls> value means that any URL with supported schemes is matched
  if (pattern === '<all_urls>') {
    return {
      scheme: SUPPORTED_SCHEMES,
      host: null,
      path: null
    };
  } // From this point we parse `pattern` and make sure it is valid. The structure
  // must be: <scheme>://<host><path>. Each part is also validated. In case an
  // error is encountered, an exception with explanation is raised.
  // ======================================================================= //
  // Extract and validate <scheme> (must be followed by '://')


  const indexOfProtocolSeparator = pattern.indexOf('://');

  if (indexOfProtocolSeparator === -1) {
    throw new Error('<scheme> missing, "://" not found');
  }

  const scheme = pattern.slice(0, indexOfProtocolSeparator);
  const schemeMatcher = createSchemeMatcher(scheme); // ======================================================================= //
  // Extract and validate <host> (must be followed by '/')

  const indexOfSlash = pattern.indexOf('/', indexOfProtocolSeparator + 3);

  if (indexOfSlash === -1) {
    throw new Error('<path> missing, "/" not found');
  }

  const host = pattern.slice(indexOfProtocolSeparator + 3, indexOfSlash);
  const hostMatcher = createHostMatcher(scheme, host); // ======================================================================= //
  // Extract and validate <path>

  const path = pattern.slice(indexOfSlash + 1);
  const pathMatcher = createPathMatcher(path);
  return {
    scheme: schemeMatcher,
    host: hostMatcher,
    path: pathMatcher
  };
}
/**
 * Check if `url` matches against `pattern` (which *must* be a valid match
 * pattern). See `compile(...)` for more information about patterns.
 */


function match(pattern, url) {
  const {
    protocol,
    hostname,
    pathname,
    search
  } = new URL(url);
  const compiled = compile(pattern);

  if (compiled.scheme.has(protocol.slice(0, protocol.length - 1)) === false) {
    return false;
  }

  if (compiled.host !== null) {
    if (compiled.host.test(hostname) === false) {
      return false;
    }
  }

  if (compiled.path !== null) {
    if (compiled.path.test(`${pathname.slice(1)}${search}`) === false) {
      return false;
    }
  }

  return true;
}

/***/ }),

/***/ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/content/register.js":
/*!***************************************************************************************************!*\
  !*** ../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/content/register.js ***!
  \***************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.registerContentScript = registerContentScript;
exports.runContentScripts = runContentScripts;

var _matchPatterns = _interopRequireDefault(__webpack_require__(/*! ./match-patterns */ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/content/match-patterns.js"));

var _helpers = __webpack_require__(/*! ./helpers */ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/content/helpers.js");

var _console = _interopRequireDefault(__webpack_require__(/*! ./console */ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/content/console.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*!
 * Copyright (c) 2014-present Cliqz GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Given `spec` which *must* adhere to the specification defined in [1] and a
 * `window` from the current page (either top window or iframe), decides if
 * content script should be loaded. Note that `registerContentScript` will
 * already check that `spec` is valid at registration time so the argument of
 * `shouldLoadScript` can be assumed to be valid.
 *
 * [1] https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/content_scripts,
 */
function shouldLoadScript(window, spec) {
  // If current frame is not top window, then `allFrames` needs to be true
  if ((0, _helpers.isTopWindow)(window) === false && spec.allFrames !== true) {
    return false;
  }

  let frameUrl = window.location.href; // Handle `matchAboutBlank` option

  if (frameUrl === 'about:blank' || frameUrl === 'about:srcdoc') {
    if (spec.matchAboutBlank !== true) {
      return false;
    } // From: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/content_scripts
    // > Insert the content scripts into pages whose URL is "about:blank" or
    // > "about:srcdoc", if the URL of the page that opened or created this page
    // > matches the patterns specified in the rest of the content_scripts key.
    //
    // Here we change `frameUrl` to the href of the parent if available so that
    // other conditions like `matches` can be tested against it to decide if
    // injection should be performed.


    if (!window.parent) {
      return false;
    }

    frameUrl = window.parent.location.href;
  } // If `frameUrl` matches at least one pattern from `excludeMatches` then abort


  if (spec.excludeMatches !== undefined) {
    for (const pattern of spec.excludeMatches) {
      if ((0, _matchPatterns.default)(pattern, frameUrl)) {
        return false;
      }
    }
  } // Check if `frameUrl` matches at least one pattern from `matches`


  for (const pattern of spec.matches) {
    if ((0, _matchPatterns.default)(pattern, frameUrl)) {
      return true;
    }
  } // If no valid condition was found then we should not inject


  return false;
}
/**
 * Globally hold content scripts for all modules
 */


const CONTENT_SCRIPTS = [];
/**
 * Register a new content-script defined by `spec`. The argument should have the
 * following specification:
 *
 * Examples:
 *  {
 *    module: 'myModule', // name of module
 *    matches: ['<all_urls>'], // mandatory, list of match patterns
 *    excludeMatches: [], // optional
 *    allFrames: true, // optional, default to `false`
 *    matchAboutBlank: true, // optional, default to `false`
 *    js: [() => { ... }], // mandatory, array of functions to inject
 *  }
 */

function registerContentScript(spec) {
  if (spec.module === undefined) {
    _console.default.error('"module" property should be specified in content.es', spec);

    return;
  }

  if (Array.isArray(spec.js) === false) {
    _console.default.error('"js" should be an array of functions', spec);

    return;
  }

  if (Array.isArray(spec.matches) === false) {
    _console.default.error('"matches" should be an array of match patterns', spec);

    return;
  }

  if (spec.excludeMatches !== undefined && Array.isArray(spec.excludeMatches) === false) {
    _console.default.error('"excludeMatches" should either be undefined or an array of match patterns', spec);

    return;
  }

  CONTENT_SCRIPTS.push(spec);
}
/**
 * Inject content scripts from global `CONTENT_SCRIPTS` (populated by
 * `registerContentScript`) into the current window. State of the App can be
 * found in the `CLIQZ` argument and is used to know which modules are enabled.
 * Content scripts from disabled modules are ignored.
 *
 * Returns a collection of callbacks used to trigger content script actions from
 * background. These actions are optionally returned by functions registered in
 * the `js` field given to `registerContentScript`.
 */


function runContentScripts(window, chrome, CLIQZ) {
  const contentScriptActions = {};

  for (const spec of CONTENT_SCRIPTS) {
    const {
      module,
      js
    } = spec;
    const {
      isEnabled
    } = CLIQZ.app.modules[module] || {
      isEnabled: false
    };

    if (isEnabled && shouldLoadScript(window, spec)) {
      for (const script of js) {
        try {
          const actions = script(window, chrome, CLIQZ) || {};
          contentScriptActions[module] = { ...contentScriptActions[module],
            ...actions
          };
        } catch (e) {
          _console.default.error(`CLIQZ content-script failed: ${e} ${e.stack}`);
        }
      }
    }
  }

  return contentScriptActions;
}

/***/ }),

/***/ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/content/run.js":
/*!**********************************************************************************************!*\
  !*** ../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/content/run.js ***!
  \**********************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = _default;

var _globals = __webpack_require__(/*! ../../platform/content/globals */ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/platform/content/globals.js");

var _runtime = _interopRequireDefault(__webpack_require__(/*! ../../platform/runtime */ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/platform/runtime.js"));

var _actionsManager = _interopRequireDefault(__webpack_require__(/*! ./actions-manager */ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/content/actions-manager.js"));

var _register = __webpack_require__(/*! ./register */ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/content/register.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*!
 * Copyright (c) 2014-present Cliqz GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Request App status from core background. This is the slowest way to get App
 * status but is used as a fallback. In most cases, the status will be received
 * before from the dynamic content script injected by `fast-content-app-state-injection.es`
 */
function getAppStatusFromBackground() {
  return _runtime.default.sendMessage({
    module: 'core',
    action: 'status'
  }).then(app => ({
    app
  }));
}
/**
 * Here we don't know which content script was injected first. Either this one
 * is (main one defined in manifest.json) or the dynamic one is (defined in
 * `platform/fast-content-app-state-injection.es`). The following can happen:
 *
 * 1. If `window.CLIQZ` is already defined, it means the dynamic content
 * script was already injected and we already have access to the state of
 * modules.
 * 2. Otherwise, it means that we are first, and that we don't know yet the
 * state of background modules. App status can be obtained in two ways:
 *
 *   a. request status of App to core background via `sendMessage`
 *   b. dynamic content script will be injected and provide status via `runCliqz`
 *
 * Both will race and we use the result of the first of these two, the second
 * one is simply ignored.
 *
 * Overall, this strategy should result in having content scripts being
 * injected as soon as possible.
 */


function getAppStatus() {
  return new Promise(resolve => {
    if (_globals.window.CLIQZ !== undefined) {
      // Dynamic content-script was already injected, we can proceed
      resolve(_globals.window.CLIQZ);
    } else {
      // Define `runCliqz` globally so that dynamic content script can inject
      // App status as soon as it is injected.
      _globals.window.runCliqz = resolve; // Dynamic content-script was not injected yet, we request status of App
      // async. It will return the same information as dynamic content script so
      // we take whatever comes first.

      getAppStatusFromBackground().then(resolve, () => {
        /* silence errors */
      });
    }
  });
}
/**
 * Entrypoint for content script injection. This needs to be called so that
 * content scripts registered via `registerContentScript` in each module will
 * actually run. Check `content-script.bundle.es` for more information about the
 * overall flow.
 */


function _default() {
  // Only support injecting into HTML documents
  if (_globals.window.document.documentElement.nodeName.toLowerCase() !== 'html') {
    return;
  } // Content script actions manager needs to start listening for messages from
  // background as soon as possible since injection of actual content scripts
  // might take a while and background could request some action before it's
  // ready. Until content scripts are injected, messages received will be
  // buffered in memory.


  const contentScriptActions = new _actionsManager.default(); // Wait for App status to be received then proceed to injection

  getAppStatus().then(CLIQZ => {
    // Augment CLIQZ global to add action support. The API can then be used from
    // content scripts of each module to transparently call actions from
    // modules' backgrounds.
    for (const [name, module] of Object.entries(CLIQZ.app.modules)) {
      // eslint-disable-next-line no-param-reassign
      module.action = (action, ...args) => _runtime.default.sendMessage({
        module: name,
        action,
        args
      });
    } // Inject enabled content-scripts and register content-script actions so that
    // background can request actions from them.


    contentScriptActions.setActionCallbacks((0, _register.runContentScripts)(_globals.window, _globals.chrome, CLIQZ)); // Stop listening for messages on window unload

    _globals.window.addEventListener('pagehide', () => {
      contentScriptActions.unload();
    }, {
      once: true
    });
  });
}

/***/ }),

/***/ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/decorators.js":
/*!*********************************************************************************************!*\
  !*** ../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/decorators.js ***!
  \*********************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.deadline = deadline;
exports.debounce = debounce;
exports.nextIdle = nextIdle;
exports.nextTick = nextTick;
exports.throttle = throttle;
exports.tryPromise = tryPromise;
exports.withTimeout = withTimeout;

var _sleep = _interopRequireDefault(__webpack_require__(/*! ./helpers/sleep */ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/helpers/sleep.js"));

var _timers = __webpack_require__(/*! ../core/timers */ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/timers.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*!
 * Copyright (c) 2014-present Cliqz GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
function throttle(window, fn, threshhold) {
  let last;
  let timer;
  return (...args) => {
    const now = Date.now();

    if (last && now < last + threshhold) {
      // reset timeout
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        last = now;
        fn(...args);
      }, threshhold);
    } else {
      last = now;
      fn(...args);
    }
  };
}
/**
 * simple version of https://davidwalsh.name/javascript-debounce-function,
 * without options to cancel or execute immediately.
 *
 * @param {Function} fn
 * @param {number} [delay] in ms
 * @returns {Function} the debounced function,
 * or the given function when delay is falsy.
 */


function debounce(fn, delay) {
  let timeout = null;
  return !delay ? fn : function debounced(...args) {
    // https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/clearTimeout
    // Passing an invalid ID to clearTimeout() silently does nothing; no exception is thrown.
    (0, _timers.clearTimeout)(timeout);

    const delayed = () => {
      timeout = null;
      fn(...args);
    };

    timeout = (0, _timers.setTimeout)(delayed, delay);
  };
}

function deadline(promise, timeout) {
  return Promise.race([(0, _sleep.default)(timeout), promise]);
}

function nextTick(fn, ...args) {
  return Promise.resolve().then(() => fn(...args));
}

function nextIdle() {
  if (typeof window === 'undefined' || !window.requestIdleCallback) {
    return nextTick(() => {});
  }

  return new Promise(resolve => {
    window.requestIdleCallback(resolve);
  });
}

async function withTimeout(promise, timeoutInMs) {
  let timer;

  try {
    timer = new Promise((_, reject) => {
      (0, _timers.setTimeout)(() => reject(new Error(`Timed out after ${timeoutInMs / 1000} seconds`)), timeoutInMs);
    });
    return await Promise.race([promise, timer]);
  } finally {
    (0, _timers.clearTimeout)(timer);
  }
} // Helper if you only want to print the result of a promise.


async function tryPromise(promise, timeoutInMs = 1000) {
  try {
    return await withTimeout(promise, timeoutInMs);
  } catch (e) {
    return `Failed: ${e}`;
  }
}

/***/ }),

/***/ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/helpers/remote-action-provider.js":
/*!*****************************************************************************************************************!*\
  !*** ../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/helpers/remote-action-provider.js ***!
  \*****************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _runtime = _interopRequireDefault(__webpack_require__(/*! ../../platform/runtime */ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/platform/runtime.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*!
 * Copyright (c) 2014-present Cliqz GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Abstract away exposing actions triggered through `sendMessage`. This is done
 * in `navigation-extension` in different contexts: content scripts, popup
 * windows, etc.
 */
class RemoteActionProvider {
  constructor(module, actions) {
    this.onMessage = message => {
      if (message.module === module) {
        const handler = actions[message.action];

        if (handler !== undefined) {
          // Prepare array of arguments which will be given to `handler`
          let args = message.args || []; // Backward compatible "hack" since some users of this API still
          // provide a unique argument in the form of `{ message }`. If we
          // detect this scenario then we use it as argument for `handler`.

          if (message.message !== undefined) {
            args = [message.message];
          }

          return Promise.resolve(handler(...args));
        }
      }

      return undefined; // not handled by us
    };
  }

  init() {
    _runtime.default.onMessage.addListener(this.onMessage);
  }

  unload() {
    _runtime.default.onMessage.removeListener(this.onMessage);
  }

}

exports["default"] = RemoteActionProvider;

/***/ }),

/***/ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/helpers/sleep.js":
/*!************************************************************************************************!*\
  !*** ../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/helpers/sleep.js ***!
  \************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = sleep;

var _timers = __webpack_require__(/*! ../timers */ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/timers.js");

/*!
 * Copyright (c) 2014-present Cliqz GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
function sleep(time) {
  return new Promise(resolve => (0, _timers.setTimeout)(resolve, time));
}

/***/ }),

/***/ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/timers.js":
/*!*****************************************************************************************!*\
  !*** ../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/timers.js ***!
  \*****************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
Object.defineProperty(exports, "clearInterval", ({
  enumerable: true,
  get: function () {
    return _timers.clearInterval;
  }
}));
Object.defineProperty(exports, "clearTimeout", ({
  enumerable: true,
  get: function () {
    return _timers.clearTimeout;
  }
}));
Object.defineProperty(exports, "setInterval", ({
  enumerable: true,
  get: function () {
    return _timers.setInterval;
  }
}));
Object.defineProperty(exports, "setTimeout", ({
  enumerable: true,
  get: function () {
    return _timers.setTimeout;
  }
}));

var _timers = __webpack_require__(/*! ../platform/timers */ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/platform/timers.js");

/***/ }),

/***/ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/human-web/ad-detection.js":
/*!****************************************************************************************************!*\
  !*** ../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/human-web/ad-detection.js ***!
  \****************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.normalizeAclkUrl = normalizeAclkUrl;

/*!
 * Copyright (c) 2014-present Cliqz GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/* eslint-disable import/prefer-default-export */

/**
 * Google pagead aclk look like this:
 * https://www.googleadservices.com/pagead/aclk?sa=L&ai=DChcSEwjNi5bcsbPWAhUW4BsKHUePBAwYABARGgJ3bA&ohost=www.google.de&cid=CAASEuRo7v8yDlI1j5_Xe3oAtyANqQ&sig=AOD64_0I3As2z06whZRtfqOC3PGdhk9SIQ&ctype=5&q=&ved=0ahUKEwjc7JLcsbPWAhVLuhQKHQWpCRcQ9aACCKIB&adurl=
 *
 * This function takes such an url and returns a normalized string
 * (which is no longer an url). Links to identical ads should be
 * normalized to the same string while links to different ads
 * should be mapped to different keys.
 */
function normalizeAclkUrl(url) {
  // Note: Any base URL could be used here. It is only needed as we want to support
  // also relative URLs.
  const parsed = new URL(url, 'https://www.googleadservices.com');

  if (parsed.pathname !== '/pagead/aclk' && parsed.pathname !== '/aclk') {
    throw new Error(`Expected Google pagead "aclk" URL. Instead got: ${url}`);
  } // Ignore the "ved" code, as it seems to change between clicks.
  //
  // For background information about the "ved" code, see
  // https://deedpolloffice.com/blog/articles/decoding-ved-parameter
  //
  // "dct" can also be ignored for the matching.


  const isRelevant = entry => !['ved', 'dct'].includes(entry[0]);

  const relevantParams = [...parsed.searchParams].filter(isRelevant); // Combine it into one string. The function itself does not matter as long as it is
  // injective and is agnoistic of the ordering. Here, we will make it look like a query
  // ("key1=val1&key2=val2...").

  return relevantParams.sort().map(x => x.join('=')).join('&');
}

/***/ }),

/***/ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/human-web/content.js":
/*!***********************************************************************************************!*\
  !*** ../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/human-web/content.js ***!
  \***********************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.parseDom = parseDom;

var _runtime = _interopRequireDefault(__webpack_require__(/*! ../platform/runtime */ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/platform/runtime.js"));

var _register = __webpack_require__(/*! ../core/content/register */ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/content/register.js");

var _decorators = __webpack_require__(/*! ../core/decorators */ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/decorators.js");

var _adDetection = __webpack_require__(/*! ./ad-detection */ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/human-web/ad-detection.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*!
 * Copyright (c) 2014-present Cliqz GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
function logException(e) {
  window.console.error('[human-web] Exception caught:', e);
} // eslint-disable-next-line import/prefer-default-export


function parseDom(url, window, hw) {
  const document = window.document; // Let's try and get META refresh to detect javascript redirects.

  try {
    let jsRef = null;
    jsRef = document.querySelector('script');

    if (jsRef && jsRef.innerHTML.indexOf('location.replace') > -1) {
      const location = document.querySelector('title').textContent; // NOTE: this should be migrated to use:
      // CLIQZ.modules['human-web'].action('jsRedirect', {
      //   message: { ... }
      // })

      _runtime.default.sendMessage({
        module: 'human-web',
        action: 'jsRedirect',
        args: [{
          message: {
            location,
            url: document.location.href
          }
        }]
      });
    }
  } catch (ee) {
    logException(ee);
  }

  try {
    let _ad = '';
    let _h = false;

    if (document.querySelector('#s0p1c0')) {
      _ad = document.querySelector('#s0p1c0').href;
    }

    if (document.querySelector('#tads .ads-ad')) {
      if (document.querySelector('#tads .ads-ad').offsetParent === null) _h = true;
    }

    const additionalInfo = {
      type: 'dom',
      ad: _ad,
      hidden: _h
    };
    hw.action('contentScriptTopAds', {
      message: additionalInfo
    });
  } catch (ee) {
    logException(ee);
  } // We need to get all the ADS from this page.


  try {
    const adDetails = {};
    const doc = window.document;
    let noAdsOnThisPage = 0;
    const detectAdRules = {
      query: {
        element: '#rso',
        attribute: 'data-async-context'
      },
      adSections: ['#tads div[data-text-ad]', '.pla-unit-container', '.pla-hovercard-content-ellip', '.cu-container tr'],
      0: {
        cu: 'a',
        cuAttr: 'data-rw',
        fu: 'a'
      },
      1: {
        cu: "a[id^='plaurlg']",
        fu: "a[id^='vplaurlg']"
      },
      2: {
        // TODO: most likely dead
        cu: "a[id^='plaurlh']",
        fu: "a[id^='vplaurlh']"
      },
      3: {
        cu: "a[id^='plaurlt']",
        fu: "a[id^='vplaurlt']"
      }
    }; // We need to scrape the query too.

    const queryElement = doc.querySelector(detectAdRules.query.element);
    let query = '';

    if (queryElement) {
      query = queryElement.getAttribute(detectAdRules.query.attribute).replace('query:', '');

      try {
        query = decodeURIComponent(query);
      } catch (ee) {// empty
      }
    } // Let's iterate over each possible section of the ads.


    detectAdRules.adSections.forEach((eachAdSection, idx) => {
      const adNodes = Array.prototype.slice.call(doc.querySelectorAll(eachAdSection));
      adNodes.forEach(eachAd => {
        const cuRule = detectAdRules[idx].cu;
        const fuRule = detectAdRules[idx].fu;
        const clink = eachAd.querySelector(cuRule);
        const flink = eachAd.querySelector(fuRule);

        if (clink && flink) {
          const cuAttr = detectAdRules[idx].cuAttr || 'href';
          const clickPattern = (0, _adDetection.normalizeAclkUrl)(clink.getAttribute(cuAttr));
          const fuAttr = detectAdRules[idx].fuAttr || 'href';
          adDetails[clickPattern] = {
            ts: Date.now(),
            query,
            furl: [flink.getAttribute('data-preconnect-urls'), flink.getAttribute(fuAttr)] // At times there is a redirect chain, we only want the final domain.

          };
          noAdsOnThisPage += 1;
        }
      });
    });

    if (noAdsOnThisPage > 0) {
      hw.action('adClick', {
        ads: adDetails
      });
    }
  } catch (ee) {
    logException(ee);
  }
}

function contentScript(window, chrome, CLIQZ) {
  const url = window.location.href;
  const hw = CLIQZ.app.modules['human-web']; // Only add for main pages.

  if (window.top === window) {
    window.addEventListener('DOMContentLoaded', () => {
      parseDom(url, window, hw);
    });
  }

  function proxyWindowEvent(action) {
    return ev => {
      hw.action(action, {
        target: {
          baseURI: ev.target.baseURI
        }
      });
    };
  }

  const onKeyPress = (0, _decorators.throttle)(window, proxyWindowEvent('hw:keypress'), 250);
  const onMouseMove = (0, _decorators.throttle)(window, proxyWindowEvent('hw:mousemove'), 250);
  const onScroll = (0, _decorators.throttle)(window, proxyWindowEvent('hw:scroll'), 250);
  const onCopy = (0, _decorators.throttle)(window, proxyWindowEvent('hw:copy'), 250);
  window.addEventListener('keypress', onKeyPress);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('scroll', onScroll);
  window.addEventListener('copy', onCopy);

  function stop(ev) {
    if (ev && ev.target !== window.document) {
      return;
    } // detect dead windows
    // https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Errors/Dead_object


    try {
      String(window);
    } catch (e) {
      return;
    }

    window.removeEventListener('keypress', onKeyPress);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('copy', onCopy);
  }

  window.addEventListener('pagehide', stop);
}

(0, _register.registerContentScript)({
  module: 'human-web',
  matches: ['http://*/*', 'https://*/*'],
  js: [contentScript],
  allFrames: true
});

/***/ }),

/***/ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/insights/content.js":
/*!**********************************************************************************************!*\
  !*** ../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/insights/content.js ***!
  \**********************************************************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var _register = __webpack_require__(/*! ../core/content/register */ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/content/register.js");

var _timers = __webpack_require__(/*! ../core/timers */ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/timers.js");

/*!
 * Copyright (c) 2014-present Cliqz GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
function analyzePageInfo(CLIQZ) {
  const {
    host,
    hostname,
    pathname,
    protocol
  } = document.location;
  const pTime = performance.timing.domContentLoadedEventStart - performance.timing.requestStart;
  const pageLatency = pTime || 0;
  CLIQZ.app.modules.insights.action('recordPageInfo', {
    domain: `${protocol}//${host}${pathname}`,
    host: hostname,
    timestamp: performance.timing.navigationStart,
    latency: pageLatency,
    pageTiming: {
      timing: {
        navigationStart: performance.timing.navigationStart,
        loadEventEnd: performance.timing.loadEventEnd
      }
    }
  });
}

function contentScript(window, chrome, CLIQZ) {
  if (document.readyState !== 'complete') {
    window.addEventListener('load', () => {
      (0, _timers.setTimeout)(() => {
        analyzePageInfo(CLIQZ);
      }, 1);
    });
  } else {
    analyzePageInfo(CLIQZ);
  }
}

(0, _register.registerContentScript)({
  module: 'insights',
  matches: ['http://*/*', 'https://*/*'],
  js: [contentScript]
});

/***/ }),

/***/ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/module-content-script.js":
/*!***************************************************************************************************!*\
  !*** ../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/module-content-script.js ***!
  \***************************************************************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


__webpack_require__(/*! ./core/content */ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/content.js");

__webpack_require__(/*! ./human-web/content */ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/human-web/content.js");

__webpack_require__(/*! ./antitracking/content */ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/antitracking/content.js");

__webpack_require__(/*! ./adblocker/content */ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/adblocker/content.js");

__webpack_require__(/*! ./insights/content */ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/insights/content.js");

/***/ }),

/***/ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/platform/content/globals.js":
/*!******************************************************************************************************!*\
  !*** ../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/platform/content/globals.js ***!
  \******************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.window = exports.chrome = void 0;

/*!
 * Copyright (c) 2014-present Cliqz GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
const newChrome = typeof browser !== 'undefined' ? browser : chrome;
exports.chrome = newChrome;
const newWindow = window;
exports.window = newWindow;

/***/ }),

/***/ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/platform/lib/adblocker-cosmetics.js":
/*!**************************************************************************************************************!*\
  !*** ../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/platform/lib/adblocker-cosmetics.js ***!
  \**************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
Object.defineProperty(exports, "default", ({
  enumerable: true,
  get: function () {
    return _adblockerWebextensionCosmetics.injectCosmetics;
  }
}));

var _adblockerWebextensionCosmetics = __webpack_require__(/*! @cliqz/adblocker-webextension-cosmetics */ "./node_modules/@cliqz/adblocker-webextension-cosmetics/dist/cjs/adblocker.cjs");

/***/ }),

/***/ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/platform/runtime.js":
/*!**********************************************************************************************!*\
  !*** ../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/platform/runtime.js ***!
  \**********************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _webextensionPolyfill = _interopRequireDefault(__webpack_require__(/*! webextension-polyfill */ "./node_modules/webextension-polyfill/dist/browser-polyfill.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*!
 * Copyright (c) 2014-present Cliqz GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
// NOTE: this is an attempt at using `webextension-polyfill` to abstract away
// API differences between different browser (e.g.: promisify chrome functions).
// Eventually, it could be used globally from 'platforms/webextension/globals.es'.
var _default = (typeof browser !== 'undefined' ? browser : _webextensionPolyfill.default).runtime;
exports["default"] = _default;

/***/ }),

/***/ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/platform/timers.js":
/*!*********************************************************************************************!*\
  !*** ../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/platform/timers.js ***!
  \*********************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.setTimeout = exports.setInterval = exports.clearTimeout = exports.clearInterval = void 0;

/*!
 * Copyright (c) 2014-present Cliqz GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
const _setTimeout = (...args) => (typeof setTimeout === 'undefined' ? window.setTimeout.bind(window) : setTimeout)(...args);

exports.setTimeout = _setTimeout;

const _setInterval = (...args) => (typeof setInterval === 'undefined' ? window.setInterval.bind(window) : setInterval)(...args);

exports.setInterval = _setInterval;

const _clearTimeout = (...args) => (typeof clearTimeout === 'undefined' ? window.clearTimeout.bind(window) : clearTimeout)(...args);

exports.clearTimeout = _clearTimeout;

const _clearInterval = (...args) => (typeof clearInterval === 'undefined' ? window.clearInterval.bind(window) : clearInterval)(...args);

exports.clearInterval = _clearInterval;

/***/ }),

/***/ "./node_modules/@cliqz/adblocker-content/dist/cjs/adblocker.cjs":
/*!**********************************************************************!*\
  !*** ./node_modules/@cliqz/adblocker-content/dist/cjs/adblocker.cjs ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


/*!
 * Copyright (c) 2017-present Cliqz GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
const SCRIPT_ID = 'cliqz-adblocker-script';
const IGNORED_TAGS = new Set(['br', 'head', 'link', 'meta', 'script', 'style', 's']);
function debounce(fn, { waitFor, maxWait, }) {
    let delayedTimer;
    let maxWaitTimer;
    const clear = () => {
        clearTimeout(delayedTimer);
        clearTimeout(maxWaitTimer);
        delayedTimer = undefined;
        maxWaitTimer = undefined;
    };
    const run = () => {
        clear();
        fn();
    };
    return [
        () => {
            if (maxWait > 0 && maxWaitTimer === undefined) {
                maxWaitTimer = setTimeout(run, maxWait);
            }
            clearTimeout(delayedTimer);
            delayedTimer = setTimeout(run, waitFor);
        },
        clear,
    ];
}
function isElement(node) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType#node_type_constants
    return node.nodeType === 1; // Node.ELEMENT_NODE;
}
function getElementsFromMutations(mutations) {
    // Accumulate all nodes which were updated in `nodes`
    const elements = [];
    for (const mutation of mutations) {
        if (mutation.type === 'attributes') {
            if (isElement(mutation.target)) {
                elements.push(mutation.target);
            }
        }
        else if (mutation.type === 'childList') {
            for (const addedNode of mutation.addedNodes) {
                if (isElement(addedNode) && addedNode.id !== SCRIPT_ID) {
                    elements.push(addedNode);
                }
            }
        }
    }
    return elements;
}
/**
 * WARNING: this function should be self-contained and not rely on any global
 * symbol. That constraint needs to be fulfilled because this function can
 * potentially be injected in content-script (e.g.: see PuppeteerBlocker for
 * more details).
 */
function extractFeaturesFromDOM(roots) {
    // NOTE: This cannot be global as puppeteer needs to be able to serialize this function.
    const ignoredTags = new Set(['br', 'head', 'link', 'meta', 'script', 'style', 's']);
    const classes = new Set();
    const hrefs = new Set();
    const ids = new Set();
    const seenElements = new Set();
    for (const root of roots) {
        for (const element of [
            root,
            ...root.querySelectorAll('[id]:not(html):not(body),[class]:not(html):not(body),[href]:not(html):not(body)'),
        ]) {
            // If one of root belongs to another root which is parent node of the one, querySelectorAll can return duplicates.
            if (seenElements.has(element)) {
                continue;
            }
            seenElements.add(element);
            // Any conditions to filter this element out should be placed under this line:
            if (ignoredTags.has(element.nodeName.toLowerCase())) {
                continue;
            }
            // Update ids
            const id = element.id;
            if (id) {
                ids.add(id);
            }
            // Update classes
            const classList = element.classList;
            for (const classEntry of classList) {
                classes.add(classEntry);
            }
            // Update href
            const href = element.getAttribute('href');
            if (typeof href === 'string') {
                hrefs.add(href);
            }
        }
    }
    return {
        classes: Array.from(classes),
        hrefs: Array.from(hrefs),
        ids: Array.from(ids),
    };
}
class DOMMonitor {
    constructor(cb) {
        this.cb = cb;
        this.knownIds = new Set();
        this.knownHrefs = new Set();
        this.knownClasses = new Set();
        this.observer = null;
    }
    queryAll(window) {
        this.cb({ type: 'elements', elements: [window.document.documentElement] });
        this.handleUpdatedNodes([window.document.documentElement]);
    }
    start(window) {
        if (this.observer === null && window.MutationObserver !== undefined) {
            const nodes = new Set();
            const handleUpdatedNodesCallback = () => {
                this.handleUpdatedNodes(Array.from(nodes));
                nodes.clear();
            };
            const [debouncedHandleUpdatedNodes, cancelHandleUpdatedNodes] = debounce(handleUpdatedNodesCallback, {
                waitFor: 25,
                maxWait: 1000,
            });
            this.observer = new window.MutationObserver((mutations) => {
                getElementsFromMutations(mutations).forEach(nodes.add, nodes);
                // Set a threshold to prevent websites continuously
                // causing DOM mutations making the set being filled up infinitely.
                if (nodes.size > 512) {
                    cancelHandleUpdatedNodes();
                    handleUpdatedNodesCallback();
                }
                else {
                    debouncedHandleUpdatedNodes();
                }
            });
            this.observer.observe(window.document.documentElement, {
                // Monitor some attributes
                attributes: true,
                attributeFilter: ['class', 'id', 'href'],
                childList: true,
                subtree: true,
            });
        }
    }
    stop() {
        if (this.observer !== null) {
            this.observer.disconnect();
            this.observer = null;
        }
    }
    handleNewFeatures({ hrefs, ids, classes, }) {
        const newIds = [];
        const newClasses = [];
        const newHrefs = [];
        // Update ids
        for (const id of ids) {
            if (this.knownIds.has(id) === false) {
                newIds.push(id);
                this.knownIds.add(id);
            }
        }
        for (const cls of classes) {
            if (this.knownClasses.has(cls) === false) {
                newClasses.push(cls);
                this.knownClasses.add(cls);
            }
        }
        for (const href of hrefs) {
            if (this.knownHrefs.has(href) === false) {
                newHrefs.push(href);
                this.knownHrefs.add(href);
            }
        }
        if (newIds.length !== 0 || newClasses.length !== 0 || newHrefs.length !== 0) {
            this.cb({
                type: 'features',
                classes: newClasses,
                hrefs: newHrefs,
                ids: newIds,
            });
            return true;
        }
        return false;
    }
    handleUpdatedNodes(elements) {
        if (elements.length !== 0) {
            this.cb({
                type: 'elements',
                elements: elements.filter((e) => IGNORED_TAGS.has(e.nodeName.toLowerCase()) === false),
            });
            return this.handleNewFeatures(extractFeaturesFromDOM(elements));
        }
        return false;
    }
}
/**
 * Wrap a self-executing script into a block of custom logic to remove the
 * script tag once execution is terminated. This can be useful to not leave
 * traces in the DOM after injections.
 */
function autoRemoveScript(script) {
    // Minified using 'terser'
    return `try{${script}}catch(c){}!function(){var c=document.currentScript,e=c&&c.parentNode;e&&e.removeChild(c)}();`;
    // Original:
    //
    //    try {
    //      ${script}
    //    } catch (ex) { }
    //
    //    (function() {
    //      var currentScript = document.currentScript;
    //      var parent = currentScript && currentScript.parentNode;
    //
    //      if (parent) {
    //        parent.removeChild(currentScript);
    //      }
    //    })();
}
function insertNode(node, document) {
    const parent = document.head || document.documentElement || document;
    if (parent !== null) {
        parent.appendChild(node);
    }
}
function injectScriptlet(s, doc) {
    const script = doc.createElement('script');
    script.type = 'text/javascript';
    script.id = SCRIPT_ID;
    script.async = false;
    script.appendChild(doc.createTextNode(autoRemoveScript(s)));
    insertNode(script, doc);
}
function isFirefox(doc) {
    var _a, _b, _c;
    try {
        return ((_c = (_b = (_a = doc.defaultView) === null || _a === void 0 ? void 0 : _a.navigator) === null || _b === void 0 ? void 0 : _b.userAgent) === null || _c === void 0 ? void 0 : _c.indexOf('Firefox')) !== -1;
    }
    catch (e) {
        return false;
    }
}
async function injectScriptletFirefox(s, doc) {
    const win = doc.defaultView;
    const script = doc.createElement('script');
    script.async = false;
    script.id = SCRIPT_ID;
    const blob = new win.Blob([autoRemoveScript(s)], { type: 'text/javascript; charset=utf-8' });
    const url = win.URL.createObjectURL(blob);
    // a hack for tests to that allows for async URL.createObjectURL
    // eslint-disable-next-line @typescript-eslint/await-thenable
    script.src = await url;
    insertNode(script, doc);
    win.URL.revokeObjectURL(url);
}
function injectScript(s, doc) {
    if (isFirefox(doc)) {
        injectScriptletFirefox(s, doc);
    }
    else {
        injectScriptlet(s, doc);
    }
}

exports.DOMMonitor = DOMMonitor;
exports.autoRemoveScript = autoRemoveScript;
exports.extractFeaturesFromDOM = extractFeaturesFromDOM;
exports.injectScript = injectScript;
//# sourceMappingURL=adblocker.cjs.map


/***/ }),

/***/ "./node_modules/@cliqz/adblocker-extended-selectors/dist/cjs/adblocker.cjs":
/*!*********************************************************************************!*\
  !*** ./node_modules/@cliqz/adblocker-extended-selectors/dist/cjs/adblocker.cjs ***!
  \*********************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var parse = __webpack_require__(/*! ./src/parse.cjs */ "./node_modules/@cliqz/adblocker-extended-selectors/dist/cjs/src/parse.cjs");
var _eval = __webpack_require__(/*! ./src/eval.cjs */ "./node_modules/@cliqz/adblocker-extended-selectors/dist/cjs/src/eval.cjs");
var types = __webpack_require__(/*! ./src/types.cjs */ "./node_modules/@cliqz/adblocker-extended-selectors/dist/cjs/src/types.cjs");
var extended = __webpack_require__(/*! ./src/extended.cjs */ "./node_modules/@cliqz/adblocker-extended-selectors/dist/cjs/src/extended.cjs");



exports.parse = parse.parse;
exports.tokenize = parse.tokenize;
exports.matches = _eval.matches;
exports.querySelectorAll = _eval.querySelectorAll;
exports.isAST = types.isAST;
exports.isAtoms = types.isAtoms;
exports.EXTENDED_PSEUDO_CLASSES = extended.EXTENDED_PSEUDO_CLASSES;
exports.PSEUDO_CLASSES = extended.PSEUDO_CLASSES;
exports.PSEUDO_ELEMENTS = extended.PSEUDO_ELEMENTS;
Object.defineProperty(exports, "SelectorType", ({
	enumerable: true,
	get: function () { return extended.SelectorType; }
}));
exports.classifySelector = extended.classifySelector;
//# sourceMappingURL=adblocker.cjs.map


/***/ }),

/***/ "./node_modules/@cliqz/adblocker-extended-selectors/dist/cjs/src/eval.cjs":
/*!********************************************************************************!*\
  !*** ./node_modules/@cliqz/adblocker-extended-selectors/dist/cjs/src/eval.cjs ***!
  \********************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


/*!
 * Copyright (c) 2017-present Cliqz GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
function matchPattern(pattern, text) {
    // TODO - support 'm' RegExp argument
    if (pattern.startsWith('/') && (pattern.endsWith('/') || pattern.endsWith('/i'))) {
        let caseSensitive = true;
        pattern = pattern.slice(1);
        if (pattern.endsWith('/')) {
            pattern = pattern.slice(0, -1);
        }
        else {
            pattern = pattern.slice(0, -2);
            caseSensitive = false;
        }
        return new RegExp(pattern, caseSensitive === false ? 'i' : undefined).test(text);
    }
    return text.includes(pattern);
}
function matches(element, selector) {
    if (selector.type === 'id' ||
        selector.type === 'class' ||
        selector.type === 'type' ||
        selector.type === 'attribute') {
        return element.matches(selector.content);
    }
    else if (selector.type === 'list') {
        return selector.list.some((s) => matches(element, s));
    }
    else if (selector.type === 'compound') {
        return selector.compound.every((s) => matches(element, s));
    }
    else if (selector.type === 'pseudo-class') {
        if (selector.name === 'has' || selector.name === 'if') {
            // TODO - is this a querySelectorAll or matches here?
            return (selector.subtree !== undefined && querySelectorAll(element, selector.subtree).length !== 0);
        }
        else if (selector.name === 'not') {
            return selector.subtree !== undefined && matches(element, selector.subtree) === false;
        }
        else if (selector.name === 'has-text') {
            const { argument } = selector;
            if (argument === undefined) {
                return false;
            }
            const text = element.textContent;
            if (text === null) {
                return false;
            }
            return matchPattern(argument, text);
        }
        else if (selector.name === 'min-text-length') {
            const minLength = Number(selector.argument);
            if (Number.isNaN(minLength) || minLength < 0) {
                return false;
            }
            const text = element.textContent;
            if (text === null) {
                return false;
            }
            return text.length >= minLength;
        }
    }
    return false;
}
function querySelectorAll(element, selector) {
    const elements = [];
    if (selector.type === 'id' ||
        selector.type === 'class' ||
        selector.type === 'type' ||
        selector.type === 'attribute') {
        elements.push(...element.querySelectorAll(selector.content));
    }
    else if (selector.type === 'list') {
        for (const subSelector of selector.list) {
            elements.push(...querySelectorAll(element, subSelector));
        }
    }
    else if (selector.type === 'compound') {
        // TODO - handling compound needs to be reworked...
        // .cls:upward(1) for example will not work with this implementation.
        // :upward is not about selecting, but transforming a set of nodes (i.e.
        // uBO's transpose method).
        if (selector.compound.length !== 0) {
            elements.push(...querySelectorAll(element, selector.compound[0]).filter((e) => selector.compound.slice(1).every((s) => matches(e, s))));
        }
    }
    else if (selector.type === 'complex') {
        const elements2 = selector.left === undefined ? [element] : querySelectorAll(element, selector.left);
        if (selector.combinator === ' ') {
            for (const element2 of elements2) {
                elements.push(...querySelectorAll(element2, selector.right));
            }
        }
        else if (selector.combinator === '>') {
            for (const element2 of elements2) {
                for (const child of element2.children) {
                    if (matches(child, selector.right) === true) {
                        elements.push(child);
                    }
                }
            }
        }
        else if (selector.combinator === '~') {
            for (const element2 of elements2) {
                let sibling = element2;
                while ((sibling = sibling.nextElementSibling) !== null) {
                    if (matches(sibling, selector.right) === true) {
                        elements.push(sibling);
                    }
                }
            }
        }
        else if (selector.combinator === '+') {
            for (const element2 of elements2) {
                const nextElementSibling = element2.nextElementSibling;
                if (nextElementSibling !== null && matches(nextElementSibling, selector.right) === true) {
                    elements.push(nextElementSibling);
                }
            }
        }
    }
    else if (selector.type === 'pseudo-class') {
        // if (selector.name === 'upward') {
        //   let n = Number(selector.argument);
        //   console.log('upward', selector, n);
        //   if (Number.isNaN(n) === false) {
        //     if (n >= 1 && n < 256) {
        //       let ancestor: Element | null = element;
        //       while (ancestor !== null && n > 0) {
        //         ancestor = ancestor.parentElement;
        //         n -= 1;
        //       }
        //       if (ancestor !== null && n === 0) {
        //         elements.push(element);
        //       }
        //     }
        //   } else if (selector.argument !== undefined) {
        //     const parent = element.parentElement;
        //     if (parent !== null) {
        //       const ancestor = parent.closest(selector.argument);
        //       if (ancestor !== null) {
        //         elements.push(ancestor);
        //       }
        //     }
        //   }
        // } else {
        for (const subElement of element.querySelectorAll('*')) {
            if (matches(subElement, selector) === true) {
                elements.push(subElement);
            }
        }
        // }
    }
    return elements;
}

exports.matchPattern = matchPattern;
exports.matches = matches;
exports.querySelectorAll = querySelectorAll;
//# sourceMappingURL=eval.cjs.map


/***/ }),

/***/ "./node_modules/@cliqz/adblocker-extended-selectors/dist/cjs/src/extended.cjs":
/*!************************************************************************************!*\
  !*** ./node_modules/@cliqz/adblocker-extended-selectors/dist/cjs/src/extended.cjs ***!
  \************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var parse = __webpack_require__(/*! ./parse.cjs */ "./node_modules/@cliqz/adblocker-extended-selectors/dist/cjs/src/parse.cjs");

/*!
 * Copyright (c) 2017-present Cliqz GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
const EXTENDED_PSEUDO_CLASSES = new Set([
    // '-abp-contains',
    // '-abp-has',
    // '-abp-properties',
    'has',
    'has-text',
    'if',
    // 'if-not',
    // 'matches-css',
    // 'matches-css-after',
    // 'matches-css-before',
    // 'min-text-length',
    // 'nth-ancestor',
    // 'upward',
    // 'watch-attr',
    // 'watch-attrs',
    // 'xpath',
]);
const PSEUDO_CLASSES = new Set([
    'active',
    'any',
    'any-link',
    'blank',
    'checked',
    'default',
    'defined',
    'dir',
    'disabled',
    'empty',
    'enabled',
    'first',
    'first-child',
    'first-of-type',
    'focus',
    'focus-visible',
    'focus-within',
    'fullscreen',
    'host',
    'host-context',
    'hover',
    'in-range',
    'indeterminate',
    'invalid',
    'is',
    'lang',
    'last-child',
    'last-of-type',
    'left',
    'link',
    'matches',
    // NOTE: by default we consider `:not(...)` to be a normal CSS selector since,
    // we are only interested in cases where the argument is an extended selector.
    // If that is the case, it will still be detected as such.
    'not',
    'nth-child',
    'nth-last-child',
    'nth-last-of-type',
    'nth-of-type',
    'only-child',
    'only-of-type',
    'optional',
    'out-of-range',
    'placeholder-shown',
    'read-only',
    'read-write',
    'required',
    'right',
    'root',
    'scope',
    'target',
    'valid',
    'visited',
    'where',
]);
// NOTE: here we only need to list the pseudo-elements which can appear with a
// single colon (e.g. :after or ::after are valid for backward compatibility
// reasons). They can be misinterpreted as pseudo-classes by the tokenizer for
// this reason.
const PSEUDO_ELEMENTS = new Set(['after', 'before', 'first-letter', 'first-line']);
exports.SelectorType = void 0;
(function (SelectorType) {
    SelectorType[SelectorType["Normal"] = 0] = "Normal";
    SelectorType[SelectorType["Extended"] = 1] = "Extended";
    SelectorType[SelectorType["Invalid"] = 2] = "Invalid";
})(exports.SelectorType || (exports.SelectorType = {}));
function classifySelector(selector) {
    // In most cases there is no pseudo-anything so we can quickly exit.
    if (selector.indexOf(':') === -1) {
        return exports.SelectorType.Normal;
    }
    const tokens = parse.tokenize(selector);
    // Detect pseudo-classes
    let foundSupportedExtendedSelector = false;
    for (const token of tokens) {
        if (token.type === 'pseudo-class') {
            const { name } = token;
            if (EXTENDED_PSEUDO_CLASSES.has(name) === true) {
                foundSupportedExtendedSelector = true;
            }
            else if (PSEUDO_CLASSES.has(name) === false && PSEUDO_ELEMENTS.has(name) === false) {
                return exports.SelectorType.Invalid;
            }
            // Recursively
            if (foundSupportedExtendedSelector === false &&
                token.argument !== undefined &&
                parse.RECURSIVE_PSEUDO_CLASSES.has(name) === true) {
                const argumentType = classifySelector(token.argument);
                if (argumentType === exports.SelectorType.Invalid) {
                    return argumentType;
                }
                else if (argumentType === exports.SelectorType.Extended) {
                    foundSupportedExtendedSelector = true;
                }
            }
        }
    }
    if (foundSupportedExtendedSelector === true) {
        return exports.SelectorType.Extended;
    }
    return exports.SelectorType.Normal;
}

exports.EXTENDED_PSEUDO_CLASSES = EXTENDED_PSEUDO_CLASSES;
exports.PSEUDO_CLASSES = PSEUDO_CLASSES;
exports.PSEUDO_ELEMENTS = PSEUDO_ELEMENTS;
exports.classifySelector = classifySelector;
//# sourceMappingURL=extended.cjs.map


/***/ }),

/***/ "./node_modules/@cliqz/adblocker-extended-selectors/dist/cjs/src/parse.cjs":
/*!*********************************************************************************!*\
  !*** ./node_modules/@cliqz/adblocker-extended-selectors/dist/cjs/src/parse.cjs ***!
  \*********************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var types = __webpack_require__(/*! ./types.cjs */ "./node_modules/@cliqz/adblocker-extended-selectors/dist/cjs/src/types.cjs");

/*!
 * Based on parsel. Extended by Rémi Berson for Ghostery (2021).
 * https://github.com/LeaVerou/parsel
 *
 * MIT License
 *
 * Copyright (c) 2020 Lea Verou
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
const RECURSIVE_PSEUDO_CLASSES = new Set([
    'any',
    'dir',
    'has',
    'host-context',
    'if',
    'if-not',
    'is',
    'matches',
    'not',
    'where',
]);
const TOKENS = {
    attribute: /\[\s*(?:(?<namespace>\*|[-\w]*)\|)?(?<name>[-\w\u{0080}-\u{FFFF}]+)\s*(?:(?<operator>\W?=)\s*(?<value>.+?)\s*(?<caseSensitive>[iIsS])?\s*)?\]/gu,
    id: /#(?<name>(?:[-\w\u{0080}-\u{FFFF}]|\\.)+)/gu,
    class: /\.(?<name>(?:[-\w\u{0080}-\u{FFFF}]|\\.)+)/gu,
    comma: /\s*,\s*/g, // must be before combinator
    combinator: /\s*[\s>+~]\s*/g, // this must be after attribute
    'pseudo-element': /::(?<name>[-\w\u{0080}-\u{FFFF}]+)(?:\((?:¶*)\))?/gu, // this must be before pseudo-class
    'pseudo-class': /:(?<name>[-\w\u{0080}-\u{FFFF}]+)(?:\((?<argument>¶*)\))?/gu,
    type: /(?:(?<namespace>\*|[-\w]*)\|)?(?<name>[-\w\u{0080}-\u{FFFF}]+)|\*/gu, // this must be last
};
const TOKENS_WITH_PARENS = new Set(['pseudo-class', 'pseudo-element']);
const TOKENS_WITH_STRINGS = new Set([...TOKENS_WITH_PARENS, 'attribute']);
const TRIM_TOKENS = new Set(['combinator', 'comma']);
const TOKENS_FOR_RESTORE = Object.assign({}, TOKENS);
TOKENS_FOR_RESTORE['pseudo-element'] = RegExp(TOKENS['pseudo-element'].source.replace('(?<argument>¶*)', '(?<argument>.*?)'), 'gu');
TOKENS_FOR_RESTORE['pseudo-class'] = RegExp(TOKENS['pseudo-class'].source.replace('(?<argument>¶*)', '(?<argument>.*)'), 'gu');
// TODO - it feels like with some more typing shenanigans we could replace groups validation by generic logic in this function.
function splitOnMatch(pattern, str) {
    pattern.lastIndex = 0;
    const match = pattern.exec(str);
    if (match === null) {
        return undefined;
    }
    const from = match.index - 1;
    const content = match[0];
    const before = str.slice(0, from + 1);
    const after = str.slice(from + content.length + 1);
    return [before, [content, match.groups || {}], after];
}
const GRAMMAR = [
    // attribute
    (str) => {
        const match = splitOnMatch(TOKENS.attribute, str);
        if (match === undefined) {
            return undefined;
        }
        const [before, [content, { name, operator, value, namespace, caseSensitive }], after] = match;
        if (name === undefined) {
            return undefined;
        }
        return [
            before,
            {
                type: 'attribute',
                content,
                length: content.length,
                namespace,
                caseSensitive,
                pos: [],
                name,
                operator,
                value,
            },
            after,
        ];
    },
    // #id
    (str) => {
        const match = splitOnMatch(TOKENS.id, str);
        if (match === undefined) {
            return undefined;
        }
        const [before, [content, { name }], after] = match;
        if (name === undefined) {
            return undefined;
        }
        return [
            before,
            {
                type: 'id',
                content,
                length: content.length,
                pos: [],
                name,
            },
            after,
        ];
    },
    // .class
    (str) => {
        const match = splitOnMatch(TOKENS.class, str);
        if (match === undefined) {
            return undefined;
        }
        const [before, [content, { name }], after] = match;
        if (name === undefined) {
            return undefined;
        }
        return [
            before,
            {
                type: 'class',
                content,
                length: content.length,
                pos: [],
                name,
            },
            after,
        ];
    },
    // comma ,
    (str) => {
        const match = splitOnMatch(TOKENS.comma, str);
        if (match === undefined) {
            return undefined;
        }
        const [before, [content], after] = match;
        return [
            before,
            {
                type: 'comma',
                content,
                length: content.length,
                pos: [],
            },
            after,
        ];
    },
    // combinator
    (str) => {
        const match = splitOnMatch(TOKENS.combinator, str);
        if (match === undefined) {
            return undefined;
        }
        const [before, [content], after] = match;
        return [
            before,
            {
                type: 'combinator',
                content,
                length: content.length,
                pos: [],
            },
            after,
        ];
    },
    // pseudo-element
    (str) => {
        const match = splitOnMatch(TOKENS['pseudo-element'], str);
        if (match === undefined) {
            return undefined;
        }
        const [before, [content, { name }], after] = match;
        if (name === undefined) {
            return undefined;
        }
        return [
            before,
            {
                type: 'pseudo-element',
                content,
                length: content.length,
                pos: [],
                name,
            },
            after,
        ];
    },
    // pseudo-class
    (str) => {
        const match = splitOnMatch(TOKENS['pseudo-class'], str);
        if (match === undefined) {
            return undefined;
        }
        // TODO - here `argument` can be undefined and should be rejected?
        const [before, [content, { name, argument }], after] = match;
        if (name === undefined) {
            return undefined;
        }
        return [
            before,
            {
                type: 'pseudo-class',
                content,
                length: content.length,
                pos: [],
                name,
                argument,
                subtree: undefined,
            },
            after,
        ];
    },
    // type
    (str) => {
        const match = splitOnMatch(TOKENS.type, str);
        if (match === undefined) {
            return undefined;
        }
        const [before, [content, { name, namespace }], after] = match;
        return [
            before,
            {
                type: 'type',
                content,
                length: content.length,
                namespace,
                pos: [],
                name,
            },
            after,
        ];
    },
];
function tokenizeBy(text) {
    if (!text) {
        return [];
    }
    const strarr = [text];
    for (const tokenizer of GRAMMAR) {
        for (let i = 0; i < strarr.length; i++) {
            const str = strarr[i];
            if (typeof str === 'string') {
                const match = tokenizer(str);
                if (match !== undefined) {
                    strarr.splice(i, 1, ...match.filter((a) => a.length !== 0));
                }
            }
        }
    }
    let offset = 0;
    for (const token of strarr) {
        if (typeof token !== 'string') {
            token.pos = [offset, offset + token.length];
            if (TRIM_TOKENS.has(token.type)) {
                token.content = token.content.trim() || ' ';
            }
        }
        offset += token.length;
    }
    if (types.isAtoms(strarr)) {
        return strarr;
    }
    // NOTE: here this means that parsing failed.
    return [];
}
function restoreNested(tokens, strings, regex, types) {
    // TODO - here from offsets in strings and tokens we should be able to find the exact spot without RegExp?
    for (const str of strings) {
        for (const token of tokens) {
            if (types.has(token.type) && token.pos[0] < str.start && str.start < token.pos[1]) {
                const content = token.content;
                token.content = token.content.replace(regex, str.str);
                if (token.content !== content) {
                    // actually changed?
                    // Re-evaluate groups
                    TOKENS_FOR_RESTORE[token.type].lastIndex = 0;
                    const match = TOKENS_FOR_RESTORE[token.type].exec(token.content);
                    if (match !== null) {
                        Object.assign(token, match.groups);
                    }
                }
            }
        }
    }
}
function isEscaped(str, index) {
    let backslashes = 0;
    index -= 1;
    while (index >= 0 && str[index] === '\\') {
        backslashes += 1;
        index -= 1;
    }
    return backslashes % 2 !== 0;
}
function gobbleQuotes(text, quote, start) {
    // Find end of quote, taking care of ignoring escaped quotes
    let end = start + 1;
    while ((end = text.indexOf(quote, end)) !== -1 && isEscaped(text, end) === true) {
        end += 1;
    }
    if (end === -1) {
        // Opening quote without closing quote
        return undefined;
    }
    return text.slice(start, end + 1);
}
function gobbleParens(text, start) {
    let stack = 0;
    for (let i = start; i < text.length; i++) {
        const char = text[i];
        if (char === '(') {
            stack += 1;
        }
        else if (char === ')') {
            if (stack > 0) {
                stack -= 1;
            }
            else {
                // Closing paren without opening paren
                return undefined;
            }
        }
        if (stack === 0) {
            return text.slice(start, i + 1);
        }
    }
    // Opening paren without closing paren
    return undefined;
}
function replace(selector, replacement, opening, gobble) {
    const strings = [];
    let offset = 0;
    while ((offset = selector.indexOf(opening, offset)) !== -1) {
        const str = gobble(selector, offset);
        if (str === undefined) {
            break;
        }
        strings.push({ str, start: offset });
        selector = `${selector.slice(0, offset + 1)}${replacement.repeat(str.length - 2)}${selector.slice(offset + str.length - 1)}`;
        offset += str.length;
    }
    return [strings, selector];
}
function tokenize(selector) {
    if (typeof selector !== 'string') {
        return [];
    }
    // Prevent leading/trailing whitespace be interpreted as combinators
    selector = selector.trim();
    if (selector.length === 0) {
        return [];
    }
    // Replace strings with whitespace strings (to preserve offsets)
    const [doubleQuotes, selectorWithoutDoubleQuotes] = replace(selector, '§', '"', (text, start) => gobbleQuotes(text, '"', start));
    const [singleQuotes, selectorWithoutQuotes] = replace(selectorWithoutDoubleQuotes, '§', "'", (text, start) => gobbleQuotes(text, "'", start));
    // Now that strings are out of the way, extract parens and replace them with parens with whitespace (to preserve offsets)
    const [parens, selectorWithoutParens] = replace(selectorWithoutQuotes, '¶', '(', gobbleParens);
    // Now we have no nested structures and we can parse with regexes
    const tokens = tokenizeBy(selectorWithoutParens);
    // Now restore parens and strings in reverse order
    restoreNested(tokens, parens, /\(¶*\)/, TOKENS_WITH_PARENS);
    restoreNested(tokens, doubleQuotes, /"§*"/, TOKENS_WITH_STRINGS);
    restoreNested(tokens, singleQuotes, /'§*'/, TOKENS_WITH_STRINGS);
    return tokens;
}
// Convert a flat list of tokens into a tree of complex & compound selectors
function nestTokens(tokens, { list = true } = {}) {
    if (list === true && tokens.some((t) => t.type === 'comma')) {
        const selectors = [];
        const temp = [];
        for (let i = 0; i < tokens.length; i += 1) {
            const token = tokens[i];
            if (token.type === 'comma') {
                if (temp.length === 0) {
                    throw new Error('Incorrect comma at ' + i);
                }
                const sub = nestTokens(temp, { list: false });
                if (sub !== undefined) {
                    selectors.push(sub);
                }
                temp.length = 0;
            }
            else {
                temp.push(token);
            }
        }
        if (temp.length === 0) {
            throw new Error('Trailing comma');
        }
        else {
            const sub = nestTokens(temp, { list: false });
            if (sub !== undefined) {
                selectors.push(sub);
            }
        }
        return { type: 'list', list: selectors };
    }
    for (let i = tokens.length - 1; i >= 0; i--) {
        const token = tokens[i];
        if (token.type === 'combinator') {
            const left = nestTokens(tokens.slice(0, i));
            const right = nestTokens(tokens.slice(i + 1));
            if (right === undefined) {
                return undefined;
            }
            if (token.content !== ' ' &&
                token.content !== '~' &&
                token.content !== '+' &&
                token.content !== '>') {
                return undefined;
            }
            return {
                type: 'complex',
                combinator: token.content,
                left,
                right,
            };
        }
    }
    if (tokens.length === 0) {
        return undefined;
    }
    if (types.isAST(tokens)) {
        if (tokens.length === 1) {
            return tokens[0];
        }
        // If we're here, there are no combinators, so it's just a list
        return {
            type: 'compound',
            compound: [...tokens], // clone to avoid pointers messing up the AST
        };
    }
    return undefined;
}
// Traverse an AST (or part thereof), in depth-first order
function walk(node, callback, o, parent) {
    if (node === undefined) {
        return;
    }
    if (node.type === 'complex') {
        walk(node.left, callback, o, node);
        walk(node.right, callback, o, node);
    }
    else if (node.type === 'compound') {
        for (const n of node.compound) {
            walk(n, callback, o, node);
        }
    }
    else if (node.type === 'pseudo-class' &&
        node.subtree !== undefined &&
        o !== undefined &&
        o.type === 'pseudo-class' &&
        o.subtree !== undefined) {
        walk(node.subtree, callback, o, node);
    }
    callback(node, parent);
}
/**
 * Parse a CSS selector
 * @param selector {String} The selector to parse
 * @param options.recursive {Boolean} Whether to parse the arguments of pseudo-classes like :is(), :has() etc. Defaults to true.
 * @param options.list {Boolean} Whether this can be a selector list (A, B, C etc). Defaults to true.
 */
function parse(selector, { recursive = true, list = true } = {}) {
    const tokens = tokenize(selector);
    if (tokens.length === 0) {
        return undefined;
    }
    const ast = nestTokens(tokens, { list });
    if (recursive === true) {
        walk(ast, (node) => {
            if (node.type === 'pseudo-class' &&
                node.argument &&
                node.name !== undefined &&
                RECURSIVE_PSEUDO_CLASSES.has(node.name)) {
                node.subtree = parse(node.argument, { recursive: true, list: true });
            }
        });
    }
    return ast;
}

exports.RECURSIVE_PSEUDO_CLASSES = RECURSIVE_PSEUDO_CLASSES;
exports.gobbleParens = gobbleParens;
exports.gobbleQuotes = gobbleQuotes;
exports.isEscaped = isEscaped;
exports.parse = parse;
exports.replace = replace;
exports.tokenize = tokenize;
//# sourceMappingURL=parse.cjs.map


/***/ }),

/***/ "./node_modules/@cliqz/adblocker-extended-selectors/dist/cjs/src/types.cjs":
/*!*********************************************************************************!*\
  !*** ./node_modules/@cliqz/adblocker-extended-selectors/dist/cjs/src/types.cjs ***!
  \*********************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


/*!
 * Copyright (c) 2017-present Cliqz GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
function isAtoms(tokens) {
    return tokens.every((token) => typeof token !== 'string');
}
function isAST(tokens) {
    return tokens.every((token) => token.type !== 'comma' && token.type !== 'combinator');
}

exports.isAST = isAST;
exports.isAtoms = isAtoms;
//# sourceMappingURL=types.cjs.map


/***/ }),

/***/ "./node_modules/@cliqz/adblocker-webextension-cosmetics/dist/cjs/adblocker.cjs":
/*!*************************************************************************************!*\
  !*** ./node_modules/@cliqz/adblocker-webextension-cosmetics/dist/cjs/adblocker.cjs ***!
  \*************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var adblockerExtendedSelectors = __webpack_require__(/*! @cliqz/adblocker-extended-selectors */ "./node_modules/@cliqz/adblocker-extended-selectors/dist/cjs/adblocker.cjs");
var adblockerContent = __webpack_require__(/*! @cliqz/adblocker-content */ "./node_modules/@cliqz/adblocker-content/dist/cjs/adblocker.cjs");

/*!
 * Copyright (c) 2017-present Cliqz GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
// TODO - move to @cliqz/adblocker-content
let ACTIVE = true;
let DOM_MONITOR = null;
let UPDATE_EXTENDED_TIMEOUT = null;
const PENDING = new Set();
const EXTENDED = [];
const HIDDEN = new Map();
function unload() {
    if (DOM_MONITOR !== null) {
        DOM_MONITOR.stop();
        DOM_MONITOR = null;
    }
}
/**
 * Because all the filters and matching logic lives in the background of the
 * extension, the content script needs a way to request relevant cosmetic
 * filters for each frame. This channel of communication can be handled in
 * several ways (`connect`, `sendMessage`). Here we will make use of
 * `sendMessage` for one-off communications.
 *
 * `getCosmeticsFiltersWithSendMessage` wraps the logic of communicating with
 * the background and will be used to request cosmetics filters for the current
 * frame.
 *
 * The background should listen to these messages and answer back with lists of
 * filters to be injected in the page.
 */
function getCosmeticsFiltersWithSendMessage(arg) {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({
            action: 'getCosmeticsFilters',
            ...arg,
        }, (response) => {
            if (response !== undefined) {
                resolve(response);
            }
        });
    });
}
function cachedQuerySelector(root, selector, cache) {
    var _a;
    // First check if we have a result in cache for this node and selector
    const cachedElements = (_a = cache.get(root)) === null || _a === void 0 ? void 0 : _a.get(selector);
    if (cachedElements !== undefined) {
        return cachedElements;
    }
    const selected = new Set(adblockerExtendedSelectors.querySelectorAll(root, selector.ast));
    // Cache result for next time!
    if (selector.attribute !== undefined) {
        let cachedSelectors = cache.get(root);
        if (cachedSelectors === undefined) {
            cachedSelectors = new Map();
            cache.set(root, cachedSelectors);
        }
        let cachedSelected = cachedSelectors.get(selector);
        if (cachedSelected === undefined) {
            cachedSelected = new Set();
            cachedSelectors.set(selector, cachedSelected);
        }
        for (const element of selected) {
            cachedSelected.add(element);
        }
    }
    return selected;
}
function updateExtended() {
    if (PENDING.size === 0 || EXTENDED.length === 0) {
        return;
    }
    const cache = new Map();
    const elementsToHide = new Map();
    // Since we are processing elements in a delayed fashion, it is possible
    // that some short-lived DOM nodes are already detached. Here we simply
    // ignore them.
    const roots = [...PENDING].filter((e) => e.isConnected === true);
    PENDING.clear();
    for (const root of roots) {
        for (const selector of EXTENDED) {
            for (const element of cachedQuerySelector(root, selector, cache)) {
                if (selector.remove === true) {
                    element.textContent = '';
                    element.remove();
                }
                else if (selector.attribute !== undefined && HIDDEN.has(element) === false) {
                    elementsToHide.set(element, { selector, root });
                }
            }
        }
    }
    // Hide new nodes if any
    for (const [element, { selector, root }] of elementsToHide.entries()) {
        if (selector.attribute !== undefined) {
            element.setAttribute(selector.attribute, '');
            HIDDEN.set(element, { selector, root });
        }
    }
    // Check if some elements should be un-hidden.
    for (const [element, { selector, root }] of [...HIDDEN.entries()]) {
        if (selector.attribute !== undefined) {
            if (root.isConnected === false ||
                element.isConnected === false ||
                cachedQuerySelector(root, selector, cache).has(element) === false) {
                HIDDEN.delete(element);
                element.removeAttribute(selector.attribute);
            }
        }
    }
}
/**
 * Queue `elements` to be processed asynchronously in a batch way (for
 * efficiency). This is important to not do more work than necessary, for
 * example if the same set of nodes is updated multiple times in a raw on
 * user-interaction (e.g. a dropdown); this allows to only check these nodes
 * once, and to not block the UI.
 */
function delayedUpdateExtended(elements) {
    // If we do not have any extended filters applied to this frame, then we do
    // not need to do anything. We just ignore.
    if (EXTENDED.length === 0) {
        return;
    }
    // If root DOM element is already part of PENDING, no need to queue other elements.
    if (PENDING.has(window.document.documentElement)) {
        return;
    }
    // Queue up new elements into the global PENDING set, which will be processed
    // in a batch maner from a setTimeout.
    for (const element of elements) {
        // If we get the DOM root then we can clear everything else from the queue
        // since we will be looking at all nodes anyway.
        if (element === window.document.documentElement) {
            PENDING.clear();
            PENDING.add(element);
            break;
        }
        PENDING.add(element);
    }
    // Check if we need to trigger a setTimeout to process pending elements.
    if (UPDATE_EXTENDED_TIMEOUT === null) {
        UPDATE_EXTENDED_TIMEOUT = setTimeout(() => {
            UPDATE_EXTENDED_TIMEOUT = null;
            updateExtended();
        }, 1000);
    }
}
function handleResponseFromBackground(window, { active, scripts, extended }) {
    if (active === false) {
        ACTIVE = false;
        unload();
        return;
    }
    else {
        ACTIVE = true;
    }
    // Inject scripts
    if (scripts) {
        for (const script of scripts) {
            try {
                adblockerContent.injectScript(script, window.document);
            }
            catch (e) {
                // continue regardless of error
            }
        }
    }
    // Extended CSS
    if (extended && extended.length > 0) {
        EXTENDED.push(...extended);
        delayedUpdateExtended([window.document.documentElement]);
    }
}
/**
 * Takes care of injecting cosmetic filters in a given window. Responsabilities:
 * - Inject scripts.
 * - Block scripts.
 *
 * NOTE: Custom stylesheets are now injected from background.
 *
 * All this happens by communicating with the background through the
 * `backgroundAction` function (to trigger request the sending of new rules
 * based on a domain or node selectors) and the `handleResponseFromBackground`
 * callback to apply new rules.
 */
function injectCosmetics(window, enableMutationObserver = true, getCosmeticsFilters = getCosmeticsFiltersWithSendMessage) {
    // Invoked as soon as content-script is injected to ask for background to
    // inject cosmetics and scripts as soon as possible. Some extra elements
    // might be inserted later whenever we know more about the content of the
    // page.
    getCosmeticsFilters({ lifecycle: 'start', ids: [], classes: [], hrefs: [] }).then((response) => handleResponseFromBackground(window, response));
    // On DOMContentLoaded, start monitoring the DOM. This means that we will
    // first check which ids and classes exist in the DOM as a one-off operation;
    // this will allow the injection of selectors which have a chance to match.
    // We also register a MutationObserver which will monitor the addition of new
    // classes and ids, and might trigger extra filters on a per-need basis.
    window.addEventListener('DOMContentLoaded', () => {
        DOM_MONITOR = new adblockerContent.DOMMonitor((update) => {
            if (update.type === 'elements') {
                if (update.elements.length !== 0) {
                    delayedUpdateExtended(update.elements);
                }
            }
            else {
                getCosmeticsFilters({ ...update, lifecycle: 'dom-update' }).then((response) => handleResponseFromBackground(window, response));
            }
        });
        DOM_MONITOR.queryAll(window);
        // Start observing mutations to detect new ids and classes which would
        // need to be hidden.
        if (ACTIVE && enableMutationObserver) {
            DOM_MONITOR.start(window);
        }
    }, { once: true, passive: true });
    window.addEventListener('pagehide', unload, { once: true, passive: true });
}

exports.injectCosmetics = injectCosmetics;
//# sourceMappingURL=adblocker.cjs.map


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!********************************************************************************************************!*\
  !*** ../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/content-script.bundle.js ***!
  \********************************************************************************************************/


__webpack_require__(/*! ./content-script */ "../../../../../tmp/broccoli-2072qHpeb2ETG4g1/out-40-funnel/modules/core/content-script.js");
})();

/******/ })()
;
//# sourceMappingURL=content-script.bundle.js.map