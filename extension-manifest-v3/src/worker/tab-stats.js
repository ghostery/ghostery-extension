// This global provides an API like an ES Map but will sync
// with local storage from time to time. That is done to prevent
// loosing all/ stats when the browser terminates the execution
// context (background script or service worker).
const tabStats = (() => {

  class AutoSyncingMap {
    constructor({
      storageKey,
      softFlushIntervalInMs = 200,
      hardFlushIntervalInMs = 1000,
      ttlInMs = 7 * 24 * 60 * 60 * 1000, /* 1 week */
      maxEntries = 5000,
    }) {
      if (!storageKey) {
        throw new Error('Missing storage key');
      }
      this.storageKey = storageKey;
      this.inMemoryMap = new Map();
      this._initialSyncComplete = false;
      this.maxEntries = maxEntries;

      // Make sure old entries that were not cleaned up are eventually
      // removed. Otherwise, we could exceed the local storage quota.
      // Plus, when the maps get big, serializing and deserializing
      // may become expensive. If the actively triggered clean up works,
      // there should be no need to make this expiration too aggressive.
      this.ttlInMs = ttlInMs;
      this._ttlMap = new Map();

      // Flush handling logic: the difference between both limits is that
      // the soft limit does not guarantee that a flush will eventually
      // be performed. After each write operation, it will reset the soft
      // timeout and then flush. Thus, if you keep writing, it will never
      // flush. The hard limit, on the other hand, forces that data gets
      // persisted, but could result in ill-timed write operations.
      //
      // If there are bursts of operations, ideally you want to flush
      // at the end of the burst. The soft limit will result in that,
      // while the hard limit mitigates the risk that the script
      // gets killed before the data gets persisted.
      //
      // Rule of thumbs:
      // * The soft limit should be lower then the hard limit
      // * The hard limit should not be set too high. Remember, it is
      //   the protection against the browser unpredictably killing
      //   the execution.
      this.softFlushIntervalInMs = softFlushIntervalInMs;
      this.hardFlushIntervalInMs = hardFlushIntervalInMs;
      this._scheduledFlush = null;
      this._lastFlush = Date.now();
      this._dirty = false;

      // Assumption: there should be enough time during startup to load
      // the persisted map. Otherwise, the state will be inconsistent
      // whenever the script is loaded (it will eventually become consistent,
      // but that will not help if the browser kills it quickly).
      //
      // (If that assumption does not hold, _warnIfOutOfSync will detect
      // and log it. A potential improvement could be to treat the
      // in-memory map as the source of truth in that scenario.)
      this._pending = new Promise((resolve, reject) => {
        chrome.storage.local.get([this.storageKey], (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            const { entries = {}, ttl = {} } = result[this.storageKey] || {};
            this.inMemoryMap = new Map(Object.entries(entries));
            this._ttlMap = new Map(Object.entries(ttl));
            this._initialSyncComplete = true;
            this.expireOldEntries();
            resolve();
          }
        });
      });
    }

    _warnIfOutOfSync() {
      if (!this._initialSyncComplete) {
        console.warn('AutoSyncingMap: out of sync (loading is too slow...)');
      }
    }

    get(_key) {
      this._warnIfOutOfSync();
      const key = this._normalizeKey(_key);
      console.debug(`AutoSyncingMap: get(${key})`);
      return this.inMemoryMap.get(key);
    }

    set(_key, value) {
      this._warnIfOutOfSync();

      // This should never trigger. Yet if the maps run full (perhaps
      // as a side-effect of a bug), better reset then continuing with
      // these huge maps.
      if (this.inMemoryMap.size >= this.maxEntries || this._ttlMap.size >= this.maxEntries) {
        console.warn('AutoSyncingMap: Maps are running full (maybe you found a bug?). Purging data to prevent performance impacts.');
        this.inMemoryMap.clear();
        this._ttlMap.clear();
      }

      const key = this._normalizeKey(_key);
      console.debug(`AutoSyncingMap: set(${key}, ...)`);
      this.inMemoryMap.set(key, value);
      this._ttlMap.set(key, Date.now() + this.ttlInMs);
      this._markAsDirty();
    }

    delete(_key) {
      this._warnIfOutOfSync();
      const key = this._normalizeKey(_key);
      const wasDeleted = this.inMemoryMap.delete(key);
      if (wasDeleted) {
        this._ttlMap.delete(key);
        this._markAsDirty();
      }
      return wasDeleted;
    }

    clear() {
      this._warnIfOutOfSync();
      this.inMemoryMap.clear();
      this._ttlMap.clear();

      this._scheduleAction(new Promise((resolve, reject) => {
          chrome.storage.local.remove(this.storageKey, () => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve();
            }
          });
      }));
      this._dirty = false;
    }

    expireOldEntries() {
      const now = Date.now();
      let count = 0;
      for (const [key, expireAt] of this._ttlMap.entries()) {
        if (now >= expireAt) {
          this.inMemoryMap.delete(key);
          this._ttlMap.delete(key);
          count += 1;
        }
      }

      if (count > 0) {
        console.log('AutoSyncingMap: expired', count, 'entries.');
        this._markAsDirty();
      }
      return count;
    }

    // Normalize numbers as strings to prevent nasty pitfalls
    // (ES6 maps support numbers, but after serializing and
    // deserializing, we end up with strings and cannot find
    // the "number" key)
    _normalizeKey(key) {
      if (typeof key === 'number') {
        return key.toString();
      }
      if (typeof key === 'string') {
        return key;
      }
      throw new Error(`Unexpected key type (type: ${typeof key}, value: ${key})`);
    }

    _markAsDirty() {
      const now = Date.now();
      if (!this._dirty) {
        this._lastFlush = now;
        this._dirty = true;
      }

      const nextForcedFlush = this._lastFlush + this.hardFlushIntervalInMs;
      clearTimeout(this._scheduledFlush);
      if (now >= nextForcedFlush) {
        this._flush();
        this._scheduledFlush = null;
      } else {
        this._scheduledFlush = setTimeout(() => {
          this._flush();
          this._scheduledFlush = null;
        }, Math.min(this.softFlushIntervalInMs, nextForcedFlush - now));
      }
    }

    _flush() {
      if (!this._dirty) {
        return;
      }

      this._scheduleAction(new Promise((resolve, reject) => {
        if (!this._dirty) {
          resolve();
          return;
        }

        this._dirty = false;
        const serialized = {
          entries: Object.fromEntries(this.inMemoryMap),
          ttl: Object.fromEntries(this._ttlMap),
        };
        chrome.storage.local.set({ [this.storageKey]: serialized }, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            this._lastFlush = Date.now();
            console.debug('AutoSyncingMap: flushed');
            resolve();
          }
        });
      }));
    }

    _scheduleAction(action) {
      const lastSyncPoint = this._pending;
      this._pending = lastSyncPoint.then(action).catch(console.error);
      return this._pending;
    }
  }

  // If you bump this number, the extension will start with a
  // clean state. Normally, this should not be needed.
  const autoSyncVersion = 1;
  const storageKey = `tabStats:v${autoSyncVersion}`;
  return new AutoSyncingMap({ storageKey });
})();
