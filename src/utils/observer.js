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
import Options from '/store/options.js';

function isOptionEqual(a, b) {
  if (typeof b !== 'object' || b === null) return a === b;

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  return (
    aKeys.length === bKeys.length &&
    aKeys.every((key) => isOptionEqual(a[key], b[key]))
  );
}

const observers = new Set();
let setup = null;

export function addListener(...args) {
  if (setup === 'done') {
    throw new Error('The observer must be initialized synchronously');
  }

  if (setup === null) {
    // Run observers after all callbacks are registered
    setup = store.resolve(Options).then(() => {
      setup = 'done';
    });
  }

  return new Promise((resolve, reject) => {
    let wrapper;

    if (args.length === 2) {
      const [property, fn] = args;
      wrapper = async (options, prevOptions) => {
        if (!isOptionEqual(options[property], prevOptions?.[property])) {
          try {
            await fn(options[property], prevOptions?.[property]);
            resolve();
          } catch (e) {
            reject(e);
            throw e;
          }
        }
      };
    } else {
      const fn = args[0];
      wrapper = async (options, prevOptions) => {
        try {
          await fn(options, prevOptions);
          resolve();
        } catch (e) {
          reject(e);
          throw e;
        }
      };
    }

    observers.add(wrapper);
  });
}

let queue = null;
export function run(options, prevOptions) {
  if (observers.size === 0) return;

  queue ||= (async () => {
    console.debug(`[observer] Run options observers...`);

    for (const fn of observers) {
      try {
        await fn(options, prevOptions);
      } catch (e) {
        console.error(`[options] Error while executing observer: `, e);
      }
    }

    console.debug(`[observer] Options observers done...`);
    queue = null;
  })();
}

export async function waitForIdle() {
  queue && (await queue);
}
