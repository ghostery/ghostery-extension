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

import { store, msg } from 'hybrids';

export function getStatus(options, trackerId, domain = '') {
  const exception = options.exceptions[trackerId];

  if (!exception) return { trusted: false, global: true };

  if (exception.global) return { trusted: true, global: true };
  if (exception.domains.find((d) => domain.endsWith(d))) {
    return { trusted: true };
  }

  return { trusted: false };
}

export function getLabel(options, trackerId, domain) {
  const { trusted, global } = getStatus(options, trackerId, domain);

  if (trusted) {
    if (global) return msg`Trusted on all websites`;
    return msg`Trusted on this website`;
  }

  if (global) return msg`Blocked on all websites`;
  return msg`Blocked on this website`;
}

export function toggleGlobal(options, trackerId) {
  const exception = options.exceptions[trackerId];

  if (!exception || !exception.global) {
    return store.set(options, {
      exceptions: { [trackerId]: { global: true } },
    });
  }

  return store.set(options, {
    exceptions: {
      [trackerId]: exception.domains.length ? { global: false } : null,
    },
  });
}

export function toggleDomain(options, trackerId, domain, force = false) {
  const exception = options.exceptions[trackerId];

  let domains = [domain];
  if (exception) {
    domains = exception.domains.includes(domain)
      ? exception.domains.filter((d) => d !== domain || force)
      : exception.domains.concat(domain);
  }

  if (domains.length || exception.global) {
    return store.set(options, {
      exceptions: { [trackerId]: { domains } },
    });
  }

  return store.set(options, {
    exceptions: { [trackerId]: null },
  });
}
