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

import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';

import { store } from 'hybrids';
import * as Sentry from '@sentry/browser';

global.__DEBUG__ = false;
global.chrome.runtime.getManifest = () => ({ version: '1.0.0' });
global.chrome.runtime.getURL = (path) => `chrome-extension://test-extension-id${path}`;

// `errors.js` talks to the `Options`/`Errors` hybrids stores as soon as it is
// imported, so each test replaces them with an in-memory fake (via node's
// experimental module mocking). The real `@sentry/browser` SDK is used as-is
// (see `interceptSentryTransport` below) so sampling, `beforeSend`, tagging
// and stack parsing all run for real.
let importCounter = 0;

function mockOptionsStore({ terms = true, feedback = true } = {}) {
  return mock.module('/store/options.js', {
    exports: {
      default: {
        // `terms`/`feedback` must be declared as schema fields (their values
        // here are just the hybrids-required defaults/types) for the values
        // returned by `connect.get()` below to be exposed on the resolved model.
        terms: false,
        feedback: false,
        [store.connect]: {
          get: () => ({ terms, feedback }),
        },
      },
    },
  });
}

function mockErrorsStore() {
  let backing = { onceIds: {} };

  return mock.module('/store/errors.js', {
    exports: {
      default: {
        onceIds: store.record(0),
        [store.connect]: {
          get: async () => backing,
          set: async (_, errors) => {
            backing = errors;
            return errors;
          },
        },
      },
    },
  });
}

// Replaces the real client's transport `send` with a spy so envelopes never
// leave the process. Everything upstream of the transport (sampling,
// `beforeSend`, tags, stack trace parsing, envelope building) is the real
// Sentry SDK, so a captured envelope here means the event genuinely would
// have been sent to Sentry.
function interceptSentryTransport() {
  const client = Sentry.getClient();
  const transport = client?.getTransport();
  const originalSend = transport?.send.bind(transport);
  const sent = [];

  if (transport) {
    transport.send = async (envelope) => {
      sent.push(envelope);
      return {};
    };
  }

  return {
    sent,
    restore() {
      if (transport) transport.send = originalSend;
    },
  };
}

// Extracts the event payload out of a Sentry envelope: [header, [[itemHeader, event]]]
function getEvent(envelope) {
  const [, items] = envelope;
  const [[, event]] = items;
  return event;
}

async function setup(options) {
  const optionsMock = mockOptionsStore(options);
  const errorsMock = mockErrorsStore();

  const { captureError } = await import(`../../src/utils/errors.js?case=${importCounter++}`);
  const transport = interceptSentryTransport();

  return {
    captureError,
    sent: transport.sent,
    restore: () => {
      transport.restore();
      optionsMock.restore();
      errorsMock.restore();
    },
  };
}

