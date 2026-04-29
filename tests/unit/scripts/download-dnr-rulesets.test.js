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

import { filterMetadata } from '../../../scripts/utils/filter-metadata.js';

describe('Download DNR Rulesets', () => {
  it('filter metadata with always truthy conditions', () => {
    const metadataFilterOut = {
      // Always truthy, should be filtered out
      notAdguard: { preprocessor: '!adguard' },
      // Always truthy, should be filtered out
      notAdguardAndNotSafari: { preprocessor: '!adguard&&!ext_abp' },
      // Contains two unsupported envs, but OR makes it to only yield true
      notAdguardOrSafari: { preprocessor: '!adguard||ext_abp' },
    };

    const metadataKeep = {
      // Not supported - should be kept as results to false
      adguard: { preprocessor: 'adguard' },
      // Contains one supported env, but can still yield both true and false
      notAdguardAndNotEdge: { preprocessor: '!adguard&&!env_edge' },
      // Contains only supported envs, so it can yield both true and false
      notEdge: { preprocessor: '!env_edge' },
    };

    const metadata = {
      ...metadataFilterOut,
      ...metadataKeep,
    };

    assert.deepEqual(filterMetadata(metadata), metadataKeep);
  });
});
