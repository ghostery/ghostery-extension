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
} from '@ghostery/adblocker-webextension';
import { parse } from 'tldts-experimental';

import Options, { ENGINES, isPaused } from '/store/options.js';

import * as engines from '/utils/engines.js';
import * as trackerdb from '/utils/trackerdb.js';
import * as OptionsObserver from '/utils/options-observer.js';
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
      await Promise.all(
        enabledEngines
          .filter((id) => id !== engines.CUSTOM_ENGINE)
          .map((id) =>
            engines.update(id).then(
              (v) => {
                updated = updated || v;
              },
              () => {},
            ),
          ),
      );

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
  OptionsObserver.addListener(
    async function adblockerEngines(value, lastValue) {
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
        await updateEngines();
      }
    },
  ),
  OptionsObserver.addListener(
    'experimentalFilters',
    async (value, lastValue) => {
      engines.setEnv('env_experimental', value);

      // Experimental filters changed to enabled
      if (lastValue !== undefined && value) {
        await updateEngines();
      }
    },
  ),
]);

/*
 * Cosmetics injection
 */

async function injectScriptlets(scripts, tabId, frameId) {
  // Dynamically injected scriptlets can be difficult to find later in
  // the debugger. Console logs simplifies setting up breakpoints if needed.
  if (debugMode) {
    scripts = [
      `console.info('[adblocker]', 'running scriptlets (${scripts.length})');`,
      ...scripts,
    ];
  }

  const scriptlets = `(function(){ ${scripts.join('\n\n')}} )();`;

  function scriptletInjector(code) {
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
      world:
        chrome.scripting.ExecutionWorld?.MAIN ??
        (__PLATFORM__ === 'firefox' ? undefined : 'MAIN'),
      target: {
        tabId,
        frameIds: [frameId],
      },
      func: scriptletInjector,
      args: [encodeURIComponent(scriptlets)],
    },
    () => {
      if (chrome.runtime.lastError) {
        console.warn(chrome.runtime.lastError);
      }
    },
  );
}

function injectCSS(styles, tabId, frameId) {
  const target = { tabId };

  if (frameId !== undefined) {
    target.frameIds = [frameId];
  } else {
    target.allFrames = true;
  }

  chrome.scripting
    .insertCSS({
      css: styles,
      origin: 'USER',
      target,
    })
    .catch((e) => console.warn('[adblocker] failed to inject CSS', e));
}

async function injectCosmetics(details, config) {
  try {
    setup.pending && (await setup.pending);
  } catch (e) {
    console.error('[adblocker] not ready for cosmetic injection', e);
    return;
  }

  const { frameId, url, tabId } = details;

  const parsed = parse(url);
  const domain = parsed.domain || '';
  const hostname = parsed.hostname || '';

  if (isPaused(options, hostname)) return;

  const tabHostname = tabStats.get(tabId)?.hostname;
  if (tabHostname && isPaused(options, tabHostname)) {
    return;
  }

  const engine = engines.get(engines.MAIN_ENGINE);
  const isBootstrap = config.bootstrap;

  {
    const cosmetics = engine.getCosmeticsFilters({
      domain,
      hostname,
      url,

      classes: config.classes,
      hrefs: config.hrefs,
      ids: config.ids,

      getBaseRules: false,
      // This needs to be done only once per frame
      getInjectionRules: isBootstrap,
      getExtendedRules: isBootstrap,
      getRulesFromHostname: isBootstrap,

      // This will be done every time we get information about DOM mutation
      getRulesFromDOM: !isBootstrap,
    });

    if (isBootstrap && cosmetics.scripts.length > 0) {
      injectScriptlets(cosmetics.scripts, tabId, frameId);
    }

    if (cosmetics.styles) {
      injectCSS(cosmetics.styles, tabId, frameId);
    }
  }

  if (frameId === 0 && isBootstrap) {
    const { styles } = engine.getCosmeticsFilters({
      domain,
      hostname,
      url,

      // This needs to be done only once per tab
      getBaseRules: true,
      getInjectionRules: false,
      getExtendedRules: false,
      getRulesFromDOM: false,
      getRulesFromHostname: false,
    });

    injectCSS(styles, tabId);
  }
}

chrome.webNavigation.onCommitted.addListener(
  (details) => {
    injectCosmetics(details, { bootstrap: true });
  },
  { url: [{ urlPrefix: 'http://' }, { urlPrefix: 'https://' }] },
);

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.action === 'injectCosmetics' && sender.tab) {
    // Generate details object for the sender argument
    const details = {
      url: sender.url,
      tabId: sender.tab.id,
      frameId: sender.frameId,
    };

    injectCosmetics(details, msg);
  }
});

/*
 * Network requests blocking
 */

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
        console.error('[adblocker] not ready for network requests blocking');
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
      if (details.tabId < 0 || details.type === 'main_frame') return;

      if (setup.pending) {
        console.error('[adblocker] not ready for network headers modification');
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
        request.modified = true;
        updateTabStats(details.tabId, [request]);
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
