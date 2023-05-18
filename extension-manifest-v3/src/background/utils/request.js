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
      url: details.url.toLowerCase(),

      sourceDomain: parsedSourceUrl.domain || '',
      sourceHostname: parsedSourceUrl.hostname || '',
      sourceUrl: sourceUrl.toLowerCase(),

      type: details.type,

      _originalRequestDetails: details,
    });
  }

  constructor(data) {
    super(data);

    this.requestId = data.requestId;
    this.blocked = false;
    this.sourceDomain = data.sourceDomain;
    this.sourceHostname = data.sourceHostname;
  }
}
