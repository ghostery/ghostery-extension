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

import { describe, it } from 'node:test';
import assert from 'node:assert';

import { createAncestorsList } from '../../src/utils/ancestors.js';

describe('createAncestorsList', () => {
  it('returns ancestor list', () => {
    const { tabs, ancestors, unregister } = createAncestorsList();

    /**
     * foo.com (0)
     *  -> frame.foo.com (1)
     *    -> frameof.frame.foo.com (2)
     *      -> secondframeof.frameoof.foo.com (3)
     *  -> frame.foo.com (4)
     *    -> frameof.frame.foo.com (5)
     *  -> bar.com (6)
     *    -> frame.bar.com (7)
     *      -> frameof.frame.bar.com (8)
     */
    assert.deepStrictEqual(ancestors(0, 0, -1, 'foo.com'), []);
    assert.deepStrictEqual(ancestors(0, 1, 0, 'frame.foo.com'), ['foo.com']);
    assert.deepStrictEqual(
      ancestors(0, 2, 1, 'frameof.frame.foo.com').reverse(),
      ['foo.com', 'frame.foo.com'],
    );
    assert.deepStrictEqual(
      ancestors(0, 3, 2, 'secondframeof.frameof.frame.foo.com').reverse(),
      ['foo.com', 'frame.foo.com', 'frameof.frame.foo.com'],
    );

    // Create another branch of frames
    assert.deepStrictEqual(ancestors(0, 4, 0, 'frame.foo.com'), ['foo.com']);
    assert.deepStrictEqual(
      ancestors(0, 5, 4, 'frameof.frame.foo.com').reverse(),
      ['foo.com', 'frame.foo.com'],
    );

    // -- Returns same ancestor list for different branch but
    // same hostname
    assert.deepStrictEqual(
      ancestors(0, 3, 2, 'secondframeof.frameof.frame.foo.com').reverse(),
      ['foo.com', 'frame.foo.com', 'frameof.frame.foo.com'],
    );

    // Create another branch of frames
    assert.deepStrictEqual(ancestors(0, 6, 0, 'bar.com'), ['foo.com']);
    assert.deepStrictEqual(ancestors(0, 7, 6, 'frame.bar.com').reverse(), [
      'foo.com',
      'bar.com',
    ]);
    assert.deepStrictEqual(
      ancestors(0, 8, 7, 'frameof.frame.bar.com').reverse(),
      ['foo.com', 'bar.com', 'frame.bar.com'],
    );

    // Validate the entire structure
    assert.deepStrictEqual(tabs, [
      {
        id: 0,
        frames: [
          {
            id: 0,
            parent: -1,
            details: 'foo.com',
          },
          {
            id: 1,
            parent: 0,
            details: 'frame.foo.com',
          },
          {
            id: 2,
            parent: 1,
            details: 'frameof.frame.foo.com',
          },
          {
            id: 3,
            parent: 2,
            details: 'secondframeof.frameof.frame.foo.com',
          },
          {
            id: 4,
            parent: 0,
            details: 'frame.foo.com',
          },
          {
            id: 5,
            parent: 4,
            details: 'frameof.frame.foo.com',
          },
          {
            id: 6,
            parent: 0,
            details: 'bar.com',
          },
          {
            id: 7,
            parent: 6,
            details: 'frame.bar.com',
          },
          {
            id: 8,
            parent: 7,
            details: 'frameof.frame.bar.com',
          },
        ],
      },
    ]);

    // Unregister specific frame branch: frame.foo.com (1)
    unregister(0, 1);
    assert.deepStrictEqual(tabs, [
      {
        id: 0,
        frames: [
          {
            id: 0,
            parent: -1,
            details: 'foo.com',
          },
          {
            id: 4,
            parent: 0,
            details: 'frame.foo.com',
          },
          {
            id: 5,
            parent: 4,
            details: 'frameof.frame.foo.com',
          },
          {
            id: 6,
            parent: 0,
            details: 'bar.com',
          },
          {
            id: 7,
            parent: 6,
            details: 'frame.bar.com',
          },
          {
            id: 8,
            parent: 7,
            details: 'frameof.frame.bar.com',
          },
        ],
      },
    ]);

    unregister(0, 7);
    assert.deepStrictEqual(tabs, [
      {
        id: 0,
        frames: [
          {
            id: 0,
            parent: -1,
            details: 'foo.com',
          },
          {
            id: 4,
            parent: 0,
            details: 'frame.foo.com',
          },
          {
            id: 5,
            parent: 4,
            details: 'frameof.frame.foo.com',
          },
          {
            id: 6,
            parent: 0,
            details: 'bar.com',
          },
        ],
      },
    ]);

    unregister(0, 5);
    assert.deepStrictEqual(tabs, [
      {
        id: 0,
        frames: [
          {
            id: 0,
            parent: -1,
            details: 'foo.com',
          },
          {
            id: 4,
            parent: 0,
            details: 'frame.foo.com',
          },
          {
            id: 6,
            parent: 0,
            details: 'bar.com',
          },
        ],
      },
    ]);

    unregister(0, 0);
    assert.deepStrictEqual(tabs, []);
  });

  // `concurrent` here assumes the situation that the browser
  // context holds multiple tabs and each tab sends events.
  it('handles concurrent requests', () => {
    const { tabs, ancestors, unregister } = createAncestorsList();

    // Opens tab `foo.com`
    assert.deepEqual(ancestors(0, 0, -1, 'foo.com'), []);
    // Opens tab `bar.com`
    assert.deepEqual(ancestors(1, 0, -1, 'bar.com'), []);

    assert.deepEqual(tabs, [
      {
        id: 0,
        frames: [
          {
            id: 0,
            parent: -1,
            details: 'foo.com',
          },
        ],
      },
      {
        id: 1,
        frames: [
          {
            id: 0,
            parent: -1,
            details: 'bar.com',
          },
        ],
      },
    ]);

    // `foo.com` creates frame `proxy.foo.com`
    assert.deepEqual(ancestors(0, 1, 0, 'proxy.foo.com'), ['foo.com']);
    // `bar.com` creates frame `proxy.bar.com`
    assert.deepEqual(ancestors(1, 1, 0, 'proxy.bar.com'), ['bar.com']);

    // Opens tab `bar.com`
    assert.deepEqual(ancestors(2, 0, -1, 'baz.com'), []);

    assert.deepEqual(tabs, [
      {
        id: 0,
        frames: [
          {
            id: 0,
            parent: -1,
            details: 'foo.com',
          },
          {
            id: 1,
            parent: 0,
            details: 'proxy.foo.com',
          },
        ],
      },
      {
        id: 1,
        frames: [
          {
            id: 0,
            parent: -1,
            details: 'bar.com',
          },
          {
            id: 1,
            parent: 0,
            details: 'proxy.bar.com',
          },
        ],
      },
      {
        id: 2,
        frames: [
          {
            id: 0,
            parent: -1,
            details: 'baz.com',
          },
        ],
      },
    ]);

    // Closes tab `bar.com`
    unregister(1, 0);
    // Closes tab `foo.com`
    unregister(0, 0);
    // Closes tab `baz.com`
    unregister(2, 0);

    assert.deepEqual(tabs, []);
  });

  it('handles 100 tabs each one holding 200 frames', () => {
    const { tabs, ancestors, unregister } = createAncestorsList();

    for (let i = 0; i < 100; i++) {
      assert.deepStrictEqual(ancestors(i, 0, -1, 'foo.com'), []);
    }

    for (let i = 0; i < 100; i++) {
      // Subframe ID should not start with 0.
      for (let k = 1; k < 200; k++) {
        assert.deepStrictEqual(ancestors(i, k, 0, 'frame.foo.com'), [
          'foo.com',
        ]);
      }
    }

    for (let i = 0; i < 100; i++) {
      unregister(i, 0);
    }

    assert.deepStrictEqual(tabs, []);
  });

  it('handles incomplete tab information', () => {
    const { tabs, ancestors } = createAncestorsList();

    // Assume that the main frame tab information didn't reach.
    // We rather not to execute scripts when the chain is
    // incomplete, which might lead to the potential breakage.
    assert.deepStrictEqual(ancestors(0, 10, 2, 'foo.com'), []);
    assert.deepStrictEqual(ancestors(0, 10, 5, 'foo.com'), []);
    assert.deepStrictEqual(ancestors(0, 10, 11, 'foo.com'), []);

    assert.deepStrictEqual(tabs, []);
  });

  it('replaces the tab information', () => {
    const { tabs, ancestors, replace } = createAncestorsList();

    // Assume that `frameId` is something unexpected, such as
    // omnibox prehit situation.
    assert.deepStrictEqual(ancestors(0, 10, -1, 'about:blank'), []);
    // Replace the tab information.
    replace(0, 1);
    // Creates new main frame with `foo.com`.
    assert.deepStrictEqual(ancestors(1, 0, -1, 'foo.com'), []);
    // Opens subframe.
    assert.deepStrictEqual(ancestors(1, 1, 0, 'frame.foo.com'), ['foo.com']);

    assert.deepStrictEqual(tabs, [
      {
        id: 1,
        frames: [
          {
            id: 10,
            parent: -1,
            details: 'about:blank',
          },
          {
            id: 0,
            parent: -1,
            details: 'foo.com',
          },
          {
            id: 1,
            parent: 0,
            details: 'frame.foo.com',
          },
        ],
      },
    ]);
  });
});
