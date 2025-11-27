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
import scriptlets from '@ghostery/scriptlets';

import { resolveFlag } from '/store/config.js';
import Options, { ENGINES, getPausedDetails } from '/store/options.js';

import {
  FLAG_FIREFOX_CONTENT_SCRIPT_SCRIPTLETS,
  FLAG_EXTENDED_SELECTORS,
  FLAG_INJECTION_TARGET_DOCUMENT_ID,
  FLAG_CHROMIUM_INJECT_COSMETICS_ON_RESPONSE_STARTED,
} from '/utils/config-types.js';
import { isWebkit } from '/utils/browser-info.js';
import * as exceptions from '/utils/exceptions.js';
import * as engines from '/utils/engines.js';
import * as trackerdb from '/utils/trackerdb.js';
import * as OptionsObserver from '/utils/options-observer.js';
import Request from '/utils/request.js';
import asyncSetup from '/utils/setup.js';

import { tabStats, updateTabStats } from './stats.js';

let options = Options;

const contentScripts = (() => {
  const map = new Map();
  return {
    async register(hostname, code) {
      this.unregister(hostname);
      try {
        const contentScript = await browser.contentScripts.register({
          js: [
            {
              code,
            },
          ],
          allFrames: true,
          matches: [`https://*.${hostname}/*`, `http://*.${hostname}/*`],
          matchAboutBlank: true,
          matchOriginAsFallback: true,
          runAt: 'document_start',
          world: 'MAIN',
        });
        map.set(hostname, contentScript);
      } catch (e) {
        console.warn(e);
        this.unregister(hostname);
      }
    },
    isRegistered(hostname) {
      return map.has(hostname);
    },
    unregister(hostname) {
      const contentScript = map.get(hostname);
      if (contentScript) {
        contentScript.unregister();
        map.delete(hostname);
      }
    },
    unregisterAll() {
      for (const hostname of map.keys()) {
        this.unregister(hostname);
      }
    },
  };
})();

let FIREFOX_CONTENT_SCRIPT_SCRIPTLETS = { enabled: false };

if (__PLATFORM__ === 'firefox') {
  FIREFOX_CONTENT_SCRIPT_SCRIPTLETS = resolveFlag(
    FLAG_FIREFOX_CONTENT_SCRIPT_SCRIPTLETS,
  );
}

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

    list.push(engines.ELEMENT_PICKER_ENGINE);

    if (config.customFilters.enabled) {
      list.push(engines.CUSTOM_ENGINE);
    }

    return list;
  }

  return [];
}

function pause(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function reloadMainEngine() {
  // Delay the reload to avoid UI freezes in Firefox and Safari
  if (__PLATFORM__ === 'firefox' || isWebkit()) await pause(1000);

  const enabledEngines = getEnabledEngines(options);
  const resolvedEngines = (
    await Promise.all(
      enabledEngines.map((id) =>
        engines
          .init(id)
          .catch(() => {
            console.error(`[adblocker] failed to load engine: ${id}`);
            return null;
          })
          .then((engine) => {
            if (!engine) {
              enabledEngines.splice(enabledEngines.indexOf(id), 1);
            }
            return engine;
          }),
      ),
    )
  ).filter((engine) => engine);

  if (resolvedEngines.length) {
    engines.replace(engines.MAIN_ENGINE, resolvedEngines);

    console.info(
      `[adblocker] Main engine reloaded with: ${enabledEngines.join(', ')}`,
    );
  } else {
    await engines.create(engines.MAIN_ENGINE);
    console.info('[adblocker] Main engine reloaded with no filters');
  }

  if (__PLATFORM__ === 'firefox' && FIREFOX_CONTENT_SCRIPT_SCRIPTLETS.enabled) {
    contentScripts.unregisterAll();
  }
}

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
        enabledEngines.filter(engines.isPersistentEngine).map(async (id) => {
          await engines.init(id);
          updated = (await engines.update(id)) || updated;
        }),
      );

      // Update TrackerDB engine
      trackerdb.setup.pending && (await trackerdb.setup.pending);
      await engines.update(engines.TRACKERDB_ENGINE);

      // Update timestamp after the engines are updated
      await store.set(Options, { filtersUpdatedAt: Date.now() });

      if (updated) await reloadMainEngine();
    }
  } finally {
    updating = false;
  }
}

