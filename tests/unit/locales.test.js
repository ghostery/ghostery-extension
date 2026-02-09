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
import fs from 'node:fs';
import path from 'node:path';

const localesDir = path.join(process.cwd(), 'src', '_locales');

describe('Locales', () => {
  const locales = fs.readdirSync(localesDir).filter((file) => {
    return fs.statSync(path.join(localesDir, file)).isDirectory();
  });

  locales.forEach((locale) => {
    describe(locale, () => {
      const messagesPath = path.join(localesDir, locale, 'messages.json');
      const messages = JSON.parse(fs.readFileSync(messagesPath, 'utf8'));

      it('manifest_name should be 40 chars or less', () => {
        const manifestName = messages.manifest_name?.message;

        assert.ok(
          manifestName.length <= 40,
          `manifest_name length is ${manifestName.length}, expected <= 40`,
        );
      });

      it('manifest_short_description should be 112 chars or less', () => {
        const manifestDescription =
          messages.manifest_short_description?.message;

        assert.ok(
          manifestDescription.length <= 112,
          `manifest_short_description length is ${manifestDescription.length}, expected <= 112`,
        );
      });
    });
  });
});
