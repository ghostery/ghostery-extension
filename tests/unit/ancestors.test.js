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
import assert from 'node:assert/strict';

import { FramesHierarchy } from '../../src/background/adblocker/ancestors.js';

describe('#FramesHierarchy', () => {
  it('returns ancestor list', () => {
    const hierarchy = new FramesHierarchy();

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
    assert.deepEqual(
      hierarchy.ancestors({ tabId: 0, frameId: 0, parentFrameId: -1 }, 'foo.com'),
      [],
    );
    assert.deepEqual(
      hierarchy.ancestors({ tabId: 0, frameId: 1, parentFrameId: 0 }, 'frame.foo.com'),
      ['foo.com'],
    );
    assert.deepEqual(
      hierarchy
        .ancestors({ tabId: 0, frameId: 2, parentFrameId: 1 }, 'frameof.frame.foo.com')
        .reverse(),
      ['foo.com', 'frame.foo.com'],
    );
    assert.deepEqual(
      hierarchy
        .ancestors(
          { tabId: 0, frameId: 3, parentFrameId: 2 },
          'secondframeof.frameof.frame.foo.com',
        )
        .reverse(),
      ['foo.com', 'frame.foo.com', 'frameof.frame.foo.com'],
    );

    // Create another branch of frames
    assert.deepEqual(
      hierarchy.ancestors({ tabId: 0, frameId: 4, parentFrameId: 0 }, 'frame.foo.com'),
      ['foo.com'],
    );
    assert.deepEqual(
      hierarchy
        .ancestors({ tabId: 0, frameId: 5, parentFrameId: 4 }, 'frameof.frame.foo.com')
        .reverse(),
      ['foo.com', 'frame.foo.com'],
    );

    // -- Returns same ancestor list for different branch but
    // same hostname
    assert.deepEqual(
      hierarchy
        .ancestors(
          { tabId: 0, frameId: 3, parentFrameId: 2 },
          'secondframeof.frameof.frame.foo.com',
        )
        .reverse(),
      ['foo.com', 'frame.foo.com', 'frameof.frame.foo.com'],
    );

    // Create another branch of frames
    assert.deepEqual(hierarchy.ancestors({ tabId: 0, frameId: 6, parentFrameId: 0 }, 'bar.com'), [
      'foo.com',
    ]);
    assert.deepEqual(
      hierarchy.ancestors({ tabId: 0, frameId: 7, parentFrameId: 6 }, 'frame.bar.com').reverse(),
      ['foo.com', 'bar.com'],
    );
    assert.deepEqual(
      hierarchy
        .ancestors({ tabId: 0, frameId: 8, parentFrameId: 7 }, 'frameof.frame.bar.com')
        .reverse(),
      ['foo.com', 'bar.com', 'frame.bar.com'],
    );

    // Validate the entire structure
    assert.deepEqual(hierarchy.tabs, [
      {
        id: 0,
        frames: [
          {
            id: 0,
            parent: -1,
            documentId: '',
            details: 'foo.com',
          },
          {
            id: 1,
            parent: 0,
            documentId: '',
            details: 'frame.foo.com',
          },
          {
            id: 2,
            parent: 1,
            documentId: '',
            details: 'frameof.frame.foo.com',
          },
          {
            id: 3,
            parent: 2,
            documentId: '',
            details: 'secondframeof.frameof.frame.foo.com',
          },
          {
            id: 4,
            parent: 0,
            documentId: '',
            details: 'frame.foo.com',
          },
          {
            id: 5,
            parent: 4,
            documentId: '',
            details: 'frameof.frame.foo.com',
          },
          {
            id: 6,
            parent: 0,
            documentId: '',
            details: 'bar.com',
          },
          {
            id: 7,
            parent: 6,
            documentId: '',
            details: 'frame.bar.com',
          },
          {
            id: 8,
            parent: 7,
            documentId: '',
            details: 'frameof.frame.bar.com',
          },
        ],
      },
    ]);

    // Unregister specific frame branch: frame.foo.com (1)
    hierarchy.unregister(0, 1);
    assert.deepEqual(hierarchy.tabs, [
      {
        id: 0,
        frames: [
          {
            id: 0,
            parent: -1,
            documentId: '',
            details: 'foo.com',
          },
          {
            id: 4,
            parent: 0,
            documentId: '',
            details: 'frame.foo.com',
          },
          {
            id: 5,
            parent: 4,
            documentId: '',
            details: 'frameof.frame.foo.com',
          },
          {
            id: 6,
            parent: 0,
            documentId: '',
            details: 'bar.com',
          },
          {
            id: 7,
            parent: 6,
            documentId: '',
            details: 'frame.bar.com',
          },
          {
            id: 8,
            parent: 7,
            documentId: '',
            details: 'frameof.frame.bar.com',
          },
        ],
      },
    ]);

    hierarchy.unregister(0, 7);
    assert.deepEqual(hierarchy.tabs, [
      {
        id: 0,
        frames: [
          {
            id: 0,
            parent: -1,
            documentId: '',
            details: 'foo.com',
          },
          {
            id: 4,
            parent: 0,
            documentId: '',
            details: 'frame.foo.com',
          },
          {
            id: 5,
            parent: 4,
            documentId: '',
            details: 'frameof.frame.foo.com',
          },
          {
            id: 6,
            parent: 0,
            documentId: '',
            details: 'bar.com',
          },
        ],
      },
    ]);

    hierarchy.unregister(0, 5);
    assert.deepEqual(hierarchy.tabs, [
      {
        id: 0,
        frames: [
          {
            id: 0,
            parent: -1,
            documentId: '',
            details: 'foo.com',
          },
          {
            id: 4,
            parent: 0,
            documentId: '',
            details: 'frame.foo.com',
          },
          {
            id: 6,
            parent: 0,
            documentId: '',
            details: 'bar.com',
          },
        ],
      },
    ]);

    hierarchy.unregister(0, 0);
    assert.deepEqual(hierarchy.tabs, []);
  });

  // `concurrent` here assumes the situation that the browser
  // context holds multiple tabs and each tab sends events.
  it('handles concurrent requests', () => {
    const hierarchy = new FramesHierarchy();

    // Opens tab `foo.com`
    assert.deepEqual(
      hierarchy.ancestors({ tabId: 0, frameId: 0, parentFrameId: -1 }, 'foo.com'),
      [],
    );
    // Opens tab `bar.com`
    assert.deepEqual(
      hierarchy.ancestors({ tabId: 1, frameId: 0, parentFrameId: -1 }, 'bar.com'),
      [],
    );

    assert.deepEqual(hierarchy.tabs, [
      {
        id: 0,
        frames: [
          {
            id: 0,
            parent: -1,
            documentId: '',
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
            documentId: '',
            details: 'bar.com',
          },
        ],
      },
    ]);

    // `foo.com` creates frame `proxy.foo.com`
    assert.deepEqual(
      hierarchy.ancestors({ tabId: 0, frameId: 1, parentFrameId: 0 }, 'proxy.foo.com'),
      ['foo.com'],
    );
    // `bar.com` creates frame `proxy.bar.com`
    assert.deepEqual(
      hierarchy.ancestors({ tabId: 1, frameId: 1, parentFrameId: 0 }, 'proxy.bar.com'),
      ['bar.com'],
    );

    // Opens tab `bar.com`
    assert.deepEqual(
      hierarchy.ancestors({ tabId: 2, frameId: 0, parentFrameId: -1 }, 'baz.com'),
      [],
    );

    assert.deepEqual(hierarchy.tabs, [
      {
        id: 0,
        frames: [
          {
            id: 0,
            parent: -1,
            documentId: '',
            details: 'foo.com',
          },
          {
            id: 1,
            parent: 0,
            documentId: '',
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
            documentId: '',
            details: 'bar.com',
          },
          {
            id: 1,
            parent: 0,
            documentId: '',
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
            documentId: '',
            details: 'baz.com',
          },
        ],
      },
    ]);

    // Closes tab `bar.com`
    hierarchy.unregister(1, 0);
    // Closes tab `foo.com`
    hierarchy.unregister(0, 0);
    // Closes tab `baz.com`
    hierarchy.unregister(2, 0);

    assert.deepEqual(hierarchy.tabs, []);
  });

  it('handles 100 tabs each one holding 200 frames', () => {
    const hierarchy = new FramesHierarchy();

    for (let i = 0; i < 100; i++) {
      assert.deepEqual(
        hierarchy.ancestors({ tabId: i, frameId: 0, parentFrameId: -1 }, 'foo.com'),
        [],
      );
    }

    for (let i = 0; i < 100; i++) {
      // Subframe ID should not start with 0.
      for (let k = 1; k < 200; k++) {
        assert.deepEqual(
          hierarchy.ancestors({ tabId: i, frameId: k, parentFrameId: 0 }, 'frame.foo.com'),
          ['foo.com'],
        );
      }
    }

    for (let i = 0; i < 100; i++) {
      hierarchy.unregister(i, 0);
    }

    assert.deepEqual(hierarchy.tabs, []);
  });

  it('handles incomplete tab information', () => {
    const hierarchy = new FramesHierarchy();

    // Assume that the main frame tab information didn't reach.
    // We rather not to execute scripts when the chain is
    // incomplete, which might lead to the potential breakage.
    assert.deepEqual(
      hierarchy.ancestors({ tabId: 0, frameId: 10, parentFrameId: 2 }, 'foo.com'),
      [],
    );
    assert.deepEqual(
      hierarchy.ancestors({ tabId: 0, frameId: 10, parentFrameId: 5 }, 'foo.com'),
      [],
    );
    assert.deepEqual(
      hierarchy.ancestors({ tabId: 0, frameId: 10, parentFrameId: 11 }, 'foo.com'),
      [],
    );

    assert.deepEqual(hierarchy.tabs, []);
  });

  it('replaces the tab information', () => {
    const hierarchy = new FramesHierarchy();

    // Assume that `frameId` is something unexpected, such as
    // omnibox prehit situation.
    assert.deepEqual(
      hierarchy.ancestors({ tabId: 0, frameId: 10, parentFrameId: -1 }, 'about:blank'),
      [],
    );
    // Creates new main frame with `foo.com`.
    assert.deepEqual(
      hierarchy.ancestors({ tabId: 0, frameId: 0, parentFrameId: -1 }, 'foo.com'),
      [],
    );
    // Opens subframe.
    assert.deepEqual(
      hierarchy.ancestors({ tabId: 0, frameId: 1, parentFrameId: 0 }, 'frame.foo.com'),
      ['foo.com'],
    );

    assert.deepEqual(hierarchy.tabs, [
      {
        id: 0,
        frames: [
          {
            id: 10,
            parent: -1,
            documentId: '',
            details: 'about:blank',
          },
          {
            id: 0,
            parent: -1,
            documentId: '',
            details: 'foo.com',
          },
          {
            id: 1,
            parent: 0,
            documentId: '',
            details: 'frame.foo.com',
          },
        ],
      },
    ]);
  });

  it('handles service worker restart', () => {
    const hierarchy = new FramesHierarchy();

    assert.deepEqual(
      hierarchy.ancestors({ tabId: 0, frameId: 0, parentFrameId: -1 }, 'foo.com'),
      [],
    );
    assert.deepEqual(
      hierarchy.ancestors({ tabId: 0, frameId: 1, parentFrameId: 0 }, 'frame.foo.com'),
      ['foo.com'],
    );
    assert.deepEqual(
      hierarchy.ancestors({ tabId: 0, frameId: 2, parentFrameId: 1 }, 'bar.com').reverse(),
      ['foo.com', 'frame.foo.com'],
    );

    const tabsBeforeClear = structuredClone(hierarchy.tabs);

    // Clear tabs; emulating the service worker restart
    hierarchy.tabs = [];

    hierarchy.sync(0, [
      {
        frameId: 0,
        parentFrameId: -1,
        _details: 'foo.com',
      },
      {
        frameId: 1,
        parentFrameId: 0,
        _details: 'frame.foo.com',
      },
      {
        frameId: 2,
        parentFrameId: 1,
        _details: 'bar.com',
      },
    ]);

    assert.deepEqual(tabsBeforeClear, hierarchy.tabs);
  });

  describe('`documentId` tracking', () => {
    it('tracks Safari-like top-hit preloading', () => {
      const hierarchy = new FramesHierarchy();

      // Assume that a user opens a new tab.
      assert.deepEqual(
        hierarchy.ancestors(
          { tabId: 0, frameId: 0, parentFrameId: -1, documentId: 'A0' },
          'about:blank',
        ),
        [],
      );
      // Assume there's a pre-rendering frame as the user types
      // into the omnibox or the address bar.
      assert.deepEqual(
        hierarchy.ancestors(
          { tabId: 0, frameId: 1_000, parentFrameId: 0, documentId: 'Z0' },
          'foo.com',
        ),
        ['about:blank'],
      );
      // The pre-rendering frame calls another frame.
      assert.deepEqual(
        hierarchy
          .ancestors(
            {
              tabId: 0,
              frameId: 1_001,
              parentFrameId: 1_000,
              documentId: 'Z1',
            },
            'frame.foo.com',
          )
          .reverse(),
        ['about:blank', 'foo.com'],
      );
      // The pre-rendered frame gets replaced into main frame.
      assert.deepEqual(
        hierarchy.ancestors(
          { tabId: 0, frameId: 0, parentFrameId: -1, documentId: 'Z0' },
          'foo.com',
        ),
        [],
      );
      assert.deepEqual(
        hierarchy.ancestors(
          { tabId: 0, frameId: 1_001, parentFrameId: 0, documentId: 'Z1' },
          'frame.foo.com',
        ),
        ['foo.com'],
      );

      assert.deepEqual(hierarchy.tabs, [
        {
          id: 0,
          frames: [
            {
              id: 0,
              parent: -1,
              documentId: 'Z0',
              details: 'foo.com',
            },
            {
              id: 1_001,
              parent: 0,
              documentId: 'Z1',
              details: 'frame.foo.com',
            },
          ],
        },
      ]);
    });

    it('tracks main frame refresh', () => {
      const hierarchy = new FramesHierarchy();

      // Assume that a user opens a new tab.
      assert.deepEqual(
        hierarchy.ancestors(
          { tabId: 0, frameId: 0, parentFrameId: -1, documentId: 'A0' },
          'about:blank',
        ),
        [],
      );
      // Assume that a user navigates the tab into the website.
      assert.deepEqual(
        hierarchy.ancestors(
          { tabId: 0, frameId: 0, parentFrameId: -1, documentId: 'B1' },
          'foo.com',
        ),
        [],
      );
      // Assume the page creates some frames.
      assert.deepEqual(
        hierarchy.ancestors(
          { tabId: 0, frameId: 1, parentFrameId: 0, documentId: 'B2' },
          'oauth.foo.com',
        ),
        ['foo.com'],
      );
      assert.deepEqual(
        hierarchy.ancestors(
          { tabId: 0, frameId: 2, parentFrameId: 0, documentId: 'B3' },
          'consent.foo.com',
        ),
        ['foo.com'],
      );

      // Assume user refreshes the page.
      assert.deepEqual(
        hierarchy.ancestors(
          { tabId: 0, frameId: 0, parentFrameId: -1, documentId: 'C1' },
          'foo.com',
        ),
        [],
      );

      assert.deepEqual(hierarchy.tabs, [
        {
          id: 0,
          frames: [
            {
              id: 0,
              parent: -1,
              documentId: 'C1',
              details: 'foo.com',
            },
          ],
        },
      ]);
    });
  });
});
