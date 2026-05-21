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

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createSign } from 'crypto';
import { execFileSync } from 'child_process';

const APP_ID = '6504861501';
const PLATFORMS = ['IOS', 'MAC_OS'];

// App Store Connect states in which a version can still be edited.
const EDITABLE_STATES = new Set([
  'PREPARE_FOR_SUBMISSION',
  'DEVELOPER_REJECTED',
  'REJECTED',
  'METADATA_REJECTED',
  'INVALID_BINARY',
]);

const KEY_ID = process.env.APP_STORE_CONNECT_KEY_ID;
const ISSUER_ID = process.env.APP_STORE_CONNECT_ISSUER_ID;
const PRIVATE_KEY_PATH = process.env.APP_STORE_CONNECT_PRIVATE_KEY_PATH;
let PRIVATE_KEY = process.env.APP_STORE_CONNECT_PRIVATE_KEY;

if (!KEY_ID || !ISSUER_ID) {
  throw new Error('Missing APP_STORE_CONNECT_KEY_ID or APP_STORE_CONNECT_ISSUER_ID env vars');
}

if (!PRIVATE_KEY) {
  if (!PRIVATE_KEY_PATH) {
    throw new Error(
      'Missing APP_STORE_CONNECT_PRIVATE_KEY or APP_STORE_CONNECT_PRIVATE_KEY_PATH env var',
    );
  }
  PRIVATE_KEY = readFileSync(PRIVATE_KEY_PATH, 'utf8');
}

// CI systems often store newlines as literal "\n" — normalize back.
if (PRIVATE_KEY.includes('\\n')) {
  PRIVATE_KEY = PRIVATE_KEY.replace(/\\n/g, '\n');
}

const { version } = JSON.parse(readFileSync(resolve(process.cwd(), './package.json'), 'utf8'));
const tag = `v${version}`;

function signJwt() {
  const header = Buffer.from(JSON.stringify({ alg: 'ES256', kid: KEY_ID, typ: 'JWT' })).toString(
    'base64url',
  );
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({
      iss: ISSUER_ID,
      iat: now,
      exp: now + 20 * 60,
      aud: 'appstoreconnect-v1',
    }),
  ).toString('base64url');
  const signing = `${header}.${payload}`;
  const signer = createSign('SHA256');
  signer.update(signing);
  signer.end();
  // ES256 requires JOSE (r||s) format, not the default DER encoding.
  const signature = signer
    .sign({ key: PRIVATE_KEY, dsaEncoding: 'ieee-p1363' })
    .toString('base64url');
  return `${signing}.${signature}`;
}

const token = signJwt();
const API = 'https://api.appstoreconnect.apple.com';

