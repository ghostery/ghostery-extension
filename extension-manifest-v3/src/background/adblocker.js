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

import { FiltersEngine, Request } from '@cliqz/adblocker';
import {
  fromWebRequestDetails,
  filterRequestHTML,
  updateResponseHeadersWithCSP,
} from '@cliqz/adblocker-webextension';
import { parse } from 'tldts-experimental';

import Options, { observe } from '/store/options.js';
import { setupTabStats, updateTabStats } from './tab-stats';

const adblockerEngines = Object.keys(Options.engines).map((name) => ({
  name,
  engine: null,
  isEnabled: false,
}));
let pausedDomains = [];

let adblockerStartupPromise = (async function () {
  await observe('engines', (engines) => {
    Object.entries(engines).forEach(([key, value]) => {
      const engine = adblockerEngines.find((e) => e.name === key);
      engine.isEnabled = value;
    });
  });
  await observe('paused', (paused) => {
    pausedDomains = paused ? paused.map(String) : [];
  });

  await Promise.all(
    adblockerEngines.map(async (engine) => {
      const response = await fetch(
        chrome.runtime.getURL(`assets/${engine.name}.engine.bytes`),
      );
      const engineBytes = await response.arrayBuffer();
      engine.engine = FiltersEngine.deserialize(new Uint8Array(engineBytes));
    }),
  );
  adblockerStartupPromise = null;
})();

function adblockerInjectStylesWebExtension(
  styles,
  { tabId, frameId, allFrames = false },
) {
  // Abort if stylesheet is empty.
  if (styles.length === 0) {
    return;
  }

  if (chrome.scripting && chrome.scripting.insertCSS) {
    const target = {
      tabId,
    };

    if (frameId) {
      target.frameIds = [frameId];
    } else {
      target.allFrames = allFrames;
    }
    chrome.scripting
      .insertCSS({
        css: styles,
        origin: 'USER',
        target,
      })
      .catch((e) => console.error('Failed to inject CSS', e));
  } else {
    const details = {
      allFrames,
      code: styles,
      cssOrigin: 'user',
      matchAboutBlank: true,
      runAt: 'document_start',
    };
    if (frameId) {
      details.frameId = frameId;
    }
    chrome.tabs
      .insertCSS(tabId, details)
      .catch((e) => console.error('Failed to inject CSS', e));
  }
}

// copied from https://github.com/cliqz-oss/adblocker/blob/0bdff8559f1c19effe278b8982fb8b6c33c9c0ab/packages/adblocker-webextension/adblocker.ts#L297
async function adblockerOnMessage(msg, sender) {
  // Extract hostname from sender's URL
  const { url = '', frameId } = sender;
  const parsed = parse(url);
  const hostname = parsed.hostname || '';
  const domain = parsed.domain || '';

  if (!sender.tab || pausedDomains.includes(domain)) {
    return;
  }

  if (adblockerStartupPromise) {
    await adblockerStartupPromise;
  }

  const genericStyles = [];
  const specificStyles = [];
  let specificFrameId = null;

  adblockerEngines.forEach(({ engine, isEnabled }) => {
    if (!isEnabled) {
      return;
    }

    // Once per tab/page load we inject base stylesheets. These are always
    // the same for all frames of a given page because they do not depend on
    // a particular domain and cannot be cancelled using unhide rules.
    // Because of this, we specify `allFrames: true` when injecting them so
    // that we do not need to perform this operation for sub-frames.
    if (frameId === 0 && msg.lifecycle === 'start') {
      const { active, styles } = engine.getCosmeticsFilters({
        domain,
        hostname,
        url,

        classes: msg.classes,
        hrefs: msg.hrefs,
        ids: msg.ids,

        // This needs to be done only once per tab
        getBaseRules: true,
        getInjectionRules: false,
        getExtendedRules: false,
        getRulesFromDOM: false,
        getRulesFromHostname: false,
      });

      if (active === false) {
        return;
      }

      genericStyles.push(styles);
    }

    // Separately, requests cosmetics which depend on the page it self
    // (either because of the hostname or content of the DOM). Content script
    // logic is responsible for returning information about lists of classes,
    // ids and hrefs observed in the DOM. MutationObserver is also used to
    // make sure we can react to changes.
    {
      const { active, styles } = engine.getCosmeticsFilters({
        domain,
        hostname,
        url,

        classes: msg.classes,
        hrefs: msg.hrefs,
        ids: msg.ids,

        // This needs to be done only once per frame
        getBaseRules: false,
        getInjectionRules: msg.lifecycle === 'start',
        getExtendedRules: msg.lifecycle === 'start',
        getRulesFromHostname: msg.lifecycle === 'start',

        // This will be done every time we get information about DOM mutation
        getRulesFromDOM: msg.lifecycle === 'dom-update',
      });

      if (active === false) {
        return;
      }

      specificStyles.push(styles);
      specificFrameId = frameId;
    }
  });

  if (genericStyles.length > 0) {
    adblockerInjectStylesWebExtension(genericStyles.join('\n'), {
      tabId: sender.tab.id,
      allFrames: true,
    });
  }

  if (specificStyles.length > 0) {
    adblockerInjectStylesWebExtension(specificStyles.join('\n'), {
      tabId: sender.tab.id,
      frameId: specificFrameId,
    });
  }
}

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.action === 'getCosmeticsFilters') {
    adblockerOnMessage(msg, sender).catch((e) =>
      console.error(`Error while processing cosmetics filters: ${e}`),
    );
  }

  return false;
});

