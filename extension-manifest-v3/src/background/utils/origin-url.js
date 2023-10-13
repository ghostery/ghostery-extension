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

let documentParents = new Map();
let topLevelDocuments = new Map();

async function reset() {
  let documentParents = new Map();
  let topLevelDocuments = new Map();
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    const frames = await chrome.webNavigation.getAllFrames({ tabId: tab.id });
    for (const frame of frames) {
      if (isMainFrame(frame)) {
        topLevelDocuments.set(frame.documentId, frame.url);
      } else if (frame.parentDocumentId && frame.documentId) {
        documentParents.set(frame.documentId, frame.parentDocumentId);
      } else {
        console.error('Not sure what to do with frame', frame);
      }
    }
  }
}

function isMainFrame(details) {
  return details.frameType === 'outermost_frame' && details.frameId === 0;
}

export function getOriginUrl(details) {
  if (details.originUrl) {
    return details.originUrl;
  }
  if (isMainFrame(details)) {
    return details.url;
  }
  if (details.documentId && !details.parentDocumentId) {
    return topLevelDocuments.get(details.documentId);
  }
  let documentId = details.parentDocumentId;
  let topDocumentId = documentId;
  while (documentId) {
    // looking for top most documentId
    documentId = documentParents.get(documentId);
    if (documentId) {
      topDocumentId = documentId;
    }
  }
  return topLevelDocuments.get(topDocumentId);
}

if (__PLATFORM__ !== 'firefox') {
  reset();
  chrome.webNavigation.onCommitted.addListener((details) => {
    console.warn('onCommitted', details);
    if (
      details.frameType === 'outermost_frame' &&
      details.parentFrameId === -1
    ) {
      topLevelDocuments.set(details.documentId, details.url);
    } else if (details.frameType === 'sub_frame') {
      documentParents.set(details.documentId, details.parentDocumentId);
    } else {
      console.warn('XXXX', details);
    }
  });
}
