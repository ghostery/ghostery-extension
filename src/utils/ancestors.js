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

export const createAncestorsList = () => {
  const tabs = [];

  function findTab(tabId) {
    let tabIndex = tabs.length;
    while (--tabIndex > -1) {
      if (tabs[tabIndex].id === tabId) {
        break;
      }
    }

    return tabIndex;
  }

  function ancestors(tabId, frameId, parentFrameId, details) {
    let tabIndex = findTab(tabId);

    // If the tab is just registered, we can skip retrieving
    // the ancestor chain as there's no details stored.
    if (tabIndex === -1) {
      // Only build the list from the main frame.
      if (parentFrameId === -1) {
        tabIndex = tabs.push({
          id: tabId,
          frames: [{ id: frameId, parent: parentFrameId, details }],
        });
      }
      return [];
    }

    const frames = tabs[tabIndex].frames;
    // The array of details except for the current one.
    const chain = [];

    // `Array.prototype.length` is calculated in every access.
    // If the frame is registered, use the full length but we
    // exclude the current frame in case it is not registered as
    // `chain` won't include the current details.
    let framesLength = frames.length;
    let frameIndex = framesLength;

    while (--frameIndex !== -1) {
      if (frames[frameIndex].id === frameId) {
        break;
      }
    }

    if (frameIndex === -1) {
      framesLength =
        frames.push({
          id: frameId,
          parent: parentFrameId,
          details,
        }) - 1;
    } else {
      // Update the details to the latest reported values.
      frames[frameIndex].details = details;
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
    tabs.splice(tabIndex, 1);

    return [];
  }

  function unregister(tabId, frameId) {
    const tabIndex = findTab(tabId);

    if (tabIndex === -1) {
      return;
    }

    // Drop the full detail in case unregistering the tab.
    if (frameId === 0) {
      tabs.splice(tabIndex, 1);
      return;
    }

    const frames = tabs[tabIndex].frames;
    // Initialise the list of `frameId`s to remove with the
    // current `frameId`.
    const parents = [frameId];

    // `frameIndex` here is meant to be reused.
    let frameIndex = 0;
    while (parents.length) {
      // Pick one `parent` and remove every frames having
      // `parent` as parent frame ID or frame ID.
      const parent = parents.pop();
      for (frameIndex = 0; frameIndex < frames.length; frameIndex++) {
        if (
          frames[frameIndex].parent === parent ||
          frames[frameIndex].id === parent
        ) {
          parents.push(frames[frameIndex].id);
          frames.splice(frameIndex, 1);
        }
      }
    }
  }

  // Update `tabId` per `tabs.onReplaced` events.
  function replace(tabId, newTabId) {
    const tabIndex = findTab(tabId);

    if (tabIndex === -1) {
      return;
    }

    tabs[tabIndex].id = newTabId;
  }

  // Sync using the return value of the browser extension API:
  // `webNavigation.getAllFrames()`. This method expects the list
  // of frames to have `_details` field for the internal use.
  function sync(tabId, frames) {
    const tabIndex = findTab(tabId);
    const newFrameList = frames.map(function (frame) {
      return {
        id: frame.frameId,
        parent: frame.parentFrameId,
        details: frame._details,
      };
    });

    if (tabIndex === -1) {
      tabs.push({
        id: tabId,
        frames: newFrameList,
      });

      return;
    }

    tabs[tabIndex].frames = newFrameList;
  }

  return {
    tabs,
    ancestors,
    unregister,
    replace,
    sync,
  };
};
