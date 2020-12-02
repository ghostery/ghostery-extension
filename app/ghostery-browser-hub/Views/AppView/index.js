/**
 * Point of entry index.js file for Ghostery Browser Hub App View
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2020 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import { buildReduxHOC } from '../../../shared-hub/utils';

import AppView from './AppView';
import setToast from './AppViewActions';
import AppViewReducer from './AppViewReducer';

export const reducer = AppViewReducer;

export default buildReduxHOC(['app'], { setToast }, AppView);
