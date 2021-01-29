/**
 * Point of entry index.js file for Dawn Hub onboarding flow Success View
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2021 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import SuccessView from './SuccessView';
import { buildReduxHOC } from '../../../../shared-hub/utils';
import sendPing from '../../../../shared-hub/actions/MetricsActions';

const actionCreators = {
	sendPing
};

export default buildReduxHOC(null, actionCreators, SuccessView);