const HOUR_IN_MS = 60 * 60 * 1000;
export const setup = asyncSetup('adblocker', [
  OptionsObserver.addListener(
    async function adblockerEngines(value, lastValue) {
      options = value;

      const enabledEngines = getEnabledEngines(value);
      const lastEnabledEngines = lastValue && getEnabledEngines(lastValue);

      if (
        // Reload/mismatched main engine
        !(await engines.init(engines.MAIN_ENGINE)) ||
        // Enabled engines changed
        (lastEnabledEngines &&
          (enabledEngines.length !== lastEnabledEngines.length ||
            enabledEngines.some((id, i) => id !== lastEnabledEngines[i])))
      ) {
        await reloadMainEngine();
      }

      // Update engines if filters are outdated (older than 1 hour)
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

const INJECTION_TARGET_DOCUMENT_ID = resolveFlag(
  FLAG_INJECTION_TARGET_DOCUMENT_ID,
);

function resolveInjectionTarget(details) {
  const target = { tabId: details.tabId };

  if (
    __PLATFORM__ !== 'firefox' &&
    INJECTION_TARGET_DOCUMENT_ID.enabled &&
    details.documentId
  ) {
    target.documentIds = [details.documentId];
  } else {
    target.frameIds = [details.frameId];
  }

  return target;
}

const scriptletGlobals = {
  // Request a real extension resource to obtain a dynamic ID to the resource.
  // Redirect resources are defined with `use_dynamic_url` restriction.
  // The dynamic ID is generated per session.
  // refs https://developer.chrome.com/docs/extensions/reference/manifest/web-accessible-resources#manifest_declaration
  warOrigin: chrome.runtime
    .getURL('/rule_resources/redirects/empty')
    .slice(0, -6),
};

function injectScriptlets(filters, hostname, details) {
  let contentScript = '';
  for (const filter of filters) {
    const parsed = filter.parseScript();

    if (!parsed) {
      console.warn(
        '[adblocker] could not inject script filter:',
        filter.toString(),
      );
      continue;
    }

    const scriptletName = `${parsed.name}${parsed.name.endsWith('.js') ? '' : '.js'}`;
    const scriptlet = scriptlets[scriptletName];

    if (!scriptlet) {
      console.warn('[adblocker] unknown scriptlet with name:', scriptletName);
      continue;
    }

    const func = scriptlet.func;
    const args = [
      scriptletGlobals,
      ...parsed.args.map((arg) => decodeURIComponent(arg)),
    ];

    if (
      __PLATFORM__ === 'firefox' &&
      FIREFOX_CONTENT_SCRIPT_SCRIPTLETS.enabled
    ) {
      contentScript += `(${func.toString()})(...${JSON.stringify(args)});\n`;
      continue;
    }

    chrome.scripting.executeScript(
      {
        injectImmediately: true,
        world:
          chrome.scripting.ExecutionWorld?.MAIN ??
          (__PLATFORM__ === 'firefox' ? undefined : 'MAIN'),
        target: resolveInjectionTarget(details),
        func,
        args,
      },
      () => {
        if (chrome.runtime.lastError) {
          console.warn(chrome.runtime.lastError);
        }
      },
    );
  }

  if (__PLATFORM__ === 'firefox' && FIREFOX_CONTENT_SCRIPT_SCRIPTLETS.enabled) {
    if (filters.length === 0) {
      contentScripts.unregister(hostname);
    } else if (!contentScripts.isRegistered(hostname)) {
      contentScripts.register(hostname, contentScript);
    } else {
      // do nothing if already registered
    }
  }
}

function injectStyles(styles, details) {
  chrome.scripting
    .insertCSS({
      css: styles,
      origin: 'USER',
      target: resolveInjectionTarget(details),
    })
    .catch((e) => console.warn('[adblocker] failed to inject CSS', e));
}

const EXTENDED_SELECTORS = resolveFlag(FLAG_EXTENDED_SELECTORS);

async function injectCosmetics(details, config) {
  const { bootstrap: isBootstrap = false, scriptletsOnly } = config;

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

  if (
    __PLATFORM__ === 'firefox' &&
    FIREFOX_CONTENT_SCRIPT_SCRIPTLETS.enabled &&
    scriptletsOnly &&
    contentScripts.isRegistered(hostname)
  ) {
    return;
  }

  if (getPausedDetails(options, hostname)) return;

  const tabHostname = tabStats.get(tabId)?.hostname;
  if (tabHostname && getPausedDetails(options, tabHostname)) {
    return;
  }

  const engine = engines.get(engines.MAIN_ENGINE);

  // Domain specific cosmetic filters (scriptlets and styles)
  // Execution: bootstrap, DOM mutations
  {
    const { matches } = engine.matchCosmeticFilters({
      domain,
      hostname,
      url,

      classes: config.classes,
      hrefs: config.hrefs,
      ids: config.ids,

      // This needs to be done only once per frame
      getInjectionRules: isBootstrap,
      getExtendedRules: isBootstrap,
      getRulesFromHostname: isBootstrap,

      getPureHasRules: true,

      // This will be done every time we get information about DOM mutation
      getRulesFromDOM: !isBootstrap,
      callerContext: { tabId },
    });

    const styleFilters = [];
    const scriptFilters = [];

    for (const { filter, exception } of matches) {
      if (exception === undefined) {
        if (filter.isScriptInject()) {
          scriptFilters.push(filter);
        } else {
          styleFilters.push(filter);
        }
      }
    }

    if (isBootstrap) {
      injectScriptlets(scriptFilters, hostname, details);
    }

    if (scriptletsOnly) {
      return;
    }

    const { styles, extended } = engine.injectCosmeticFilters(styleFilters, {
      url,
      injectScriptlets: isBootstrap,
      injectExtended: isBootstrap,
      injectPureHasSafely: true,
      allowGenericHides: false,
      getBaseRules: false,
    });

    if (styles) {
      injectStyles(styles, details);
    }

    if (EXTENDED_SELECTORS.enabled && extended && extended.length > 0) {
      chrome.tabs.sendMessage(
        tabId,
        { action: 'evaluateExtendedSelectors', extended },
        { frameId },
      );
    }
  }

  // Global cosmetic filters (styles only)
  // Execution: bootstrap
  if (isBootstrap) {
    const { styles } = engine.getCosmeticsFilters({
      domain,
      hostname,
      url,
      getBaseRules: true,
      getInjectionRules: false,
      getExtendedRules: false,
      getRulesFromDOM: false,
      getRulesFromHostname: false,
    });

    injectStyles(styles, details);
  }
}

/*
 * Cosmetic filtering
 */

// Inject cosmetics on navigation committed (All platforms supported)
chrome.webNavigation.onCommitted.addListener(
  (details) => injectCosmetics(details, { bootstrap: true }),
  { url: [{ urlPrefix: 'http://' }, { urlPrefix: 'https://' }] },
);

// Listen for requests from content scripts to inject
// dynamic cosmetics (All platforms supported)
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.action === 'injectCosmetics' && sender.tab) {
    // Generate details object for the sender argument

    // Resolve url for the frame/subframe
    // Local frames (about:blank, data:, etc.) do not have a proper URL
    const url = !sender.url.startsWith('http') ? sender.origin : sender.url;

    const details = {
      url,
      tabId: sender.tab.id,
      frameId: sender.frameId,
    };

    injectCosmetics(details, msg);
  }
});

if (__PLATFORM__ === 'firefox') {
  FIREFOX_CONTENT_SCRIPT_SCRIPTLETS.then((enabled) => {
    if (!enabled) contentScripts.unregisterAll();
  });

  OptionsObserver.addListener(
    'paused',
    function firefoxContentScriptScriptlets(paused) {
      if (!FIREFOX_CONTENT_SCRIPT_SCRIPTLETS.enabled) return;
      for (const hostname of Object.keys(paused)) {
        contentScripts.unregister(hostname);
      }
    },
  );

  chrome.webNavigation.onBeforeNavigate.addListener(
    (details) => {
      if (FIREFOX_CONTENT_SCRIPT_SCRIPTLETS.enabled) {
        injectCosmetics(details, { bootstrap: true, scriptletsOnly: true });
      }
    },
    { url: [{ urlPrefix: 'http://' }, { urlPrefix: 'https://' }] },
  );
} else {
  let INJECT_COSMETICS_ON_RESPONSE_STARTED = resolveFlag(
    FLAG_CHROMIUM_INJECT_COSMETICS_ON_RESPONSE_STARTED,
  );

  chrome.webRequest?.onResponseStarted.addListener(
    (details) => {
      if (!INJECT_COSMETICS_ON_RESPONSE_STARTED.enabled) return;

      if (details.tabId === -1) return;
      if (details.type !== 'main_frame' && details.type !== 'sub_frame') return;

      if (!details.documentId) return;

      injectCosmetics(details, { bootstrap: true });
    },
    { urls: ['http://*/*', 'https://*/*'] },
  );
}

/*
 * Network requests blocking - Firefox only
 */

function isTrusted(request, type) {
  // The request is from a tab that is paused
  if (getPausedDetails(options, request.sourceHostname)) {
    return true;
  }

  if (type === 'main_frame') {
    return false;
  }

  return exceptions.getStatus(
    options,
    // Get exception for known tracker (metadata id) or by the request hostname (unidentified tracker)
    trackerdb.getMetadata(request)?.id || request.hostname,
    request.sourceHostname,
  ).trusted;
}

if (__PLATFORM__ === 'firefox') {
  function isExtensionRequest(details) {
    return (
      (details.tabId === -1 && details.url.startsWith('moz-extension://')) ||
      details.originUrl?.startsWith('moz-extension://')
    );
  }

  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      if (details.type === 'main_frame' || isExtensionRequest(details)) return;

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
          // There's a possibility that redirecting to file URL can expose
          // extension existence.
          if (details.type !== 'xmlhttprequest') {
            result = {
              redirectUrl: chrome.runtime.getURL(
                'rule_resources/redirects/' + redirect.filename,
              ),
            };
          } else {
            result = { redirectUrl: redirect.dataUrl };
          }
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
      if (isExtensionRequest(details)) return;

      if (setup.pending) {
        console.error('[adblocker] not ready for network headers modification');
        return;
      }

      const request = Request.fromRequestDetails(details);

      if (isTrusted(request, details.type)) return;

      const engine = engines.get(engines.MAIN_ENGINE);

      const htmlFilters = engine.getHtmlFilters(request);
      if (htmlFilters.length !== 0) {
        request.modified = true;
        updateTabStats(details.tabId, [request]);
        filterRequestHTML(
          chrome.webRequest.filterResponseData,
          request,
          htmlFilters,
        );
      }

      if (details.type !== 'main_frame') return;
      const cspPolicies = engine.getCSPDirectives(request);
      if (!cspPolicies || cspPolicies.length === 0) return;
      return updateResponseHeadersWithCSP(details, cspPolicies);
    },
    { urls: ['http://*/*', 'https://*/*'] },
    ['blocking', 'responseHeaders'],
  );
}
