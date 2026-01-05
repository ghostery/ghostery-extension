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

  function ancestors(tabId, frameId, parentFrameId, details) {
    // Find the tab.
    let tabIndex = tabs.length;
    while (--tabIndex > -1) {
      if (tabs[tabIndex].id === tabId) {
        break;
      }
    }

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
    const framesLength = frames.find(function (frame) {
      return frame.id === frameId;
    })
      ? frames.length
      : frames.push({
          id: frameId,
          parent: parentFrameId,
          details,
        }) - 1;
    let frameIndex = 0;

    // Loop until it reaches the top-most frame or detects an
    // incomplete hierarchy.
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
            return chain.reverse();
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
    // Find the tab
    let tabIndex = tabs.length;
    while (--tabIndex > -1) {
      if (tabs[tabIndex].id === tabId) {
        break;
      }
    }

    if (tabIndex === -1) {
      return;
    }

    // Drop the full detail in case unregistering the tab.
    if (frameId === 0) {
      tabs.splice(tabIndex, 1);
      return;
    }

    const frames = tabs[tabIndex].frames;
    const parents = [frameId];

    let frameIndex = 0;
    while (parents.length) {
      const parent = parents.shift();
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

  return {
    tabs,
    ancestors,
    unregister,
  };
};
