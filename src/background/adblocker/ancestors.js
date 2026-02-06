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

import { parseWithCache } from '/utils/request';

export class FramesHierarchy {
  /**
   * @type {Array<{ id: number; frames: Array<{ id: number; parent: number; documentId: string; details: unknown }> }>}
   */
  tabs = [];

  #findTab(tabId) {
    return this.tabs.findIndex((tab) => tab.id === tabId);
  }

  ancestors(target, details) {
    let { tabId, frameId, parentFrameId, documentId = '' } = target;
    const tabIndex = this.#findTab(tabId);

    // If the tab is just registered, we can skip retrieving
    // the ancestor chain as there's no details stored.
    if (tabIndex === -1) {
      // Only build the list from the main frame.
      if (parentFrameId === -1) {
        this.tabs.push({
          id: tabId,
          frames: [{ id: frameId, parent: parentFrameId, documentId, details }],
        });
      }
      return [];
    }

    const frames = this.tabs[tabIndex].frames;
    const chain = [];

    // Handle frame updates and replacements
    let frameIndex = frames.length;
    while (--frameIndex >= 0) {
      if (frames[frameIndex].id === frameId) {
        const targetFrame = frames[frameIndex];

        // When the main frame refreshes, unlink subframes
        if (frameId === 0) {
          // Unlink the target frame from the structure
          // temporarily to remove the previous hierarchy.
          targetFrame.id = -1;
          this.unregister(tabId, 0);
          targetFrame.id = 0;
        }

        // Update frame details
        targetFrame.parent = parentFrameId;
        targetFrame.documentId = documentId;
        targetFrame.details = details;
        break;
      } else if (
        documentId.length &&
        frames[frameIndex].documentId === documentId
      ) {
        this.#handleFrameReplacement(
          frames,
          frameIndex,
          frameId,
          parentFrameId,
          details,
          tabId,
        );
        break;
      }
    }

    // If frame not found, add it
    if (frameIndex === -1) {
      frames.push({
        id: frameId,
        parent: parentFrameId,
        documentId,
        details,
      });
    }

    // If no parent, return empty chain
    if (parentFrameId === -1) {
      return [];
    }

    // Build the ancestor chain
    frameIndex = 0;
    while (frameIndex !== -1) {
      frameIndex = frames.length;
      while (--frameIndex >= 0) {
        if (frames[frameIndex].id === parentFrameId) {
          chain.push(frames[frameIndex].details);
          parentFrameId = frames[frameIndex].parent;
          if (parentFrameId === -1) {
            // top-most frame reached
            return chain;
          }
          break;
        }
      }
    }

    // If hierarchy is incomplete, remove the tab
    this.tabs.splice(tabIndex, 1);
    return [];
  }

  #handleFrameReplacement(
    frames,
    frameIndex,
    frameId,
    parentFrameId,
    details,
    tabId,
  ) {
    const targetFrame = frames[frameIndex];
    targetFrame.parent = -1;
    this.unregister(tabId, frameId);

    // We need to update the frame details as it is out of
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
      if (frame.parent === targetFrame.id) {
        frame.parent = frameId;
      }
    }

    // Update the replacing frame details
    targetFrame.id = frameId;
    targetFrame.parent = parentFrameId;
    targetFrame.details = details;
  }

  replace(addedTabId, removedTabId) {
    const tabIndex = this.#findTab(removedTabId);
    if (tabIndex !== -1) {
      this.tabs[tabIndex].id = addedTabId;
    }
  }

  unregister(tabId, frameId) {
    const tabIndex = this.#findTab(tabId);
    if (tabIndex === -1) {
      return;
    }

    const frames = this.tabs[tabIndex].frames;
    const parents = [frameId];

    while (parents.length) {
      const parent = parents.pop();
      let frameIndex = frames.length;
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

    // If no frames left, remove the tab
    if (frames.length === 0) {
      this.tabs.splice(tabIndex, 1);
    }
  }

  // Sync using the return value of the browser extension API:
  // `webNavigation.getAllFrames()`. This method expects the list
  // of frames to have `_details` field for the internal use.
  sync(tabId, frames) {
    const tabIndex = this.#findTab(tabId);
    const newFrameList = frames.map((frame) => ({
      id: frame.frameId,
      parent: frame.parentFrameId,
      documentId: frame.documentId || '',
      details: frame._details,
    }));

    if (tabIndex === -1) {
      this.tabs.push({
        id: tabId,
        frames: newFrameList,
      });
      return;
    }

    this.tabs[tabIndex].frames = newFrameList;
  }

  async #handleTab(tab) {
    if (!tab.id) {
      return;
    }

    let frames;
    try {
      frames = await chrome.webNavigation.getAllFrames({ tabId: tab.id });
    } catch (error) {
      // may happen when we try to query non-existing tab or the tab is inaccessible
      // for prerendering or lacking permission (user might change)
      console.error(
        `Failed to get frames of the tab: tabId="${tab.id}"`,
        error,
      );
      return;
    }

    this.sync(
      tab.id,
      frames.map((frame) => {
        const parsed = parseWithCache(frame.url);
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

  async handleWebWorkerStart() {
    await Promise.all(
      (await chrome.tabs.query({})).map((tab) => this.#handleTab(tab)),
    );
  }

  handleWebextensionEvents(FIREFOX_CONTENT_SCRIPT_SCRIPTLETS) {
    chrome.tabs.onRemoved.addListener((tabId) => {
      if (FIREFOX_CONTENT_SCRIPT_SCRIPTLETS.enabled === false) {
        this.unregister(tabId, 0);
      }
    });
    chrome.tabs.onReplaced.addListener((addedTabId, removedTabId) => {
      if (FIREFOX_CONTENT_SCRIPT_SCRIPTLETS.enabled === false) {
        this.replace(addedTabId, removedTabId);
      }
    });
  }
}
