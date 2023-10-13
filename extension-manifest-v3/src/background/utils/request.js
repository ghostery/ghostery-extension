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

export default class ExtendedRequest extends Request {
  static fromRequestDetails(details) {
    const isMainFrame = details.type === 'main_frame';
    const sourceUrl = isMainFrame
      ? details.url
      : details.originUrl || details.documentUrl || '';

    const parsedUrl = parse(details.url);
    const parsedSourceUrl = isMainFrame ? parsedUrl : parse(sourceUrl);

    return new ExtendedRequest({
      requestId: details.requestId,
      tabId: details.tabId,

      domain: parsedUrl.domain || '',
      hostname: parsedUrl.hostname || '',
      url: details.url,

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

    this.sourceDomain = data.sourceDomain;
    this.sourceHostname = data.sourceHostname;
  }

  isFromOriginUrl(url) {
    const { frameAncestors } = this._originalRequestDetails;

    /* Firefox APIs */

    if (frameAncestors && frameAncestors.length > 0) {
      return url === frameAncestors[frameAncestors.length - 1].url;
    }

    if (this.sourceUrl) {
      return url === this.sourceUrl;
    }

    /* Chrome APIs */

    const { frameType, initiator } = this._originalRequestDetails;

    // For frameType 'sub_frame', we can't determine the origin URL
    // as it might be the iframe itself or any of its ancestors
    if (frameType === 'outermost_frame' && initiator) {
      return url.startsWith(initiator);
    }

    // As a fallback, we assume that the request is from the origin URL
    return true;
  }
}