async function api(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${path} -> ${res.status}: ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

function getReleaseSummary() {
  const body = execFileSync('gh', ['release', 'view', tag, '--json', 'body', '--jq', '.body'], {
    encoding: 'utf8',
  });
  const match = body.match(/##\s*Summary\s*\r?\n([\s\S]*?)(?=\r?\n##\s|$)/i);
  if (!match) {
    throw new Error(`No "## Summary" section found in release ${tag}`);
  }
  const lines = match[1]
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('*') || l.startsWith('-'))
    .map((l) => l.replace(/^[-*]\s*/, '* '));
  if (!lines.length) {
    throw new Error(`Empty "## Summary" section in release ${tag}`);
  }
  return lines.join('\n');
}

async function findOrCreateVersion(platform) {
  const existing = await api(
    'GET',
    `/v1/apps/${APP_ID}/appStoreVersions?filter[versionString]=${encodeURIComponent(version)}&filter[platform]=${platform}`,
  );

  if (existing.data.length === 0) {
    console.log(`  Creating version ${version} for ${platform}...`);
    const created = await api('POST', '/v1/appStoreVersions', {
      data: {
        type: 'appStoreVersions',
        attributes: { platform, versionString: version },
        relationships: {
          app: { data: { type: 'apps', id: APP_ID } },
        },
      },
    });
    return created.data.id;
  }

  const v = existing.data[0];
  const state = v.attributes.appStoreState;
  console.log(`  Found existing version ${version} for ${platform} (${state})`);
  if (!EDITABLE_STATES.has(state)) {
    throw new Error(`Version ${version} for ${platform} is not open for changes (state: ${state})`);
  }
  return v.id;
}

async function updateWhatsNew(versionId, whatsNew) {
  const { data: localizations } = await api(
    'GET',
    `/v1/appStoreVersions/${versionId}/appStoreVersionLocalizations?limit=200`,
  );
  for (const loc of localizations) {
    console.log(`  Updating "What's New" for ${loc.attributes.locale}`);
    await api('PATCH', `/v1/appStoreVersionLocalizations/${loc.id}`, {
      data: {
        type: 'appStoreVersionLocalizations',
        id: loc.id,
        attributes: { whatsNew },
      },
    });
  }
}

async function attachLatestBuild(versionId, platform) {
  const builds = await api(
    'GET',
    `/v1/builds?filter[app]=${APP_ID}&filter[preReleaseVersion.platform]=${platform}&filter[preReleaseVersion.version]=${encodeURIComponent(version)}&sort=-uploadedDate&limit=1`,
  );
  if (builds.data.length === 0) {
    throw new Error(`No TestFlight builds found for ${platform} matching version ${version}`);
  }
  const build = builds.data[0];
  console.log(`  Linking build ${build.attributes.version} (${build.id}) to version ${version}`);
  await api('PATCH', `/v1/appStoreVersions/${versionId}/relationships/build`, {
    data: { type: 'builds', id: build.id },
  });
}

async function submitForReview(versionId, platform) {
  const drafts = await api(
    'GET',
    `/v1/reviewSubmissions?filter[app]=${APP_ID}&filter[platform]=${platform}&filter[state]=READY_FOR_REVIEW`,
  );

  let submissionId;
  let alreadyAdded = false;

  if (drafts.data.length > 0) {
    submissionId = drafts.data[0].id;
    console.log(`  Reusing draft review submission ${submissionId}`);

    const items = await api('GET', `/v1/reviewSubmissions/${submissionId}/items`);
    for (const item of items.data) {
      const itemVersionId = item.relationships?.appStoreVersion?.data?.id;
      if (!itemVersionId) continue;
      if (itemVersionId === versionId) {
        alreadyAdded = true;
      } else {
        throw new Error(
          `Draft review submission ${submissionId} already contains a different appStoreVersion ${itemVersionId}; resolve in App Store Connect first`,
        );
      }
    }
  } else {
    console.log('  Creating review submission...');
    const created = await api('POST', '/v1/reviewSubmissions', {
      data: {
        type: 'reviewSubmissions',
        attributes: { platform },
        relationships: {
          app: { data: { type: 'apps', id: APP_ID } },
        },
      },
    });
    submissionId = created.data.id;
  }

  if (!alreadyAdded) {
    console.log('  Adding version to review submission...');
    await api('POST', '/v1/reviewSubmissionItems', {
      data: {
        type: 'reviewSubmissionItems',
        relationships: {
          reviewSubmission: { data: { type: 'reviewSubmissions', id: submissionId } },
          appStoreVersion: { data: { type: 'appStoreVersions', id: versionId } },
        },
      },
    });
  }

  console.log('  Submitting for review...');
  await api('PATCH', `/v1/reviewSubmissions/${submissionId}`, {
    data: {
      type: 'reviewSubmissions',
      id: submissionId,
      attributes: { submitted: true },
    },
  });
}

const whatsNew = getReleaseSummary();
console.log(`Release notes for ${tag}:`);
console.log(whatsNew);

for (const platform of PLATFORMS) {
  console.log(`\n=== ${platform} ===`);
  const versionId = await findOrCreateVersion(platform);
  await updateWhatsNew(versionId, whatsNew);
  await attachLatestBuild(versionId, platform);
  await submitForReview(versionId, platform);
}

console.log('\nDone.');
