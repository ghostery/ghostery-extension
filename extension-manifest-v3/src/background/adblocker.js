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

import { observe, ENGINES, isPaused } from '/store/options.js';

import * as engines from '/utils/engines.js';
import Request from '/utils/request.js';
import asyncSetup from '/utils/setup.js';
import { getMetadata } from '/utils/trackerdb.js';

import { tabStats, updateTabStats } from './stats.js';
import { getException } from './exceptions.js';

let enabledEngines = [];
let options = {};

const regionalFiltersEngine = engines.init(engines.REGIONAL_ENGINE);

const setup = asyncSetup([
  // Init engines
  engines.init(engines.CUSTOM_ENGINE),
  engines.init(engines.FIXES_ENGINE),
  ENGINES.map(({ name }) => engines.init(name)),
  // Regional filters engine is initialized separately for direct access
  regionalFiltersEngine,

  // Update options & enabled engines
  observe((value) => {
    options = value;

    if (options.terms) {
      enabledEngines = [
        // Add custom engine
        engines.CUSTOM_ENGINE,
        engines.FIXES_ENGINE,
        // Main engines
        ...ENGINES.filter(({ key }) => options[key]).map(({ name }) => name),
      ];

      if (options.regionalFilters.enabled) {
        enabledEngines.push(engines.REGIONAL_ENGINE);
      }
    } else {
      enabledEngines = [];
    }
  }),

  // Experimental filters
  observe('experimentalFilters', async (value, lastValue) => {
    engines.setEnv('env_experimental', value);

    // As engines on the server might have new filters, we force the update
    // when value has changed from false to true
    if (lastValue !== undefined && value) {
      engines.updateAll().catch(() => null);
    }
  }),

  // Regional filters
  observe('regionalFilters', async ({ enabled, regions }, lastValue) => {
    const engine = await regionalFiltersEngine;

    if (
      // Pre-requirement for skipping update - engine must be initialized
      // Otherwise it is a very first try to setup the engine
      engine.lists.size &&
      // 1. Background script startup
      (!lastValue ||
        // 2. Exact comparison of the values
        (lastValue.enabled === enabled &&
          lastValue.regions.join() === regions.join()))
    ) {
      return;
    }

    // Clean previous regional engines
    if (lastValue) {
      lastValue.regions
        .filter((id) => !regions.includes(id))
        .forEach((id) => engines.clean(`lang-${id}`));
    }

    // Schedule merge when one of the regional engines is updated
    regions.forEach((id) => {
      engines.addUpdateListener(`lang-${id}`, mergeRegionalEngines);
    });

    if (enabled && regions.length) {
      mergeRegionalEngines(regions);
    } else if (lastValue?.regions.length) {
      engines.clean(engines.REGIONAL_ENGINE);
      console.info('Regional filters: engine disabled');
    }
  }),
]);

async function mergeRegionalEngines(regions) {
  regions = regions || options.regionalFilters?.regions || [];

  engines.replaceEngine(
    engines.REGIONAL_ENGINE,
    await Promise.all(regions.map((id) => engines.init(`lang-${id}`))),
  );

  console.info(
    'Regional filters: engine updated with regions:',
    regions.join(', '),
  );
}

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
      .catch((e) => console.warn('Adblocker: Failed to inject CSS', e));
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
      .catch((e) => console.warn('Adblocker: Failed to inject CSS', e));
  }
}

