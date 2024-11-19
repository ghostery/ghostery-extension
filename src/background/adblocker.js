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

import Options, { ENGINES, isPaused } from '/store/options.js';

import * as engines from '/utils/engines.js';
import * as trackerdb from '/utils/trackerdb.js';
import * as OptionsObserver from '/utils/options-observer.js';
import Request from '/utils/request.js';
import asyncSetup from '/utils/setup.js';

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

    // Custom filters should be always added as
    // they have own settings which defines if they are enabled
    list.push(engines.CUSTOM_ENGINE);

    return list;
  }

  return [];
}

function pause(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function reloadMainEngine() {
  // Delay the reload to avoid UI freezes in Firefox and Safari
  if (__PLATFORM__ !== 'chromium') await pause(1000);

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
    await engines.create(engines.MAIN_ENGINE);
    console.info('[adblocker] Main engine reloaded with no filters');
  }
  if (__PLATFORM__ === 'firefox') {
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
        enabledEngines
          .filter((id) => id !== engines.CUSTOM_ENGINE)
          .map(async (id) => {
            await engines.init(id);
            updated = (await engines.update(id)) || updated;
          }),
      );

      // Update TrackerDB engine
      trackerdb.setup.pending && (await trackerdb.setup.pending);
      await engines.update(engines.TRACKERDB_ENGINE);

      // Update timestamp after the engines are updated
      await store.set(Options, { filtersUpdatedAt: Date.now() });

      return updated;
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
      const prevEnabledEngines = lastValue && getEnabledEngines(lastValue);

      if (
        // Reload/mismatched main engine
        !(await engines.init(engines.MAIN_ENGINE)) ||
        // Enabled engines changed
        (prevEnabledEngines &&
          (enabledEngines.length !== prevEnabledEngines.length ||
            enabledEngines.some((id, i) => id !== prevEnabledEngines[i])))
      ) {
        await reloadMainEngine();
      }

      // Update engines if filters are outdated (older than 1 hour)
      // and reload the engine if the update happened to at least one of them
      if (options.filtersUpdatedAt < Date.now() - HOUR_IN_MS) {
        if (await updateEngines()) await reloadMainEngine();
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

function injectScriptlets(filters, tabId, frameId, hostname) {
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
    const func = scriptlet.func;
    const args = parsed.args.map((arg) => decodeURIComponent(arg));

    if (!scriptlet) {
      console.warn('[adblocker] unknown scriptlet with name:', scriptletName);
      continue;
    }

    if (__PLATFORM__ === 'firefox') {
      contentScript += `(function () { ${func.toString()} })(...${JSON.stringify(args)})`
      continue;
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

  if (__PLATFORM__ === 'firefox') {
    if (filters.length === 0) {
      contentScripts.unregister(hostname);
    } else if (!contentScripts.isRegistered(hostname)) {
      contentScripts.register(
        hostname,
        contentScript,
      );
    } else {
      // do nothing if already registered
    }
  }
}

function injectStyles(styles, tabId, frameId) {
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
  const isBootstrap = config.bootstrap;
  const scriptletsOnly = Boolean(config.scriptletsOnly);

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

  if (scriptletsOnly && contentScripts.isRegistered(hostname)) return;

  if (isPaused(options, hostname)) return;

  const tabHostname = tabStats.get(tabId)?.hostname;
  if (tabHostname && isPaused(options, tabHostname)) {
    return;
  }

  const engine = engines.get(engines.MAIN_ENGINE);

  {
    const { matches } = engine.matchCosmeticFilters({
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

      getPureHasRules: true,

      // This will be done every time we get information about DOM mutation
      getRulesFromDOM: !isBootstrap,
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
      injectScriptlets(scriptFilters, tabId, frameId, hostname);
    }

    if (scriptletsOnly) {
      return;
    }

    const { styles } = engine.injectCosmeticFilters(styleFilters, {
      url,
      injectScriptlets: isBootstrap,
      injectExtended: isBootstrap,
      injectPureHasSafely: true,
      allowGenericHides: false,
      getBaseRules: false,
    });

    if (styles) {
      injectStyles(styles, tabId, frameId);
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

    injectStyles(styles, tabId);
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
  chrome.webNavigation.onBeforeNavigate.addListener(
    (details) => {
      injectCosmetics(details, { bootstrap: true, scriptletsOnly: true });
    },
    { url: [{ urlPrefix: 'http://' }, { urlPrefix: 'https://' }] },
  );

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
