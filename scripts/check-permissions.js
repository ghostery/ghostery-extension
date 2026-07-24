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

/*
 * Detects manifest permission changes that would require existing users to
 * re-consent after an update.
 *
 * Usage:
 *   node scripts/check-permissions.js
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';

const pwd = process.cwd();

const TARGETS = ['chromium', 'firefox'];

// Chrome/Firefox permissions known to trigger an install-time warning. Adding
// one of these to a published extension disables it until the user re-consents.
// Keep in sync with the permission warnings documented by the browsers:
// https://developer.chrome.com/docs/extensions/reference/permissions-list
// https://extensionworkshop.com/documentation/develop/request-the-right-permissions/
const CONSENT_REQUIRED_PERMISSIONS = new Set([
  'bookmarks',
  'browsingData',
  'clipboardRead',
  'contentSettings',
  'debugger',
  'declarativeNetRequestWithHostAccess',
  'desktopCapture',
  'downloads',
  'geolocation',
  'history',
  'management',
  'nativeMessaging',
  'pageCapture',
  'privacy',
  'proxy',
  'tabCapture',
  'tabs',
  'topSites',
  'webNavigation',
  'webRequestBlocking',
]);

// Host match patterns are treated separately: any newly added host pattern is a
// consent-triggering change unless it is already covered by an existing pattern.
function isHostPattern(value) {
  return (
    value === '<all_urls>' || /^(\*|https?|wss?|file|ftp):\/\//.test(value) || value.includes('://')
  );
}

function readManifest(ref, target) {
  const relPath = `src/manifest.${target}.json`;

  if (ref) {
    // Baseline: read the manifest as it was at the given git ref.
    const raw = execSync(`git show ${ref}:${relPath}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return JSON.parse(raw);
  }

  return JSON.parse(readFileSync(resolve(pwd, relPath), 'utf8'));
}

function getPermissions(manifest) {
  // MV2 (Firefox) lists host patterns inside `permissions`; MV3 (Chromium)
  // splits them into `host_permissions`. Normalize both shapes.
  const all = [...(manifest.permissions || []), ...(manifest.host_permissions || [])];

  const apiPermissions = new Set();
  const hostPermissions = new Set();

  for (const value of all) {
    if (isHostPattern(value)) {
      hostPermissions.add(value);
    } else {
      apiPermissions.add(value);
    }
  }

  return { apiPermissions, hostPermissions };
}

function resolveBaseRef() {
  try {
    execSync('git fetch --tags --quiet', { stdio: 'ignore' });
  } catch {
    // Offline / shallow clone — fall back to local tags.
  }

  const tag = execSync(
    'git tag --sort=-creatordate | grep -E "^v[0-9]+\\.[0-9]+\\.[0-9]+$" | head -n 1',
    { encoding: 'utf8' },
  ).trim();

  if (!tag) {
    throw new Error('Could not determine the last release tag to diff against.');
  }

  return tag;
}

const base = resolveBaseRef();
console.log(`Comparing manifest permissions against ${base}\n`);

const problems = [];

for (const target of TARGETS) {
  let baseManifest;
  try {
    baseManifest = readManifest(base, target);
  } catch {
    console.log(`- ${target}: no baseline manifest at ${base}, skipping`);
    continue;
  }

  const current = getPermissions(readManifest(null, target));
  const baseline = getPermissions(baseManifest);

  const addedApi = [...current.apiPermissions].filter((p) => !baseline.apiPermissions.has(p));
  const addedHosts = [...current.hostPermissions].filter((p) => !baseline.hostPermissions.has(p));

  const consentApi = addedApi.filter((p) => CONSENT_REQUIRED_PERMISSIONS.has(p));
  const reviewApi = addedApi.filter((p) => !CONSENT_REQUIRED_PERMISSIONS.has(p));

  if (reviewApi.length) {
    console.log(`- ${target}: added permissions (no known warning): ${reviewApi.join(', ')}`);
  }

  for (const p of consentApi) {
    problems.push(`${target}: added "${p}" permission requires user consent on update`);
  }
  for (const p of addedHosts) {
    problems.push(`${target}: added "${p}" host permission requires user consent on update`);
  }

  if (!addedApi.length && !addedHosts.length) {
    console.log(`- ${target}: no permission changes`);
  }
}

if (problems.length) {
  console.error('\n✖ Permission changes require existing users to re-consent:\n');
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
  console.error(
    '\nAdding these to a published update disables the extension for all users\n' +
      'until they manually re-approve it. Remove the permission, or if it is\n' +
      'intentional, coordinate a rollout and update this check.',
  );
  process.exit(1);
}

console.log('\n✓ No consent-requiring permission changes detected.');