// copied from https://github.com/cliqz-oss/adblocker/blob/0bdff8559f1c19effe278b8982fb8b6c33c9c0ab/packages/adblocker-webextension/adblocker.ts#L297
async function adblockerOnMessage(msg, sender) {
  try {
    setup.pending && (await setup.pending);
  } catch (e) {
    console.error(`Adblocker: Error while setup cosmetic filters: ${e}`);
    return;
  }

  // Extract hostname from sender's URL
  const { url = '', frameId } = sender;
  const parsed = parse(url);
  const hostname = parsed.hostname || '';
  const domain = parsed.domain || '';

  if (!sender.tab || isPaused(options, hostname)) {
    return;
  }

  const genericStyles = [];
  const specificStyles = [];
  let specificFrameId = null;

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

  const allGenericStyles = genericStyles.join('\n').trim();
  if (allGenericStyles.length > 0) {
    adblockerInjectStylesWebExtension(allGenericStyles, {
      tabId: sender.tab.id,
      allFrames: true,
    });
  }

  const allSpecificStyles = specificStyles.join('\n').trim();
  if (allSpecificStyles.length > 0) {
    adblockerInjectStylesWebExtension(allSpecificStyles, {
      tabId: sender.tab.id,
      frameId: specificFrameId,
    });
  }
}

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.action === 'getCosmeticsFilters') {
    adblockerOnMessage(msg, sender).catch((e) =>
      console.error(
        `Adblocker: Error while processing cosmetics filters: ${e}`,
      ),
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
    let content = decodeURIComponent(code);
    const script = document.createElement('script');
    if (window.trustedTypes) {
      const trustedTypePolicy = window.trustedTypes.createPolicy(
        `ghostery-${Math.round(Math.random() * 1000000)}`,
        {
          createScript: (s) => s,
        },
      );
      content = trustedTypePolicy.createScript(content);
    }
    script.textContent = content;
    (document.head || document.documentElement).appendChild(script);
    script.remove();
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
  if (!hostname || isPaused(options, hostname)) {
    return;
  }

  const tabHostname = tabStats.get(tabId)?.hostname;
  if (tabHostname && isPaused(options, tabHostname)) {
    return;
  }

  try {
    setup.pending && (await setup.pending);
  } catch (e) {
    console.error(`Error while setup adblocker filters: ${e}`);
    return;
  }

  const scriptlets = [];

  enabledEngines.forEach((name) => {
    const engine = engines.get(name);
    if (!engine) return;

    if (name === engines.CUSTOM_ENGINE) {
      try {
        engine.resources = engines.get(engines.FIXES_ENGINE).resources;
      } catch (e) {
        console.warn('Could not share resources with Custom Filters engine', e);
      }
    }

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
      scriptlets.push(...scripts);
    }
  });

  if (scriptlets.length > 0) {
    executeScriptlets(tabId, scriptlets);
  }
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

function resolveEngines(request, type) {
  // The request is from a tab that is paused
  if (isPaused(options, request.sourceHostname)) {
    return [];
  }

  // If the request is a main_frame, we need to return the main engines
  // and not check the exceptions
  if (type === 'main_frame') {
    return enabledEngines;
  }

  const metadata = getMetadata(request);

  // Get exception for known tracker (metadata id) or
  // by the request hostname (unidentified tracker)
  const exception = getException(metadata?.id || request.hostname);

  if (exception) {
    const tabHostname = request.sourceHostname.replace(/^www\./, '');

    // The request is trusted if:
    // - tracker is blocked, but tab hostname is added to trusted domains
    // - tracker is not blocked and tab hostname is not found in the blocked domains
    if (
      exception.blocked
        ? exception.trustedDomains.includes(tabHostname)
        : !exception.blockedDomains.includes(tabHostname)
    ) {
      return [];
    }

    // If the tracker is not blocked by default, but the user has blocked it
    // by the exception (otherwise the function would have returned already)
    // we need to add the TrackerDB engine with filters for that tracker
    if (!metadata.blockedByDefault) {
      return enabledEngines.concat(engines.TRACKERDB_ENGINE);
    }
  }

  // If there is no exception, but tracker is found in theTrackerDB
  // and it is not blocked by default, it means is trusted
  if (metadata && !metadata.blockedByDefault) {
    return [];
  }

  // By default return the main enabled engines
  return enabledEngines;
}

if (__PLATFORM__ === 'firefox') {
  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      if (setup.pending) {
        console.error(
          'Adblocker: Error while processing network request - adblocker not ready yet',
        );
        return;
      }

      if (details.tabId < 0) return;

      const request = Request.fromRequestDetails(details);

      if (request.sourceHostname) {
        let result = undefined;

        for (const name of resolveEngines(request, details.type)) {
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
              result = { redirectUrl: redirect.dataUrl };
              break;
            } else if (match === true) {
              request.blocked = true;
              result = { cancel: true };
            }
          }
        }

        updateTabStats(details.tabId, [request]);
        return result;
      }
    },
    { urls: ['<all_urls>'] },
    ['blocking'],
  );

  chrome.webRequest.onHeadersReceived.addListener(
    (details) => {
      if (setup.pending) {
        console.error(
          'Adblocker: Error while processing headers - adblocker not ready yet',
        );
        return;
      }

      const request = Request.fromRequestDetails(details);
      let policies;

      for (const name of resolveEngines(request, details.type)) {
        const engine = engines.get(name);
        if (!engine) continue;

        policies = engine.getCSPDirectives(request);
        if (policies !== undefined) {
          break;
        }
      }

      if (policies) {
        return updateResponseHeadersWithCSP(details, policies);
      }
    },
    { urls: ['<all_urls>'], types: ['main_frame'] },
    ['blocking', 'responseHeaders'],
  );
}
