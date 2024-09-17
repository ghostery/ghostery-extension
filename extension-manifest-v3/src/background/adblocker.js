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

import { store } from 'hybrids';
import {
  filterRequestHTML,
  updateResponseHeadersWithCSP,
} from '@cliqz/adblocker-webextension';
import { parse } from 'tldts-experimental';

import Options, { observe, ENGINES, isPaused } from '/store/options.js';

import * as engines from '/utils/engines.js';
import * as trackerdb from '/utils/trackerdb.js';
import Request from '/utils/request.js';
import asyncSetup from '/utils/setup.js';
import { debugMode } from '/utils/debug.js';

import { tabStats, updateTabStats } from './stats.js';
import { getException } from './exceptions.js';

let options = Options;

function getEnabledEngines(config) {
  if (config.terms) {
    const list = ENGINES.filter(({ key }) => config[key]).map(
      ({ name }) => name,
    );

    if (config.regionalFilters.enabled) {
      list.push(...config.regionalFilters.regions.map((id) => `lang-${id}`));
    }

    if (list.length) {
      list.push(engines.FIXES_ENGINE);
    }

    if (config.customFilters.enabled) {
      list.push(engines.CUSTOM_ENGINE);
    }

    return list;
  }

  return [];
}

async function reloadMainEngine() {
  const enabledEngines = getEnabledEngines(options);

  if (enabledEngines.length) {
    engines.replace(
      engines.MAIN_ENGINE,
      (
        await Promise.all(
          enabledEngines.map((id) =>
            engines.init(id).catch(() => {
              console.error(`[adblocker] failed to load engine: ${id}`);
              return null;
            }),
          ),
        )
      ).filter((engine) => engine),
    );

    console.info(
      `[adblocker] Main engine reloaded with: ${enabledEngines.join(', ')}`,
    );
  } else {
    engines.create(engines.MAIN_ENGINE);
    console.info('[adblocker] Main engine reloaded with no filters');
  }
}

engines.addChangeListener(engines.CUSTOM_ENGINE, reloadMainEngine);

let updating = false;
async function updateEngines() {
  if (updating) return;

  try {
    updating = true;
    const enabledEngines = getEnabledEngines(options);

    if (enabledEngines.length) {
      let updated = false;
      // Update engines from the list of enabled engines
      for (const id of enabledEngines) {
        if (id === engines.CUSTOM_ENGINE) continue;
        updated = (await engines.update(id).catch(() => false)) || updated;
      }

      // Reload the main engine after all engines are updated
      if (updated) await reloadMainEngine();

      // Update TrackerDB engine
      trackerdb.setup.pending && (await trackerdb.setup.pending);
      await engines.update(engines.TRACKERDB_ENGINE).catch(() => null);

      // Update timestamp after the engines are updated
      await store.set(Options, { filtersUpdatedAt: Date.now() });
    }
  } finally {
    updating = false;
  }
}

const HOUR_IN_MS = 60 * 60 * 1000;
export const setup = asyncSetup([
  observe(async (value, lastValue) => {
    options = value;

    const enabledEngines = getEnabledEngines(value);
    const prevEnabledEngines = lastValue && getEnabledEngines(lastValue);

    if (
      // Reload/mismatched main engine
      !(await engines.init(engines.MAIN_ENGINE)) ||
      // Enabled engines changed
      (prevEnabledEngines &&
        (enabledEngines.length !== prevEnabledEngines.length ||
          enabledEngines.some((id, i) => id !== prevEnabledEngines[i])))
    ) {
      // The regional filters engine is no longer used, so we must remove it
      // from the storage. We do it as rarely as possible, to avoid unnecessary loads.
      // TODO: this can be removed in the future release when most of the users will have
      // the new version of the extension
      engines.remove('regional-filters');

      await reloadMainEngine();
    }

    if (options.filtersUpdatedAt < Date.now() - HOUR_IN_MS) {
      updateEngines();
    }
  }),
  observe('experimentalFilters', async (value, lastValue) => {
    engines.setEnv('env_experimental', value);

    // Experimental filters changed to enabled
    if (lastValue !== undefined && value) updateEngines();
  }),
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
      .catch((e) => console.warn('[adblocker] failed to inject CSS', e));
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
      .catch((e) => console.warn('[adblocker] failed to inject CSS', e));
  }
}

