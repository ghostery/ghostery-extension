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

export function isOptionEqual(a, b) {
  if (typeof b !== 'object' || b === null) return a === b;

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  return (
    aKeys.length === bKeys.length &&
    aKeys.every((key) => isOptionEqual(a[key], b[key]))
  );
}

const observers = [];
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
    const fn = args[1] || args[0];
    const property = args.length === 2 ? args[0] : null;

    const getValue = property ? (v) => v[property] : (v) => v;
    const getPrevValue = property ? (v) => v?.[property] : (v) => v;

    const wrapper = async (options, prevOptions) => {
      const value = getValue(options);
      const prevValue = getPrevValue(prevOptions);

      if (isOptionEqual(value, prevValue)) return;

      try {
        console.debug(`[options] Executing "${fn.name || property}" observer`);
        await fn(value, prevValue);
        resolve();
      } catch (e) {
        reject(e);
        throw e;
      }
    };

    observers.push(wrapper);
  });
}

let queues = new Set();
export async function waitForIdle() {
  for (const queue of queues) await queue;
}

export async function execute(options, prevOptions) {
  if (observers.length === 0) return;

  const queue = Promise.allSettled([...queues]).then(async () => {
    console.debug(`[options] Start observers...`);

    await Promise.all(
      observers.map(async (fn) => {
        try {
          await fn(options, prevOptions);
        } catch (e) {
          console.error(`Error while executing observer: `, e);
        }
      }),
    );

    console.debug(`[options] Observers finished...`);
    queues.delete(queue);
  });

  queues.add(queue);
}
