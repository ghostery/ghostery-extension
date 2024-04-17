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

import {
  filterRequestHTML,
  updateResponseHeadersWithCSP,
} from '@cliqz/adblocker-webextension';
import { parse } from 'tldts-experimental';

import { isCategoryBlockedByDefault } from '/utils/trackerdb.js';
import { observe, ENGINES } from '/store/options.js';
import * as engines from '/utils/engines.js';

import { getException } from './exceptions.js';
import Request from './utils/request.js';
import asyncSetup from './utils/setup.js';

import { updateTabStats } from './stats.js';

let enabledEngines = [];
let pausedDomains = [];

const setup = asyncSetup([
  observe(null, (options) => {
    enabledEngines = [
      // Add custom engine
      engines.CUSTOM_ENGINE,
      engines.FIXES_ENGINE,
      // Set enabled engines
      ...ENGINES.filter(({ key }) => options.terms && options[key]).map(
        ({ name }) => name,
      ),
    ];

    if (
      __PLATFORM__ !== 'firefox' &&
      ENGINES.some(({ key }) => options.terms && options[key])
    ) {
      enabledEngines.push(engines.TRACKERDB_ENGINE);
    }

    // Set paused domains
    pausedDomains = options.paused ? options.paused.map(String) : [];
  }),
  engines.init(engines.CUSTOM_ENGINE),
  engines.init(engines.FIXES_ENGINE),
  ...(__PLATFORM__ !== 'firefox'
    ? [engines.init(engines.TRACKERDB_ENGINE)]
    : []),
  ENGINES.map(({ name }) => engines.init(name)),
]);

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
      .catch((e) => console.warn('Failed to inject CSS', e));
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
      .catch((e) => console.warn('Failed to inject CSS', e));
  }
}

// copied from https://github.com/cliqz-oss/adblocker/blob/0bdff8559f1c19effe278b8982fb8b6c33c9c0ab/packages/adblocker-webextension/adblocker.ts#L297
async function adblockerOnMessage(msg, sender) {
  // Extract hostname from sender's URL
  const { url = '', frameId } = sender;
  const parsed = parse(url);
  const hostname = parsed.hostname || '';
  const domain = parsed.domain || '';

  if (!sender.tab) {
    return;
  }

  try {
    setup.pending && (await setup.pending);
  } catch (e) {
    console.error(`Error while setup adblocker filters: ${e}`);
    return;
  }

  if (pausedDomains.includes(domain) || pausedDomains.includes(hostname)) {
    return;
  }

  const genericStyles = [];
  const specificStyles = [];
  let specificFrameId = null;

  // TODO: add TrackerDB
  enabledEngines.forEach((name) => {
    const engine = engines.get(name);
    if (!engine) return;

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
        console.warn(chrome.runtime.lastError);
      }
    },
  );
}

async function injectScriptlets(tabId, url) {
  const { hostname, domain } = parse(url);
  if (!hostname) {
    return;
  }

  try {
    setup.pending && (await setup.pending);
  } catch (e) {
    console.error(`Error while setup adblocker filters: ${e}`);
    return;
  }

  if (pausedDomains.includes(domain) || pausedDomains.includes(hostname)) {
    return;
  }

  enabledEngines.forEach((name) => {
    const engine = engines.get(name);
    if (!engine) return;

    const { active, scripts } = engine.getCosmeticsFilters({
      url: url,
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
      executeScriptlets(tabId, scripts);
    }
  });
}

if (__PLATFORM__ === 'safari') {
  chrome.runtime.onMessage.addListener((msg, sender) => {
    if (sender.url && msg.action === 'injectScriptlets') {
      injectScriptlets(sender.tab.id, sender.url);
    }

    return false;
  });
} else {
  chrome.webNavigation.onCommitted.addListener(async (details) => {
    injectScriptlets(details.tabId, details.url);
  });
}

function isPaused(request) {
  if (pausedDomains.includes(request.tab.domain || request.tab.hostname)) {
    return true;
  }

  return false;
}

function shouldBlock(request) {
  if (!request.metadata) return undefined;

  const shouldBlockByDefault = isCategoryBlockedByDefault(
    request.metadata.category,
  );

  const exception = getException(request.metadata.id);

  if (!exception) return shouldBlockByDefault;

  if (exception.overwriteStatus) return !shouldBlockByDefault;

  return !(shouldBlockByDefault
    ? exception.allowed.includes(request.tab.domain)
    : exception.blocked.includes(request.tab.domain));
}

if (__PLATFORM__ === 'firefox') {
  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      if (details.tabId < 0) return;

      const request = Request.fromRequestDetails(details);

      // INFO: request.source... is only available in Firefox
      if (request.sourceDomain || request.sourceHostname) {
        if (details.type !== 'main_frame') {
          updateTabStats(details.tabId, [request]);
        }

        const shouldBlockRequest = shouldBlock(request);

        if (shouldBlockRequest === false || isPaused(request)) {
          return;
        }

        const allEngines = request.metadata
          ? [engines.TRACKERDB_ENGINE, ...enabledEngines]
          : enabledEngines;

        for (const name of allEngines) {
          const engine = engines.get(name);
          if (!engine) continue;

          if (details.type === 'main_frame') {
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
              request.blocked = true;
              return { redirectUrl: redirect.dataUrl };
            } else if (match === true) {
              request.blocked = true;
              return { cancel: true };
            }
          }
        }

        if (shouldBlockRequest === true) {
          request.blocked = true;
          return { cancel: true };
        }
      }
    },
    { urls: ['<all_urls>'] },
    ['blocking'],
  );

  chrome.webRequest.onHeadersReceived.addListener(
    (details) => {
      const request = Request.fromRequestDetails(details);
      if (shouldBlock(request) === false || isPaused(request)) {
        return;
      }

      const allEngines = request.metadata
        ? [engines.TRACKERDB_ENGINE, ...enabledEngines]
        : enabledEngines;

      let policies;
      for (const name of allEngines) {
        const engine = engines.get(name);
        if (engine) {
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
