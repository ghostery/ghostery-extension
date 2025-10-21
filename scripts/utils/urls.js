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
import { resolve } from 'node:path';

export const CDN_HOSTNAME = process.argv.includes('--staging')
  ? 'staging-cdn.ghostery.com'
  : 'cdn.ghostery.com';

export const RESOURCES_PATH = resolve('src/rule_resources');
