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

import { parse } from 'tldts-experimental';

export class FramesHierarchy {
  /**
   * @type {Array<{ id: number; frames: Array<{ id: number; parent: number; documentId: string; details: unknown }> }>}
   */
  tabs = [];

  // -- Internals
  #findTab(tabId) {
    let tabIndex = this.tabs.length;
    while (--tabIndex > -1) {
      if (this.tabs[tabIndex].id === tabId) {
        break;
      }
    }

    return tabIndex;
  }

  ancestors(target, details) {
    let { tabId, frameId, parentFrameId, documentId = '' } = target;
    let tabIndex = this.#findTab(tabId);

    // If the tab is just registered, we can skip retrieving
    // the ancestor chain as there's no details stored.
    if (tabIndex === -1) {
      // Only build the list from the main frame.
      if (parentFrameId === -1) {
        tabIndex = this.tabs.push({
          id: tabId,
          frames: [{ id: frameId, parent: parentFrameId, documentId, details }],
        });
      }
      return [];
    }

    const frames = this.tabs[tabIndex].frames;
    // The array of details except for the current one.
    const chain = [];

    // `Array.prototype.length` is calculated in every access.
    // If the frame is registered, use the full length but we
    // exclude the current frame in case it is not registered as
    // `chain` won't include the current details.
    let framesLength = frames.length;
    let frameIndex = framesLength;

    if (documentId.length) {
      while (--frameIndex !== -1) {
        if (frames[frameIndex].documentId === documentId) {
          // If we found the frame having same `documentId` and
          // `frameId`, we can safely exit here.
          if (frames[frameIndex].id === frameId) {
            // Update details potentially outdated.
            frames[frameIndex].parent = parentFrameId;
            frames[frameIndex].details = details;

            break;
          }

          // If `frameId` doesn't match, it means the frame is
          // replacing the other frame.
          const targetFrame = frames[frameIndex];

          // First, we need to unregister the obsolete frame and
          // its children. However, we need to unlink the
          // replacing node from the obsolete node by manually
          // changing `parent` value to `-1`. This will prevent
          // `unregister` function to remove the replacing node.
          targetFrame.parent = -1;

          // Now, we call `unregister` and remove the obsolete
          // node.
          this.unregister(tabId, frameId);

          // We need to update the frame details as it's out of
          // sync. We also need to find all direct children and
          // update them. Hopefully, we don't need to update its
          // nested frame ids.
          //
          // > As of Chrome 49, this ID is also constant for the
          // > lifetime of the frame ...
          // > https://developer.chrome.com/docs/extensions/reference/api/webNavigation#frame_ids
          //
          // > As a frame navigates its RenderFrameHost may
          // > change, but its FrameTreeNode stays the same.
          // > https://chromium.googlesource.com/chromium/src/+/refs/heads/lkgr/docs/frame_trees.md#relationships-between-core-classes-in-content
          for (const frame of frames) {
            // Update parent frame ID of every frame pointing to
            // "this frame" (having outdated "parent" frame id).
            if (frame.parent === targetFrame.id) {
              frame.parent = frameId;
            }
          }

          // Update details potentially outdated and link the
          // replacing node again.
          targetFrame.id = frameId;
          targetFrame.parent = parentFrameId;
          targetFrame.details = details;

          break;
        }
      }
    } else {
      while (--frameIndex !== -1) {
        if (frames[frameIndex].id === frameId) {
          // Update details potentially outdated.
          frames[frameIndex].details = details;

          break;
        }
      }
    }

    if (frameIndex === -1) {
      framesLength =
        frames.push({
          id: frameId,
          parent: parentFrameId,
          documentId,
          details,
        }) - 1;
    }

    if (parentFrameId === -1) {
      return [];
    }

    // Loop until it reaches the top-most frame or detects an
    // incomplete hierarchy.
    frameIndex = 0;
    while (frameIndex !== -1) {
      frameIndex = framesLength;

      // Once you find the frame with an id of `parentFrameId`,
      // update `parentFrameId` to the found frame's parent and
      // continue the outer loop.
      while (--frameIndex > -1) {
        if (frames[frameIndex].id === parentFrameId) {
          chain.push(frames[frameIndex].details);
          parentFrameId = frames[frameIndex].parent;

          // If it reached the top-most frame, exit with the
          // result.
          if (parentFrameId === -1) {
            // The adblocker library doesn't care about the order
            // of the entries.
            return chain;
          }

          break;
        }
      }
    }

    // If it ends up detecting an incomplete hierarchy, we drop
    // all the details to prevent further resource use.
    this.tabs.splice(tabIndex, 1);

    return [];
  }

  replace(addedTabId, removedTabId) {
    const tabIndex = this.#findTab(removedTabId);

    if (tabIndex === -1) {
      return;
    }

    this.tabs[tabIndex].id = addedTabId;
  }

  unregister(tabId, frameId) {
    const tabIndex = this.#findTab(tabId);

    if (tabIndex === -1) {
      return;
    }

    const frames = this.tabs[tabIndex].frames;
    // Initialise the list of `frameId`s to remove with the
    // current `frameId`.
    const parents = [frameId];

    // `frameIndex` here is meant to be reused.
    let frameIndex = 0;
    while (parents.length) {
      // Pick one `parent` and remove every frames having
      // `parent` as parent frame ID or frame ID.
      const parent = parents.pop();

      frameIndex = frames.length;
      while (frameIndex--) {
        if (
          frames[frameIndex].parent === parent ||
          frames[frameIndex].id === parent
        ) {
          parents.push(frames[frameIndex].id);
          frames.splice(frameIndex, 1);
        }
      }
    }

    // If there's no more frame, remove the tab.
    if (frames.length === 0) {
      this.tabs.splice(tabIndex, 1);
    }
  }

  // Sync using the return value of the browser extension API:
  // `webNavigation.getAllFrames()`. This method expects the list
  // of frames to have `_details` field for the internal use.
  sync(tabId, frames) {
    const tabIndex = this.#findTab(tabId);
    const newFrameList = frames.map(function (frame) {
      return {
        id: frame.frameId,
        parent: frame.parentFrameId,
        documentId: frame.documentId || '',
        details: frame._details,
      };
    });

    if (tabIndex === -1) {
      this.tabs.push({
        id: tabId,
        frames: newFrameList,
      });

      return;
    }

    this.tabs[tabIndex].frames = newFrameList;
  }

  // -- Handle webextension events.
  async handleWebWorkerStart({ maxRetries = 25 } = {}) {
    const hierarchy = this;

    async function handleTab(tab) {
      if (!tab.id) {
        return;
      }

      // The return type of `frames` is potentially `undefined`.
      const frames = await chrome.webNavigation
        .getAllFrames({ tabId: tab.id })
        .catch(function (error) {
          // The error might happen when we try to query non-
          // existing tab or the tab is inaccessible for
          // prerendering or lacking permission (user might
          // change).
          console.error(
            `Failed to get frames of the tab: tabId="${tab.id}"`,
            error,
          );

          // This will resolve the promise with `undefined`.
          return;
        });

      // This can happen when the tab is in prerendering
      // state, the tab should be handled through
      // `tabs.onReplaced` event listener.
      if (typeof frames === 'undefined') {
        // When the code reaches here, we will let other event
        // listeners to process them. The tab in prerender state
        // will be replaced quick and we don't know if we can
        // catch them fast enough without creating another race-
        // condition even if we query tabs again.
        return;
      }

      hierarchy.sync(
        tab.id,
        frames.map(function (frame) {
          const parsed = parse(frame.url);

          return {
            frameId: frame.frameId,
            parentFrameId: frame.parentFrameId,
            documentId: frame.documentId || '',
            _details: {
              hostname: parsed.hostname || '',
              domain: parsed.domain || '',
            },
          };
        }),
      );
    }

    // Querying tabs with empty object will return all tabs.
    for (let i = 0; i < maxRetries; i++) {
      const tabsOrError = await chrome.tabs.query({}).catch(function (error) {
        return error;
      });

      if (tabsOrError instanceof Error) {
        if (tabsOrError.message.includes('(user may be dragging a tab)')) {
          const delay = Math.log((i + 1) * 500);

          console.warn(
            `Scheduling to query tabs again: delay="${delay}" tries="${i + 1}"`,
            tabsOrError,
          );

          await new Promise(function (resolve) {
            setTimeout(function () {
              resolve();
            }, delay);
          });

          continue;
        }

        console.error(
          `Failed to query tabs too many times! The whole tabs will not be synchronised but we will continue to build the hierarchy with cosmetic filter handlers.`,
          tabsOrError,
        );

        break;
      }

      await Promise.all(
        tabsOrError.map(function (tab) {
          return handleTab(tab);
        }),
      );
    }
  }

  // This section needs to be separated to keep the codepath from
  // testing code clean. Please, keep the event listeners as-is.
  // We don't want to sacrifice the ease of understanding. Also,
  // we need to resolve "flag" which will cause prop drilling.
  handleWebextensionEvents(FIREFOX_CONTENT_SCRIPT_SCRIPTLETS) {
    const hierarchy = this;

    chrome.tabs.onRemoved.addListener(function (tabId) {
      if (FIREFOX_CONTENT_SCRIPT_SCRIPTLETS.enabled === false) {
        hierarchy.unregister(tabId, 0);
      }
    });
    chrome.tabs.onReplaced.addListener(function (addedTabId, removedTabId) {
      if (FIREFOX_CONTENT_SCRIPT_SCRIPTLETS.enabled === false) {
        hierarchy.replace(addedTabId, removedTabId);
      }
    });
  }
}
