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

import * as engines from '/utils/engines.js';
import * as OptionsObserver from '/utils/options-observer.js';
import { parseWithCache } from '/utils/request.js';

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

function injectScriptlets(filters, hostname, details) {
  let contentScript = '';
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
    const args = [scriptletGlobals, ...parsed.args.map((arg) => decodeURIComponent(arg))];

    if (__FIREFOX__) {
      if (filter.hasSubframeConstraint()) {
        contentScript += `window.parent!==window&&`;
      }
      contentScript += `(${func.toString()})(...${JSON.stringify(args)});\n`;
      continue;
    }

    chrome.scripting.executeScript(
      {
        injectImmediately: true,
        world: chrome.scripting.ExecutionWorld?.MAIN ?? (__FIREFOX__ ? undefined : 'MAIN'),
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

  if (__FIREFOX__) {
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

const SUBFRAME_SCRIPTING = resolveFlag(FLAG_SUBFRAME_SCRIPTING);

let framesHierarchy;
if (__CHROMIUM__) {
  framesHierarchy = new FramesHierarchy();

  framesHierarchy.handleWebWorkerStart();
  framesHierarchy.handleWebextensionEvents();
}

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

  if (__FIREFOX__ && scriptletsOnly && contentScripts.isRegistered(hostname)) {
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

  let ancestors = undefined;
  if (SUBFRAME_SCRIPTING.enabled && typeof parentFrameId === 'number') {
    if (__FIREFOX__) {
      // On Firefox with content scripts API, we need to collect
      // every scriptlets will potentially run on the hostname.
      // Putting same values to `ancestors` enables adblocker to
      // find all possible cases. The subframe constraint is
      // validated by the `window.parent` property upon a script
      // is executed.
      ancestors = [{ domain, hostname }];
    } else {
      ancestors = framesHierarchy.ancestors(
        { tabId, frameId, parentFrameId, documentId },
        { domain, hostname },
      );
    }
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

    if (extended && extended.length > 0) {
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

if (__FIREFOX__) {
  OptionsObserver.addListener('paused', function firefoxContentScriptScriptlets(paused) {
    for (const hostname of Object.keys(paused)) {
      contentScripts.unregister(hostname);
    }
  });

  chrome.webNavigation.onBeforeNavigate.addListener(
    (details) => {
      injectCosmetics(details, { bootstrap: true, scriptletsOnly: true });
    },
    { url: [{ urlPrefix: 'http://' }, { urlPrefix: 'https://' }] },
  );
} else {
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
