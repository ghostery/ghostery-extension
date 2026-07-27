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
    hierarchy.updateAncestry({ tabId: 0, frameId: 0, parentFrameId: -1 }, 'foo.com');
    assert.deepEqual(hierarchy.ancestorsOf(0, 0), []);

    hierarchy.updateAncestry({ tabId: 0, frameId: 1, parentFrameId: 0 }, 'frame.foo.com');
    assert.deepEqual(hierarchy.ancestorsOf(0, 1), ['foo.com']);

    hierarchy.updateAncestry({ tabId: 0, frameId: 2, parentFrameId: 1 }, 'frameof.frame.foo.com');
    assert.deepEqual(hierarchy.ancestorsOf(0, 2).reverse(), ['foo.com', 'frame.foo.com']);

    hierarchy.updateAncestry(
      { tabId: 0, frameId: 3, parentFrameId: 2 },
      'secondframeof.frameof.frame.foo.com',
    );
    assert.deepEqual(hierarchy.ancestorsOf(0, 3).reverse(), [
      'foo.com',
      'frame.foo.com',
      'frameof.frame.foo.com',
    ]);

    // Create another branch of frames
    hierarchy.updateAncestry({ tabId: 0, frameId: 4, parentFrameId: 0 }, 'frame.foo.com');
    assert.deepEqual(hierarchy.ancestorsOf(0, 4), ['foo.com']);

    hierarchy.updateAncestry({ tabId: 0, frameId: 5, parentFrameId: 4 }, 'frameof.frame.foo.com');
    assert.deepEqual(hierarchy.ancestorsOf(0, 5).reverse(), ['foo.com', 'frame.foo.com']);

    // -- Returns same ancestor list for different branch but
    // same hostname
    hierarchy.updateAncestry(
      { tabId: 0, frameId: 3, parentFrameId: 2 },
      'secondframeof.frameof.frame.foo.com',
    );
    assert.deepEqual(hierarchy.ancestorsOf(0, 3).reverse(), [
      'foo.com',
      'frame.foo.com',
      'frameof.frame.foo.com',
    ]);

    // Create another branch of frames
    hierarchy.updateAncestry({ tabId: 0, frameId: 6, parentFrameId: 0 }, 'bar.com');
    assert.deepEqual(hierarchy.ancestorsOf(0, 6), ['foo.com']);

    hierarchy.updateAncestry({ tabId: 0, frameId: 7, parentFrameId: 6 }, 'frame.bar.com');
    assert.deepEqual(hierarchy.ancestorsOf(0, 7).reverse(), ['foo.com', 'bar.com']);

    hierarchy.updateAncestry({ tabId: 0, frameId: 8, parentFrameId: 7 }, 'frameof.frame.bar.com');
    assert.deepEqual(hierarchy.ancestorsOf(0, 8).reverse(), [
      'foo.com',
      'bar.com',
      'frame.bar.com',
    ]);

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
    hierarchy.updateAncestry({ tabId: 0, frameId: 0, parentFrameId: -1 }, 'foo.com');
    assert.deepEqual(hierarchy.ancestorsOf(0, 0), []);

    // Opens tab `bar.com`
    hierarchy.updateAncestry({ tabId: 1, frameId: 0, parentFrameId: -1 }, 'bar.com');
    assert.deepEqual(hierarchy.ancestorsOf(1, 0), []);

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
    hierarchy.updateAncestry({ tabId: 0, frameId: 1, parentFrameId: 0 }, 'proxy.foo.com');
    assert.deepEqual(hierarchy.ancestorsOf(0, 1), ['foo.com']);

    // `bar.com` creates frame `proxy.bar.com`
    hierarchy.updateAncestry({ tabId: 1, frameId: 1, parentFrameId: 0 }, 'proxy.bar.com');
    assert.deepEqual(hierarchy.ancestorsOf(1, 1), ['bar.com']);

    // Opens tab `bar.com`
    hierarchy.updateAncestry({ tabId: 2, frameId: 0, parentFrameId: -1 }, 'baz.com');
    assert.deepEqual(hierarchy.ancestorsOf(2, 0), []);

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
      hierarchy.updateAncestry({ tabId: i, frameId: 0, parentFrameId: -1 }, 'foo.com');
      assert.deepEqual(hierarchy.ancestorsOf(i, 0), []);
    }

    for (let i = 0; i < 100; i++) {
      // Subframe ID should not start with 0.
      for (let k = 1; k < 200; k++) {
        hierarchy.updateAncestry({ tabId: i, frameId: k, parentFrameId: 0 }, 'frame.foo.com');
        assert.deepEqual(hierarchy.ancestorsOf(i, k), ['foo.com']);
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
    hierarchy.updateAncestry({ tabId: 0, frameId: 10, parentFrameId: 2 }, 'foo.com');
    assert.deepEqual(hierarchy.ancestorsOf(0, 10), []);

    hierarchy.updateAncestry({ tabId: 0, frameId: 10, parentFrameId: 5 }, 'foo.com');
    assert.deepEqual(hierarchy.ancestorsOf(0, 10), []);

    hierarchy.updateAncestry({ tabId: 0, frameId: 10, parentFrameId: 11 }, 'foo.com');
    assert.deepEqual(hierarchy.ancestorsOf(0, 10), []);

    assert.deepEqual(hierarchy.tabs, []);
  });

  it('drops the tab when a tracked frame points to an unknown ancestor', () => {
    const hierarchy = new FramesHierarchy();

    hierarchy.updateAncestry({ tabId: 0, frameId: 0, parentFrameId: -1 }, 'foo.com');
    hierarchy.updateAncestry({ tabId: 0, frameId: 2, parentFrameId: 1 }, 'orphan.foo.com');

    assert.deepEqual(hierarchy.ancestorsOf(0, 2), []);
    assert.deepEqual(hierarchy.tabs, []);
  });

  it('replaces the tab information', () => {
    const hierarchy = new FramesHierarchy();

    // Assume that `frameId` is something unexpected, such as
    // omnibox prehit situation.
    hierarchy.updateAncestry({ tabId: 0, frameId: 10, parentFrameId: -1 }, 'about:blank');
    assert.deepEqual(hierarchy.ancestorsOf(0, 10), []);

    // Creates new main frame with `foo.com`.
    hierarchy.updateAncestry({ tabId: 0, frameId: 0, parentFrameId: -1 }, 'foo.com');
    assert.deepEqual(hierarchy.ancestorsOf(0, 0), []);

    // Opens subframe.
    hierarchy.updateAncestry({ tabId: 0, frameId: 1, parentFrameId: 0 }, 'frame.foo.com');
    assert.deepEqual(hierarchy.ancestorsOf(0, 1), ['foo.com']);

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

    hierarchy.updateAncestry({ tabId: 0, frameId: 0, parentFrameId: -1 }, 'foo.com');
    assert.deepEqual(hierarchy.ancestorsOf(0, 0), []);

    hierarchy.updateAncestry({ tabId: 0, frameId: 1, parentFrameId: 0 }, 'frame.foo.com');
    assert.deepEqual(hierarchy.ancestorsOf(0, 1), ['foo.com']);

    hierarchy.updateAncestry({ tabId: 0, frameId: 2, parentFrameId: 1 }, 'bar.com');
    assert.deepEqual(hierarchy.ancestorsOf(0, 2).reverse(), ['foo.com', 'frame.foo.com']);

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
      hierarchy.updateAncestry(
        { tabId: 0, frameId: 0, parentFrameId: -1, documentId: 'A0' },
        'about:blank',
      );
      assert.deepEqual(hierarchy.ancestorsOf(0, 0), []);

      // Assume there's a pre-rendering frame as the user types
      // into the omnibox or the address bar.
      hierarchy.updateAncestry(
        { tabId: 0, frameId: 1_000, parentFrameId: 0, documentId: 'Z0' },
        'foo.com',
      );
      assert.deepEqual(hierarchy.ancestorsOf(0, 1_000), ['about:blank']);

      // The pre-rendering frame calls another frame.
      hierarchy.updateAncestry(
        { tabId: 0, frameId: 1_001, parentFrameId: 1_000, documentId: 'Z1' },
        'frame.foo.com',
      );
      assert.deepEqual(hierarchy.ancestorsOf(0, 1_001).reverse(), ['about:blank', 'foo.com']);

      // The pre-rendered frame gets replaced into main frame.
      hierarchy.updateAncestry(
        { tabId: 0, frameId: 0, parentFrameId: -1, documentId: 'Z0' },
        'foo.com',
      );
      assert.deepEqual(hierarchy.ancestorsOf(0, 0), []);

      hierarchy.updateAncestry(
        { tabId: 0, frameId: 1_001, parentFrameId: 0, documentId: 'Z1' },
        'frame.foo.com',
      );
      assert.deepEqual(hierarchy.ancestorsOf(0, 1_001), ['foo.com']);

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
      hierarchy.updateAncestry(
        { tabId: 0, frameId: 0, parentFrameId: -1, documentId: 'A0' },
        'about:blank',
      );
      assert.deepEqual(hierarchy.ancestorsOf(0, 0), []);

      // Assume that a user navigates the tab into the website.
      hierarchy.updateAncestry(
        { tabId: 0, frameId: 0, parentFrameId: -1, documentId: 'B1' },
        'foo.com',
      );
      assert.deepEqual(hierarchy.ancestorsOf(0, 0), []);

      // Assume the page creates some frames.
      hierarchy.updateAncestry(
        { tabId: 0, frameId: 1, parentFrameId: 0, documentId: 'B2' },
        'oauth.foo.com',
      );
      assert.deepEqual(hierarchy.ancestorsOf(0, 1), ['foo.com']);

      hierarchy.updateAncestry(
        { tabId: 0, frameId: 2, parentFrameId: 0, documentId: 'B3' },
        'consent.foo.com',
      );
      assert.deepEqual(hierarchy.ancestorsOf(0, 2), ['foo.com']);

      // Assume user refreshes the page.
      hierarchy.updateAncestry(
        { tabId: 0, frameId: 0, parentFrameId: -1, documentId: 'C1' },
        'foo.com',
      );
      assert.deepEqual(hierarchy.ancestorsOf(0, 0), []);

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

  describe('ancestorsOf', () => {
    it('returns the tracked ancestor chain without mutating the hierarchy', () => {
      const hierarchy = new FramesHierarchy();

      hierarchy.updateAncestry({ tabId: 0, frameId: 0, parentFrameId: -1 }, 'foo.com');
      hierarchy.updateAncestry({ tabId: 0, frameId: 1, parentFrameId: 0 }, 'frame.foo.com');
      hierarchy.updateAncestry({ tabId: 0, frameId: 2, parentFrameId: 1 }, 'frameof.frame.foo.com');

      const before = structuredClone(hierarchy.tabs);

      assert.deepEqual(hierarchy.ancestorsOf(0, 2).reverse(), ['foo.com', 'frame.foo.com']);
      assert.deepEqual(hierarchy.ancestorsOf(0, 1), ['foo.com']);
      assert.deepEqual(hierarchy.ancestorsOf(0, 0), []);

      assert.deepEqual(hierarchy.tabs, before);
    });

    it('returns an empty chain for unknown tabs and frames', () => {
      const hierarchy = new FramesHierarchy();

      assert.deepEqual(hierarchy.ancestorsOf(0, 1), []);

      hierarchy.updateAncestry({ tabId: 0, frameId: 0, parentFrameId: -1 }, 'foo.com');

      assert.deepEqual(hierarchy.ancestorsOf(0, 1), []);
    });

    it('returns an empty chain when the hierarchy is incomplete', () => {
      const hierarchy = new FramesHierarchy();

      hierarchy.updateAncestry({ tabId: 0, frameId: 0, parentFrameId: -1 }, 'foo.com');
      hierarchy.tabs[0].frames.push({ id: 2, parent: 1, documentId: '', details: 'orphan.com' });

      assert.deepEqual(hierarchy.ancestorsOf(0, 2), []);
    });
  });
});
