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

import "../ui/components/category-bullet.js";
import "../ui/components/panel-header.js";
import "./components/wtm-report.js";

(function updateIframeHeight() {
  let resizes = 0;
  const resizeObserver = new ResizeObserver(() => {
    if (resizes > 0) {
      const height = document.body.clientHeight;
      window.parent.postMessage(`WTMReportResize:${height}`, "*");
    }
    resizes += 1;
  });
  resizeObserver.observe(document.querySelector("wtm-report"), { box: "border-box" });
})();
