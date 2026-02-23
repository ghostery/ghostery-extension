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
import { evaluatePreprocessor } from '@ghostery/adblocker';

import { ENGINES, isGloballyPaused } from '/store/options.js';
import Resources from '/store/resources.js';

import { FIXES_ID_RANGE, getDynamicRulesIds, filterMaxPriorityRules } from '/utils/dnr.js';
import * as OptionsObserver from '/utils/options-observer.js';
import { ENGINE_CONFIGS_ROOT_URL } from '/utils/urls.js';
import { getBrowser, isMobile } from '/utils/browser-info.js';

import { UPDATE_ENGINES_DELAY } from './adblocker/index.js';
import { updateRedirectProtectionRules } from './redirect-protection.js';

if (__CHROMIUM__) {
  const DNR_METADATA = (function () {
    // We need to depend on `eager` option since dynamic imports
    // are not allowed in web workers scope.
    const modules = import.meta.glob('/rule_resources/*.metadata.json', { eager: true });
    const browser = getBrowser();

    const env = new Map();
    env.set('ext_ghostery', true);
    env.set('ext_ublock', true);
    env.set('ext_ubol', true);
    env.set('env_ghostery', true);
    env.set('env_chromium', browser.name !== 'safari');
    env.set('env_edge', browser.name === 'edge');
    env.set('env_firefox', false);
    env.set('env_mobile', isMobile());
    env.set('env_safari', browser.name === 'safari');
    env.set('env_mv3', true);
    env.set('false', false);
    env.set('cap_html_filtering', false);
    env.set('cap_user_stylesheet', true);
    env.set('adguard', false);
    env.set('adguard_app_android', false);
    env.set('adguard_app_ios', false);
    env.set('adguard_app_mac', false);
    env.set('adguard_app_windows', false);
    env.set('adguard_ext_android_cb', false);
    env.set('adguard_ext_chromium', browser.name !== 'safari');
    env.set('adguard_ext_edge', browser.name === 'edge');
    env.set('adguard_ext_firefox', false);
    env.set('adguard_ext_opera', browser.name === 'opera');
    env.set('adguard_ext_safari', false);

    /**
     * @returns {Record<string, { preprocessor: string; }>}
     */
    function getMetadata(rulesetId) {
      const metadata = modules[`/rule_resources/dnr-${rulesetId}.metadata.json`];
      if (typeof metadata === 'undefined') {
        return;
      }
      return metadata.default;
    }

    /**
     * @param {string} rulesetId
     * @returns {number[]}
     */
    function getDisabledRuleIds(rulesetId) {
      const metadata = getMetadata(rulesetId);
      if (typeof metadata === 'undefined') {
        return [];
      }
      const disabledRuleIds = [];
      for (const [ruleId, constraints] of Object.entries(metadata)) {
        if (!evaluatePreprocessor(constraints.preprocessor, env)) {
          disabledRuleIds.push(Number(ruleId));
        }
      }
      return disabledRuleIds;
    }

    return {
      getDisabledRuleIds,
    };
  })();

  const DNR_RESOURCES = chrome.runtime
    .getManifest()
    .declarative_net_request.rule_resources.filter(({ enabled }) => !enabled)
    .map(({ id }) => id);
  const DNR_FIXES_KEY = 'dnr-fixes';

  function getIds(options) {
    if (!options.terms || isGloballyPaused(options)) return [];

    const ids = ENGINES.reduce((acc, { name, key }) => {
      if (options[key] && DNR_RESOURCES.includes(name)) acc.push(name);
      return acc;
    }, []);

    if (ids.length && options.regionalFilters.enabled) {
      ids.push(
        ...options.regionalFilters.regions
          .map((id) => `lang-${id}`)
          .filter((id) => DNR_RESOURCES.includes(id)),
      );
    }

    // Add redirect protection if enabled and any blocking is active
    if (
      ids.length &&
      options.redirectProtection.enabled &&
      DNR_RESOURCES.includes('redirect-protection')
    ) {
      ids.push('redirect-protection');
    }

    return ids;
  }

  // Ensure that DNR rulesets are equal to those from options.
  // eg. when web extension updates, the rulesets are reset
  // to the value from the manifest.
  OptionsObserver.addListener(async function dnr(options, lastOptions) {
    const ids = getIds(options);

    if (
      lastOptions &&
      lastOptions.filtersUpdatedAt === options.filtersUpdatedAt &&
      lastOptions.fixesFilters === options.fixesFilters &&
      String(ids) === String(getIds(lastOptions))
    ) {
      // No changes in options triggering an update, skip updating rules
      return;
    }

    const enabledRulesetIds = (await chrome.declarativeNetRequest.getEnabledRulesets()) || [];

    // Add latest fixes rules
    const resources = await store.resolve(Resources);

    if (options.fixesFilters && ids.length) {
      if (
        !resources.checksums[DNR_FIXES_KEY] ||
        lastOptions?.filtersUpdatedAt < options.filtersUpdatedAt
      ) {
        const removeRuleIds = await getDynamicRulesIds(FIXES_ID_RANGE);

        try {
          console.info('[dnr] Updating dynamic fixes rules...');

          const list = await fetch(`${ENGINE_CONFIGS_ROOT_URL}/dnr-fixes-v2/allowed-lists.json`, {
            // Force no caching if update was triggered by the user ("Update now" action)
            cache:
              lastOptions && lastOptions.filtersUpdatedAt > Date.now() - UPDATE_ENGINES_DELAY
                ? 'no-store'
                : 'default',
          }).then((res) =>
            res.ok
              ? res.json()
              : Promise.reject(new Error(`Failed to fetch allowed lists: ${res.statusText}`)),
          );

          if (list.dnr.checksum !== resources.checksums[DNR_FIXES_KEY]) {
            const rules = new Set(
              await fetch(list.dnr.url)
                .then((res) =>
                  res.ok
                    ? res.json()
                    : Promise.reject(new Error(`Failed to fetch DNR rules: ${res.statusText}`)),
                )
                .then(filterMaxPriorityRules),
            );

            for (const rule of rules) {
              if (rule.condition.regexFilter) {
                const { isSupported } = await chrome.declarativeNetRequest.isRegexSupported({
                  regex: rule.condition.regexFilter,
                });

                if (!isSupported) {
                  rules.delete(rule);
                }
              }
            }

            await chrome.declarativeNetRequest.updateDynamicRules({
              removeRuleIds: await getDynamicRulesIds(FIXES_ID_RANGE),
              addRules: Array.from(rules).map((rule, index) => ({
                ...rule,
                id: FIXES_ID_RANGE.start + index,
              })),
            });

            console.info('[dnr] Updated dynamic fixes rules:', list.dnr.checksum);
            await store.set(Resources, {
              checksums: { [DNR_FIXES_KEY]: list.dnr.checksum },
            });

            // Reload redirect protection rules to include fixes changes
            await updateRedirectProtectionRules(options);
          }
        } catch (e) {
          console.error('[dnr] Error while updating dynamic fixes rules:', e);

          // If no dynamic rules are applied, it means that initial fetch failed.
          // As a fallback we need to add static fixes rules.
          if (!removeRuleIds.length) {
            console.warn('[dnr] Falling back to static fixes rules');
            ids.push('fixes');

            await store.set(Resources, {
              checksums: { [DNR_FIXES_KEY]: 'filesystem' },
            });
          }
        }
      }
    } else if (resources.checksums[DNR_FIXES_KEY]) {
      // Remove all dynamic fixes rules
      const removeRuleIds = await getDynamicRulesIds(FIXES_ID_RANGE);
      if (removeRuleIds.length) {
        await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds,
        });
        await store.set(resources, {
          checksums: { [DNR_FIXES_KEY]: null },
        });

        console.info('[dnr] Removed dynamic fixes rules');
      }
    }

    const enableRulesetIds = [];
    const disableRulesetIds = [];

    for (const id of ids) {
      if (!enabledRulesetIds.includes(id)) {
        enableRulesetIds.push(id);
      }

      try {
        const disableRuleIds = DNR_METADATA.getDisabledRuleIds(id);
        await chrome.declarativeNetRequest.updateStaticRules({
          rulesetId: id,
          disableRuleIds,
        });
        console.info(
          `[dnr] Disabled rules in static ruleset: ${id}: ${JSON.stringify(disableRuleIds)}`,
        );
      } catch (e) {
        console.error(`[dnr] Failed to apply preprocessors:`, e);
      }
    }

    for (const id of enabledRulesetIds) {
      if (!ids.includes(id)) {
        disableRulesetIds.push(id);
      }
    }

    if (enableRulesetIds.length || disableRulesetIds.length) {
      try {
        await chrome.declarativeNetRequest.updateEnabledRulesets({
          enableRulesetIds,
          disableRulesetIds,
        });
        console.info('[dnr] Updated static rulesets:', ids.length ? ids.join(', ') : 'none');
      } catch (e) {
        console.error(`[dnr] Error while updating static rulesets:`, e);
      }
    }
  });
}