// copied from https://github.com/cliqz-oss/adblocker/blob/0bdff8559f1c19effe278b8982fb8b6c33c9c0ab/packages/adblocker-webextension/adblocker.ts#L297
async function injectCosmetics(msg, sender) {
  try {
    setup.pending && (await setup.pending);
  } catch (e) {
    console.error(`[adblocker] Error while setup cosmetic filters: ${e}`);
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

  const engine = engines.get(engines.MAIN_ENGINE);

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
    injectCosmetics(msg, sender).catch((e) =>
      console.error(
        `[adblocker] Error while processing cosmetics filters: ${e}`,
      ),
    );
  }

  return false;
});

async function executeScriptlets(tabId, scripts) {
  // Dynamically injected scripts can be difficult to find later in
  // the debugger. Console logs simplifies setting up breakpoints if needed.
  let debugMarker;
  if (debugMode) {
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
  try {
    setup.pending && (await setup.pending);
  } catch (e) {
    console.error(`[adblocker] Error while setup adblocker filters: ${e}`);
    return;
  }

  const { hostname, domain } = parse(url);
  if (!hostname || isPaused(options, hostname)) {
    return;
  }

  const tabHostname = tabStats.get(tabId)?.hostname;
  if (tabHostname && isPaused(options, tabHostname)) {
    return;
  }

  const scriptlets = [];
  const engine = engines.get(engines.MAIN_ENGINE);

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

function isTrusted(request, type) {
  // The request is from a tab that is paused
  if (isPaused(options, request.sourceHostname)) {
    return true;
  }

  if (type === 'main_frame') {
    return false;
  }

  const metadata = trackerdb.getMetadata(request);

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
      return true;
    }
  }

  return false;
}

if (__PLATFORM__ === 'firefox') {
  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      if (details.tabId < 0 || details.type === 'main_frame') return;

      if (setup.pending) {
        console.error(
          '[adblocker] Error while processing network request - adblocker not ready yet',
        );
        return;
      }

      const request = Request.fromRequestDetails(details);

      let result = undefined;
      if (request.sourceHostname && !isTrusted(request, details.type)) {
        const engine = engines.get(engines.MAIN_ENGINE);

        const { redirect, match } = engine.match(request);

        if (redirect !== undefined) {
          request.blocked = true;
          result = { redirectUrl: redirect.dataUrl };
        } else if (match === true) {
          request.blocked = true;
          result = { cancel: true };
        }
      }

      updateTabStats(details.tabId, [request]);

      return result;
    },
    { urls: ['<all_urls>'] },
    ['blocking'],
  );

  chrome.webRequest.onHeadersReceived.addListener(
    (details) => {
      if (setup.pending) {
        console.error(
          '[adblocker] Error while processing headers - adblocker not ready yet',
        );
        return;
      }

      const request = Request.fromRequestDetails(details);
      const cspPolicies = [];
      const htmlFilters = [];

      if (!isTrusted(request, details.type)) {
        const engine = engines.get(engines.MAIN_ENGINE);

        htmlFilters.push(...engine.getHtmlFilters(request));

        if (details.type === 'main_frame') {
          const policies = engine.getCSPDirectives(request);
          if (policies !== undefined) {
            cspPolicies.push(...policies);
          }
        }
      }

      if (htmlFilters.length !== 0) {
        filterRequestHTML(
          chrome.webRequest.filterResponseData,
          request,
          htmlFilters,
        );
      }

      if (cspPolicies.length !== 0) {
        return updateResponseHeadersWithCSP(details, cspPolicies);
      }
    },
    { urls: ['http://*/*', 'https://*/*'] },
    ['blocking', 'responseHeaders'],
  );
}