describe('utils/errors.js', () => {
  describe('captureError()', () => {
    it('does not send an event when terms are not accepted', async () => {
      const { captureError, sent, restore } = await setup({ terms: false, feedback: true });
      try {
        await captureError(new Error('boom'), { critical: true });
        assert.equal(sent.length, 0);
      } finally {
        restore();
      }
    });

    it('does not send an event when feedback is disabled', async () => {
      const { captureError, sent, restore } = await setup({ terms: true, feedback: false });
      try {
        await captureError(new Error('boom'), { critical: true });
        assert.equal(sent.length, 0);
      } finally {
        restore();
      }
    });

    it('does not send values that are not an instance of Error', async () => {
      const { captureError, sent, restore } = await setup();
      try {
        await captureError('just a string', { critical: true });
        await captureError({ message: 'plain object' }, { critical: true });
        assert.equal(sent.length, 0);
      } finally {
        restore();
      }
    });

    it('sends a critical error event to Sentry with the expected payload', async () => {
      const { captureError, sent, restore } = await setup();
      try {
        const error = new Error('something broke');
        await captureError(error, { critical: true });

        assert.equal(sent.length, 1);

        const event = getEvent(sent[0]);
        const [exception] = event.exception.values;
        assert.equal(exception.value, 'something broke');
        assert.equal(exception.type, 'Error');
        assert.equal(event.tags.critical, true);
        assert.equal(event.tags.ua, 'ch');
      } finally {
        restore();
      }
    });

    it('samples non-critical errors according to the sampling rate', async () => {
      const { captureError, sent, restore } = await setup();
      // Sentry's own internals (event id generation, etc.) also call
      // `Math.random()`, so `mockImplementationOnce` would be consumed before
      // reaching our sampling check. Pin it for the whole call instead.
      let randomMock = mock.method(Math, 'random', () => 0); // below the 0.3 sample rate: kept
      try {
        await captureError(new Error('sampled in'));
        assert.equal(sent.length, 1);
      } finally {
        randomMock.mock.restore();
      }

      randomMock = mock.method(Math, 'random', () => 0.9); // above the sample rate: dropped
      try {
        await captureError(new Error('sampled out'));
        assert.equal(sent.length, 1);
      } finally {
        randomMock.mock.restore();
        restore();
      }
    });

    it('filters the extension host out of the reported stack trace', async () => {
      const { captureError, sent, restore } = await setup();
      try {
        const error = new Error('leaky stack');
        error.stack =
          'Error: leaky stack\n    at run (chrome-extension://test-extension-id/utils/errors.js:1:1)';

        await captureError(error, { critical: true });

        const event = getEvent(sent[0]);
        const [frame] = event.exception.values[0].stacktrace.frames;
        assert.ok(!frame.filename.includes('test-extension-id'));
        assert.equal(frame.filename, 'chrome-extension://filtered/utils/errors.js');
      } finally {
        restore();
      }
    });

    it('falls back to a synthetic stack when the error has no call frames', async () => {
      const { captureError, sent, restore } = await setup();
      try {
        const error = new Error('frameless');
        error.stack = 'Error: frameless'; // no "at"/"@" frames, e.g. serialized across contexts

        await captureError(error, { critical: true });

        const event = getEvent(sent[0]);
        const { frames } = event.exception.values[0].stacktrace;
        assert.ok(frames.length > 0);
      } finally {
        restore();
      }
    });

    it('tags the event as critical only when explicitly requested', async () => {
      const { captureError, sent, restore } = await setup();
      const randomMock = mock.method(Math, 'random', () => 0); // force non-critical errors to pass sampling
      try {
        await captureError(new Error('not critical'));
        assert.equal(sent.length, 1);
        assert.equal(getEvent(sent[0]).tags.critical, undefined);

        await captureError(new Error('critical one'), { critical: true });
        assert.equal(sent.length, 2);
        assert.equal(getEvent(sent[1]).tags.critical, true);
      } finally {
        randomMock.mock.restore();
        restore();
      }
    });

    it('deduplicates errors reported with `once` within 24 hours', async () => {
      const { captureError, sent, restore } = await setup();
      try {
        await captureError(new Error('duplicate'), { critical: true, once: true });
        await captureError(new Error('duplicate'), { critical: true, once: true });

        assert.equal(sent.length, 1);

        // A different message is not deduplicated against the first one.
        await captureError(new Error('other'), { critical: true, once: true });
        assert.equal(sent.length, 2);
      } finally {
        restore();
      }
    });

    it('skips errors with `once` that have no message to identify them', async () => {
      const { captureError, sent, restore } = await setup();
      const originalWarn = console.warn;
      const warnings = [];
      console.warn = (...args) => warnings.push(args);

      try {
        const error = new Error();
        error.message = '';

        await captureError(error, { critical: true, once: true });

        assert.equal(sent.length, 0);
        assert.equal(warnings.length, 1);
      } finally {
        console.warn = originalWarn;
        restore();
      }
    });
  });
});
