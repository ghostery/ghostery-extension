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
import scriptlets from '@ghostery/scriptlets';
import { FLAG_SUBFRAME_SCRIPTING } from '@ghostery/config';

import { resolveFlag } from '/store/config.js';
import Options, { getPausedDetails } from '/store/options.js';
import DisabledFilters from '/store/disabled-filters.js';
import FilteringDebug from '/store/filtering-debug.js';

import * as engines from '/utils/engines.js';
import * as OptionsObserver from '/utils/options-observer.js';
import { parseWithCache } from '/utils/request.js';
import { isUserScriptsRegisterSupported } from '/utils/user-scripts.js';

import { tabStats } from '../stats.js';

import { setup } from './engines.js';
import { contentScripts } from './content-scripts.js';
import { FramesHierarchy } from './ancestors.js';

function resolveInjectionTarget(details) {
  const target = { tabId: details.tabId };

  if (__CHROMIUM__ && details.documentId) {
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
  warOrigin: chrome.runtime.getURL('/rule_resources/redirects/empty').slice(0, -6),
};

const USER_SCRIPTS = __CHROMIUM__ && isUserScriptsRegisterSupported();

// Chromium fires onCommitted and onResponseStarted per document; dedup so executeScript runs once.
const injectedDocuments = new Set();

function buildScriptletInjection(filter) {
  const parsed = filter.parseScript();

  if (!parsed) {
    console.warn('[adblocker] could not inject script filter:', filter.toString());
    return null;
  }

  const scriptletName = `${parsed.name}${parsed.name.endsWith('.js') ? '' : '.js'}`;
  const scriptlet = scriptlets[scriptletName];

  if (!scriptlet) {
    console.warn('[adblocker] unknown scriptlet with name:', scriptletName);
    return null;
  }

  return {
    func: scriptlet.func,
    args: [scriptletGlobals, ...parsed.args.map((arg) => decodeURIComponent(arg))],
    world: scriptlet.world === 'ISOLATED' ? 'ISOLATED' : 'MAIN',
  };
}

// Registered rather than executeScript'd so the browser runs them at document_start.
function registerDirectScriptlets(filters, hostname) {
  if (filters.length === 0) {
    contentScripts.unregister(hostname);
    return;
  }

  if (contentScripts.isRegistered(hostname)) return;

  const scriptletsByWorld = { MAIN: '', ISOLATED: '' };
  for (const filter of filters) {
    const injection = buildScriptletInjection(filter);
    if (!injection) continue;

    scriptletsByWorld[injection.world] +=
      `(${injection.func.toString()})(...${JSON.stringify(injection.args)});\n`;
  }

  contentScripts.register(hostname, scriptletsByWorld);
}

// Per-frame injection reaches cross-origin children that a per-hostname registration cannot.
async function executeScriptlets(filters, details) {
  if (filters.length === 0) return;

  const { documentId } = details;
  if (__CHROMIUM__ && documentId) {
    if (injectedDocuments.has(documentId)) return;
    injectedDocuments.add(documentId);
  }

  const results = await Promise.all(
    filters.map((filter) => {
      const injection = buildScriptletInjection(filter);
      if (!injection) return null;

      return chrome.scripting
        .executeScript({
          injectImmediately: true,
          world: injection.world,
          target: resolveInjectionTarget(details),
          func: injection.func,
          args: injection.args,
        })
        .catch((e) => {
          console.warn(e);
          return null;
        });
    }),
  );

  // Nothing landed (e.g. the frame was gone) — release so the other trigger can retry.
  if (__CHROMIUM__ && documentId && !results.some((r) => r?.length)) {
    injectedDocuments.delete(documentId);
  }
}

async function injectScriptlets(filters, hostname, details, scriptletsOnly) {
  if (__FIREFOX__ || USER_SCRIPTS) {
    const directFilters = [];
    const subframeFilters = [];
    for (const filter of filters) {
      (filter.hasSubframeConstraint() ? subframeFilters : directFilters).push(filter);
    }

    registerDirectScriptlets(directFilters, hostname);

    // executeScript needs the committed document; the onBeforeNavigate pass only registers.
    if (scriptletsOnly) return;

    await executeScriptlets(subframeFilters, details);
    return;
  }

  await executeScriptlets(filters, details);
}

function injectStyles(styles, details) {
  chrome.scripting
    .insertCSS({
      css: styles,
      origin: 'USER',
      target: resolveInjectionTarget(details),
    })
    .catch(async (e) => {
      // On Firefox, "Missing host permission for the tab or frames" is produced
      // whenever the target frame is destroyed before the browser completes the
      // CSS injection, regardless of how the injection was triggered.
      if (__FIREFOX__ && e?.message?.startsWith('Missing host permission')) return;

      // Only log a warning if the frame still exists, otherwise it means that
      // the frame is destroyed before the CSS is injected.
      const frame = await chrome.webNavigation
        .getFrame({ tabId: details.tabId, frameId: details.frameId })
        .catch(() => null);

      if (!frame) return;

      // On Chromium, when documentId is used as the injection target, verify the
      // frame's current document matches. If it differs, the frame navigated to a
      // new document after onCommitted fired but before insertCSS ran (benign race).
      if (__CHROMIUM__ && details.documentId && frame.documentId !== details.documentId) return;

      console.warn('[adblocker] failed to inject CSS', e);
    });
}

const SUBFRAME_SCRIPTING = resolveFlag(FLAG_SUBFRAME_SCRIPTING);

// Per-frame subframe injection needs the real ancestor chain on every platform.
const framesHierarchy = new FramesHierarchy();
framesHierarchy.handleWebWorkerStart();
framesHierarchy.handleWebextensionEvents();

/*
 * returns `false` if the injection should be blocked for the given hostname
 * otherwise returns `undefined` and performs necessary preparations for the injection
 * (like registering content scripts for scriptlet filters on Firefox)
 */
async function injectCosmetics(details, config) {
  const { bootstrap: isBootstrap = false, scriptletsOnly } = config;

  try {
    setup.pending && (await setup.pending);
  } catch (e) {
    console.error('[adblocker] not ready for cosmetic injection', e);
    return;
  }

  const { tabId, frameId, parentFrameId, documentId, url } = details;

  const parsed = parseWithCache(url);
  const domain = parsed.domain || '';
  const hostname = parsed.hostname || '';

  if ((__FIREFOX__ || USER_SCRIPTS) && scriptletsOnly && contentScripts.isRegistered(hostname)) {
    return;
  }

  const options = store.get(Options);
  // Checking the request url hostname
  if (getPausedDetails(options, hostname)) {
    return false;
  }

  // Checking the tab hostname to cover local iframes without a proper URL (about:blank, data:, etc.)
  const tabHostname = tabStats.get(tabId)?.hostname;
  if (tabHostname && getPausedDetails(options, tabHostname)) {
    return false;
  }

  const engine = engines.get(engines.MAIN_ENGINE);

  const debug = store.get(FilteringDebug);
  const debugReady = store.ready(debug);
  const cssEnabled = !debugReady || debug.cosmeticsCSS;
  const scriptletsEnabled = !debugReady || debug.cosmeticsScriptlets;
  const extendedCSSEnabled = !debugReady || debug.cosmeticsExtendedCSS;

  let ancestors = undefined;
  if (!scriptletsOnly && SUBFRAME_SCRIPTING.enabled && typeof parentFrameId === 'number') {
    ancestors = framesHierarchy.ancestors(
      { tabId, frameId, parentFrameId, documentId },
      { domain, hostname },
    );
  }

  // Domain specific cosmetic filters (scriptlets and styles)
  // Execution: bootstrap, DOM mutations
  {
    const { matches } = engine.matchCosmeticFilters({
      domain,
      hostname,
      url,
      ancestors,

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

    const disabledFilters = store.get(DisabledFilters);

    for (const { filter, exception } of matches) {
      if (exception !== undefined) continue;
      if (store.ready(disabledFilters) && disabledFilters.ids[filter.getId()]) continue;

      if (filter.isScriptInject()) {
        scriptFilters.push(filter);
      } else {
        styleFilters.push(filter);
      }
    }

    if (isBootstrap) {
      injectScriptlets(scriptletsEnabled ? scriptFilters : [], hostname, details, scriptletsOnly);
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

    if (styles && cssEnabled) {
      injectStyles(styles, details);
    }

    if (extended && extended.length > 0 && extendedCSSEnabled) {
      chrome.tabs
        .sendMessage(tabId, { action: 'evaluateExtendedSelectors', extended }, { frameId })
        // In case the frame is destroyed before the message is delivered, we can get an error
        .catch(() => {});
    }
  }

  // Global cosmetic filters (styles only)
  // Execution: bootstrap
  if (isBootstrap && cssEnabled) {
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
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'injectCosmetics' && sender.tab) {
    // Generate details object for the sender argument

    // Resolve url for the frame/subframe
    // Local frames (about:blank, data:, etc.) do not have a proper URL
    const url = !sender.url.startsWith('http') ? sender.origin : sender.url;

    const details = {
      url,
      tabId: sender.tab.id,
      frameId: sender.frameId,
      documentId: sender.documentId,
    };

    injectCosmetics(details, msg).then(sendResponse);

    return true;
  }
});

if (__FIREFOX__ || USER_SCRIPTS) {
  OptionsObserver.addListener('paused', (paused) => {
    for (const hostname of Object.keys(paused)) {
      contentScripts.unregister(hostname);
    }
  });

  chrome.webNavigation.onBeforeNavigate.addListener(
    (details) => injectCosmetics(details, { bootstrap: true, scriptletsOnly: true }),
    { url: [{ urlPrefix: 'http://' }, { urlPrefix: 'https://' }] },
  );
}

if (__CHROMIUM__) {
  chrome.webRequest?.onResponseStarted.addListener(
    (details) => {
      if (details.tabId === -1) return;
      if (details.type !== 'main_frame' && details.type !== 'sub_frame') return;

      if (!details.documentId) return;

      injectCosmetics(details, { bootstrap: true });
    },
    { urls: ['http://*/*', 'https://*/*'] },
  );

  if (USER_SCRIPTS) {
    // Registrations persist across restarts, so drop stale ones when the engine changes.
    const refresh = () => contentScripts.unregisterAll();
    chrome.runtime.onStartup.addListener(refresh);
    chrome.runtime.onInstalled.addListener(refresh);
    engines.addSaveListener(engines.MAIN_ENGINE, refresh);
  }
}
