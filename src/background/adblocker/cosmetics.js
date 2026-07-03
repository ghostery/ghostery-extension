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
import { FLAG_SUBFRAME_SCRIPTING } from '@ghostery/config';

// Generated at build time (gitignored), see scripts/generate-scriptlets.js.
import scriptlets from './scriptlets.generated.js';

import { resolveFlag } from '/store/config.js';
import Options, { getPausedDetails } from '/store/options.js';
import DisabledFilters from '/store/disabled-filters.js';
import FilteringDebug from '/store/filtering-debug.js';

import * as engines from '/utils/engines.js';
import { parseWithCache } from '/utils/request.js';

import { tabStats } from '../stats.js';

import { setup } from './engines.js';
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

// Handshake secret the wrapped scriptlets pass to the in-document guard. Random
// so a page cannot forge it, per-hostname so it is not a cross-site identifier.
const guardSecrets = new Map();
function getGuardSecret(hostname) {
  let secret = guardSecrets.get(hostname);
  if (!secret) {
    if (guardSecrets.size >= 1000) guardSecrets.clear();
    secret = crypto.randomUUID();
    guardSecrets.set(hostname, secret);
  }
  return secret;
}

function injectScriptlets(filters, hostname, details) {
  for (const filter of filters) {
    const parsed = filter.parseScript();

    if (!parsed) {
      console.warn('[adblocker] could not inject script filter:', filter.toString());
      continue;
    }

    const scriptletName = `${parsed.name}${parsed.name.endsWith('.js') ? '' : '.js'}`;
    const scriptlet = scriptlets[scriptletName];

    if (!scriptlet) {
      console.warn('[adblocker] unknown scriptlet with name:', scriptletName);
      continue;
    }

    const func = scriptlet.func;

    const token = `${scriptletName}\x1f${parsed.args.join('\x1f')}`;
    const args = [
      getGuardSecret(hostname),
      token,
      scriptletGlobals,
      ...parsed.args.map((arg) => decodeURIComponent(arg)),
    ];
    const declaredWorld = scriptlet.world === 'ISOLATED' ? 'ISOLATED' : 'MAIN';

    chrome.scripting.executeScript(
      {
        injectImmediately: true,
        world: declaredWorld,
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

const framesHierarchy = new FramesHierarchy();
framesHierarchy.handleWebWorkerStart();
framesHierarchy.handleWebextensionEvents();

/*
 * returns `false` if the injection should be blocked for the given hostname
 * otherwise returns `undefined` and performs necessary preparations for the injection
 * (like registering content scripts for scriptlet filters on Firefox)
 */
async function injectCosmetics(details, config) {
  const { bootstrap: isBootstrap = false } = config;

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
  if (SUBFRAME_SCRIPTING.enabled && typeof parentFrameId === 'number') {
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
      injectScriptlets(scriptletsEnabled ? scriptFilters : [], hostname, details);
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

if (!__FIREFOX__) {
  chrome.webRequest?.onResponseStarted.addListener(
    (details) => {
      if (details.tabId === -1) return;
      if (details.type !== 'main_frame' && details.type !== 'sub_frame') return;

      if (!details.documentId) return;

      injectCosmetics(details, { bootstrap: true });
    },
    { urls: ['http://*/*', 'https://*/*'] },
  );
}