const DEBUG_SCRIPLETS = false;
async function executeScriptlets(tabId, scripts) {
  // Dynamically injected scripts can be difficult to find later in
  // the debugger. Console logs simplifies setting up breakpoints if needed.
  let debugMarker;
  if (DEBUG_SCRIPLETS) {
    debugMarker = (text) =>
      `console.log('[ADBLOCKER-DEBUG]:', ${JSON.stringify(text)});`;
  } else {
    debugMarker = () => '';
  }

  // the scriptlet code that contains patches for the website
  const codeRunningInPage = `(function(){
${debugMarker('run scriptlets (executing in "page world")')}
${scripts.join('\n\n')}}
)()`;

  // wrapper to break the "isolated world" so that the patching operates
  // on the website, not on the content script's isolated environment.
  function codeRunningInContentScript(code) {
    var script;
    try {
      script = document.createElement('script');
      script.appendChild(document.createTextNode(decodeURIComponent(code)));
      (document.head || document.documentElement).appendChild(script);
    } catch (ex) {
      console.error('Failed to run script', ex);
    }
    if (script) {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      script.textContent = '';
    }
  }

  chrome.scripting.executeScript(
    {
      injectImmediately: true,
      world: __PLATFORM__ === 'firefox' ? undefined : 'MAIN',
      target: {
        tabId,
        allFrames: true,
      },
      func: codeRunningInContentScript,
      args: [encodeURIComponent(codeRunningInPage)],
    },
    () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      }
    },
  );
}

chrome.webNavigation.onCommitted.addListener(async (details) => {
  const { hostname, domain } = parse(details.url);
  if (!hostname || pausedDomains.includes(domain)) {
    return;
  }

  if (adblockerStartupPromise) {
    await adblockerStartupPromise;
  }

  adblockerEngines.forEach(({ isEnabled, engine }) => {
    if (isEnabled === false) {
      return;
    }

    const { active, scripts } = engine.getCosmeticsFilters({
      url: details.url,
      hostname,
      domain: domain || '',
      getBaseRules: false,
      getInjectionRules: true,
      getExtendedRules: false,
      getRulesFromDOM: false,
      getRulesFromHostname: true,
    });
    if (active === false) {
      return;
    }
    if (scripts.length > 0) {
      executeScriptlets(details.tabId, scripts);
    }
  });
});

if (__PLATFORM__ === 'firefox') {
  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      const isMainFrame = details.type === 'main_frame';
      const sourceUrl = isMainFrame
        ? details.url
        : details.originUrl || details.documentUrl || '';

      const parsedUrl = parse(details.url);
      const parsedSourceUrl = isMainFrame ? parsedUrl : parse(sourceUrl);

      const request = new Request({
        requestId: details.requestId,
        tabId: details.tabId,

        domain: parsedUrl.domain,
        hostname: parsedUrl.hostname,
        url: details.url.toLowerCase(),

        sourceDomain: parsedSourceUrl.domain || '',
        sourceHostname: parsedSourceUrl.hostname || '',
        sourceUrl: sourceUrl.toLowerCase(),

        type: details.type,

        _originalRequestDetails: details,
      });

      // Update stats
      if (details.tabId > -1 && parsedSourceUrl.domain) {
        const tabId = details.tabId;
        const domain = parsedSourceUrl.domain;

        Promise.resolve().then(
          isMainFrame
            ? () => setupTabStats(tabId, domain)
            : () => updateTabStats(tabId, [request]),
        );
      }

      if (pausedDomains.includes(parsedSourceUrl.domain)) {
        return;
      }

      for (const { engine, isEnabled } of adblockerEngines) {
        if (!engine || isEnabled === false) {
          continue;
        }

        if (isMainFrame) {
          const htmlFilters = engine.getHtmlFilters(request);
          if (htmlFilters.length !== 0) {
            filterRequestHTML(
              chrome.webRequest.filterResponseData,
              request,
              htmlFilters,
            );
            return;
          }
        } else {
          const { redirect, match } = engine.match(request);

          if (redirect !== undefined) {
            return { redirectUrl: redirect.dataUrl };
          } else if (match === true) {
            return { cancel: true };
          }
        }
      }
    },
    { urls: ['<all_urls>'] },
    ['blocking'],
  );

  chrome.webRequest.onHeadersReceived.addListener(
    (details) => {
      const request = fromWebRequestDetails(details);
      if (pausedDomains.includes(request.domain)) {
        return {};
      }

      let policies;
      for (const { engine, isEnabled } of adblockerEngines) {
        if (isEnabled) {
          policies = engine.getCSPDirectives(request);
          if (policies !== undefined) {
            break;
          }
        }
      }

      return updateResponseHeadersWithCSP(details, policies);
    },
    { urls: ['<all_urls>'], types: ['main_frame'] },
    ['blocking', 'responseHeaders'],
  );
}
