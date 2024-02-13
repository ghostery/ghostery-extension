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

import { Request } from '@cliqz/adblocker';
import { parse } from 'tldts-experimental';

const PARSE_CACHE_LIMIT = 1000;
const parseCache = new Map();

function parseWithCache(url) {
  if (parseCache.has(url)) {
    return parseCache.get(url);
  }

  if (parseCache.size > PARSE_CACHE_LIMIT) {
    parseCache.clear();
  }

  const parsed = parse(url);
  parseCache.set(url, parsed);

  return parsed;
}

export default class ExtendedRequest extends Request {
  static fromRequestDetails(details) {
    const isMainFrame = details.type === 'main_frame';
    const sourceUrl = isMainFrame
      ? details.url
      : details.originUrl || details.documentUrl || '';

    const parsedUrl = parseWithCache(details.url);
    const parsedSourceUrl = isMainFrame ? parsedUrl : parseWithCache(sourceUrl);

    return new ExtendedRequest({
      requestId: details.requestId,
      tabId: details.tabId,

      domain: parsedUrl.domain || '',
      hostname: parsedUrl.hostname || '',
      url: details.url,

      sourceUrl,
      sourceDomain: parsedSourceUrl.domain || '',
      sourceHostname: parsedSourceUrl.hostname || '',

      type: details.type,

      _originalRequestDetails: details,
    });
  }

  constructor(data) {
    super(data);

    this.requestId = data.requestId;

    this.blocked = false;
    this.modified = false;

    this.sourceUrl = data.sourceUrl;
    this.sourceDomain = data.sourceDomain;
    this.sourceHostname = data.sourceHostname;
  }

  isFromDomain(domain) {
    const { frameAncestors } = this._originalRequestDetails;

    let url = '';

    /* Firefox APIs */
    if (frameAncestors && frameAncestors.length > 0) {
      url = frameAncestors[frameAncestors.length - 1].url;
    } else if (this.sourceUrl) {
      url = this.sourceUrl;
    } else {
      /* Chrome APIs */

      const { frameType, initiator } = this._originalRequestDetails;

      // For frameType 'sub_frame', we can't determine the origin URL
      // as it might be the iframe itself or any of its ancestors
      if (frameType === 'outermost_frame' && initiator) {
        url = initiator;
      }
    }

    if (url) {
      const parsedUrl = parseWithCache(url);
      return parsedUrl.domain === domain || parsedUrl.hostname === domain;
    }

    // As a fallback, we assume that the request is from the origin URL
    return true;
  }
}
