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

import { ENGINES, getPausedDetails } from '/store/options.js';
import Config from '/store/config.js';
import Resources from '/store/resources.js';

import { FLAG_DYNAMIC_DNR_FIXES } from '/utils/config-types.js';
import {
  FIXES_ID_RANGE,
  REDIRECT_PROTECTION_ID_RANGE,
  getDynamicRulesIds,
  applyRedirectProtection,
  createRedirectProtectionExceptionRules,
} from '/utils/dnr.js';
import * as OptionsObserver from '/utils/options-observer.js';
import { ENGINE_CONFIGS_ROOT_URL } from '/utils/urls.js';

if (__PLATFORM__ !== 'firefox') {
  const DNR_RESOURCES = chrome.runtime
    .getManifest()
    .declarative_net_request.rule_resources.filter(({ enabled }) => !enabled)
    .map(({ id }) => id);

  function getIds(options) {
    if (!options.terms || getPausedDetails(options)) return [];

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
      options.redirectProtection?.enabled &&
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

    const hasChanges =
      !lastOptions ||
      lastOptions.filtersUpdatedAt !== options.filtersUpdatedAt ||
      String(ids) !== String(getIds(lastOptions)) ||
      JSON.stringify(options.redirectProtection?.disabled || []) !==
        JSON.stringify(lastOptions.redirectProtection?.disabled || []);

    if (!hasChanges) {
      return;
    }

    const enabledRulesetIds =
      (await chrome.declarativeNetRequest.getEnabledRulesets()) || [];

    const config = await store.resolve(Config);

    if (config.hasFlag(FLAG_DYNAMIC_DNR_FIXES)) {
      const DNR_FIXES_KEY = 'dnr-fixes';
      const resources = await store.resolve(Resources);

      if (ids.length) {
        if (
          !resources.checksums[DNR_FIXES_KEY] ||
          lastOptions?.filtersUpdatedAt < options.filtersUpdatedAt
        ) {
          const removeRuleIds = await getDynamicRulesIds(FIXES_ID_RANGE);

          try {
            console.info('[dnr] Updating dynamic fixes rules...');

            const list = await fetch(
              `${ENGINE_CONFIGS_ROOT_URL}/dnr-fixes-v2/allowed-lists.json`,
            ).then((res) =>
              res.ok
                ? res.json()
                : Promise.reject(
                    new Error(
                      `Failed to fetch allowed lists: ${res.statusText}`,
                    ),
                  ),
            );

            if (list.dnr.checksum !== resources.checksums['dnr-fixes']) {
              const MAX_PRIORITY = 1073741823;
              const fetchedRules = await fetch(list.dnr.url).then((res) =>
                res.ok
                  ? res.json()
                  : Promise.reject(
                      new Error(`Failed to fetch DNR rules: ${res.statusText}`),
                    ),
              );

              // Filter out max priority rules that would bypass redirect protection
              const rules = new Set(
                fetchedRules.filter((rule) => rule.priority !== MAX_PRIORITY),
              );

              const removedMaxPriorityCount = fetchedRules.length - rules.size;
              if (removedMaxPriorityCount > 0) {
                console.info(
                  `[dnr] Filtered out ${removedMaxPriorityCount} max priority rule(s) from dnr-fixes`,
                );
              }

              for (const rule of rules) {
                if (rule.condition.regexFilter) {
                  const { isSupported } =
                    await chrome.declarativeNetRequest.isRegexSupported({
                      regex: rule.condition.regexFilter,
                    });

                  if (!isSupported) {
                    rules.delete(rule);
                  }
                }
              }

              // Apply redirect protection to dynamic fixes
              const rulesArray = Array.from(rules);
              const rulesWithRedirects = applyRedirectProtection(rulesArray, {
                enabled: options.redirectProtection?.enabled,
                priority: 100,
              });

              await chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: await getDynamicRulesIds(FIXES_ID_RANGE),
                addRules: rulesWithRedirects.map((rule, index) => ({
                  ...rule,
                  id: FIXES_ID_RANGE.start + index,
                })),
              });

              console.info(
                '[dnr] Updated dynamic fixes rules:',
                list.dnr.checksum,
              );
              await store.set(resources, {
                checksums: { [DNR_FIXES_KEY]: list.dnr.checksum },
              });
            }
          } catch (e) {
            console.error('[dnr] Error while updating dynamic fixes rules:', e);

            // If no dynamic rules are applied, it means that initial fetch failed.
            // As a fallback we need to add static fixes rules.
            if (!removeRuleIds.length) {
              console.warn('[dnr] Falling back to static fixes rules');
              ids.push('fixes');

              await store.set(resources, {
                checksums: { [DNR_FIXES_KEY]: 'filesystem' },
              });
            }
          }
        }
      } else if (resources.checksums[DNR_FIXES_KEY]) {
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
    } else if (ids.length) {
      ids.push('fixes');
    }

    if (
      ids.includes('redirect-protection') &&
      options.redirectProtection?.enabled
    ) {
      const disabledDomains = options.redirectProtection.disabled || [];
      const lastDisabledDomains =
        lastOptions?.redirectProtection?.disabled || [];

      const disabledDomainsChanged =
        !lastOptions ||
        JSON.stringify(disabledDomains.sort()) !==
          JSON.stringify(lastDisabledDomains.sort());

      if (disabledDomainsChanged) {
        try {
          const removeRuleIds = await getDynamicRulesIds(
            REDIRECT_PROTECTION_ID_RANGE,
          );

          const addRules = createRedirectProtectionExceptionRules(
            disabledDomains,
            REDIRECT_PROTECTION_ID_RANGE.start,
          );

          await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds,
            addRules,
          });
        } catch (e) {
          console.error(
            '[dnr] Error while updating redirect protection exceptions:',
            e,
          );
        }
      }
    } else {
      const removeRuleIds = await getDynamicRulesIds(
        REDIRECT_PROTECTION_ID_RANGE,
      );
      if (removeRuleIds.length) {
        await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds,
        });
      }
    }

    const enableRulesetIds = [];
    const disableRulesetIds = [];

    for (const id of ids) {
      if (!enabledRulesetIds.includes(id)) {
        enableRulesetIds.push(id);
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
        console.info(
          '[dnr] Updated static rulesets:',
          ids.length ? ids.join(', ') : 'none',
        );
      } catch (e) {
        console.error(`[dnr] Error while updating static rulesets:`, e);
      }
    }
  });
}
