/**
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2019 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import { log, alwaysLog } from './common';
import { getChromeStorageUsage } from './utils';

// Chrome has an API to precisely estimate the amount of bytes used by a value
// in chrome.local.storage. But for our purposes, an approximation is sufficient.
// So, we can use an implementation that will work on Firefox, too.
function estimateBytesUsedByValue(value) {
	if (typeof value === 'string' || value instanceof String) {
		return value.length;
	}

	// chrome.storage.local stores JSON representations
	// (pitfall: JSON.stringify(undefined) === undefined)
	return JSON.stringify(value || '').length;
}

function getKey(key) {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get(key, (res) => {
			if (chrome.runtime.lastError) {
				reject(chrome.runtime.lastError);
				return;
			}
			resolve(res[key]);
		});
	});
}

function getAllKeysWithSize() {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get(null, (res) => {
			if (chrome.runtime.lastError) {
				reject(chrome.runtime.lastError);
				return;
			}

			const result = Object.entries(res).map(([key, val]) => {
				const bytesUsed = estimateBytesUsedByValue(val);
				return ({ key, bytesUsed });
			});
			resolve(result);
		});
	});
}

async function getKeysByPrefix(keyPrefix) {
	const mappings = await getAllKeysWithSize();
	return mappings.filter(entry => entry.key.startsWith(keyPrefix));
}

async function getKeysBiggerThen(minSize) {
	const mappings = await getAllKeysWithSize();
	return mappings.filter(entry => entry.bytesUsed >= minSize);
}

async function purgeIfTooBig({ key, maxSize }) {
	try {
		const value = await getKey(key);
		if (value) {
			const usedSize = estimateBytesUsedByValue(value);
			if (usedSize > maxSize) {
				alwaysLog(`purge: ${key} takes ${usedSize} bytes, which exceeds the threshold of ${maxSize} bytes`);
				await new Promise(done => chrome.storage.local.remove(key, done));
			}
		}
	} catch (err) {
		alwaysLog(`Unexpected error when purging ${key} (it is safe to continue)`, err);
	}
}

async function purgeIfTooMany({ keyPrefix, maxElems }) {
	try {
		const matches = await getKeysByPrefix(keyPrefix);
		if (matches.length > maxElems) {
			const keys = matches.map(({ key }) => key);
			await new Promise((resolve, reject) => {
				chrome.storage.local.remove(keys, () => {
					if (chrome.runtime.lastError) {
						reject(chrome.runtime.lastError);
						return;
					}
					alwaysLog(`Successfully cleaned up ${keys.length} entries with prefix "${keyPrefix}"`);
					resolve();
				});
			});
		}
	} catch (err) {
		alwaysLog(`Unexpected error when purging ${keyPrefix} prefixes (it is safe to continue)`, err);
	}
}

/**
 * chrome.storage.local enforces size limits (5 MB on Chrome). Over the years, there is
 * the risk that the extension exceeds that limit:
 * - dead keys: data written by a previous version of the extension
 *   ("purgeObsoleteData" tries to delete the ones that we are aware of, but it might be incomplete)
 * - failure to clean up temporary keys or existing keys take more space over time
 *   (when this happen, it should be considered a bug; but it can be hard to identify
 *    if it grows slowly enough that you notice it only after years, or when it depends
 *    on specific settings, which are not default)
 *
 * Deleting dead keys is always safe, but the challenge is to be aware that keys are dead.
 * At this point, "purgeObsoleteData" has taken care of the dead keys already. What we can
 * try is to run heuristics to recover from emergency situations when there is not enough
 * space left (e.g. by deleting caches).
 */
export default async function freeSpaceIfNearQuota({ force = false } = {}) {
	const MB = 1024 * 1024;
	if (!force) {
		const { bytesInUse, quotaInBytes, usage } = await getChromeStorageUsage({ fastChecksOnly: true });
		if ((bytesInUse > 0 && bytesInUse < 3 * MB) || usage < 0.75) {
			log(`Enough space left (bytesInUse=${bytesInUse}, quotaInBytes=${quotaInBytes}, usage=${usage})`);
			return;
		}
	}
	try {
		// purging caches is an option if they become too big (they will be regenerated)
		await purgeIfTooBig({ key: 'telemetry:bf', maxSize: 1.75 * MB });
		await purgeIfTooBig({ key: 'telemetry:quorumbf', maxSize: 1.5 * MB });
		await purgeIfTooMany({ keyPrefix: 'usafe:', maxElems: 1000 });

		if ((await getChromeStorageUsage()).usage > 0.9) {
			alwaysLog('Entering emergency mode: we are still near the quota. Trying to aggressively clean up space...');

			// Now we are entering dangerous territory. Use the observation that none of the keys in
			// our own production profiles comes near the 1 MB limit (with the exception of caches,
			// but those are safe to remove). So, any huge key that we see has a good chance
			// to be safe to use..
			const protectedKeys = [
				// Be careful never to delete this, or Ghostery will unblock all trackers
				// until the user manually enables them again.
				'selected_app_ids',
			];
			const allBigKeys = await getKeysBiggerThen(1.2 * MB);
			const keysToRemove = allBigKeys.map(({ key }) => key).filter(key => !protectedKeys.includes(key));
			if (keysToRemove.length > 0) {
				alwaysLog('Removing big keys:', keysToRemove);
				await new Promise(resolve => chrome.storage.local.remove(keysToRemove, resolve));
			}

			// Wipe that data structure completely: not because it is taking a lot of space,
			// but there is the possibility that it contains corrupted entries (from old
			// releases). But we should remove this line after a few releases, as it is
			// unlikely to help with the quota. It is rather to eliminate any chance of carrying
			// around corrupted state over the years.
			await purgeIfTooMany({ keyPrefix: 'usafe:', maxElems: 0 });
		}
	} catch (err) {
		alwaysLog('Unexpected error in freeSpaceIfNearQuota (it is safe to continue)', err);
	}
}
